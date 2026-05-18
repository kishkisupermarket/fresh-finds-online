import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-12-18.acacia",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") throw new Error("Payment not completed");

    const m = session.metadata!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing) {
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", existing.id)
        .single();
      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session_id,
        customer_name: m.customer_name,
        customer_email: session.customer_email,
        customer_phone: m.customer_phone,
        delivery_method: m.delivery_method,
        delivery_address: m.delivery_address || null,
        delivery_city: m.delivery_city || null,
        delivery_fee: Number(m.delivery_fee),
        delivery_date: m.delivery_date || null,
        items: JSON.parse(m.items),
        subtotal: Number(m.subtotal),
        total: Number(m.total),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ order }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("verify-payment error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});