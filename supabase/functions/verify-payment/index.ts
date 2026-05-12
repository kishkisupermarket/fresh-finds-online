import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "Missing session_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-12-18.acacia",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Payment not completed", status: session.payment_status }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotency: return existing order if already saved
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ order: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const m = session.metadata || {};
    const insertRow = {
      customer_name: m.customer_name || "",
      customer_email: session.customer_email || "",
      customer_phone: m.customer_phone || "",
      delivery_method: (m.delivery_method as "delivery" | "pickup") || "pickup",
      delivery_address: m.delivery_address || null,
      delivery_city: m.delivery_city || null,
      delivery_fee: Number(m.delivery_fee || 0),
      delivery_date: m.delivery_date || null,
      items: JSON.parse(m.items || "[]"),
      subtotal: Number(m.subtotal || 0),
      total: Number(m.total || 0),
      status: "new" as const,
      paid: true,
      stripe_session_id: session_id,
    };

    const { data: order, error } = await supabase
      .from("orders")
      .insert(insertRow)
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
