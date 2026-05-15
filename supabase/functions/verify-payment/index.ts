import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log("Retrieved session", session.id, "payment_status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase service role configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: existing, error: selErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (selErr) console.error("select error", selErr);

    if (existing) {
      console.log("Order already exists", existing.id);
      return new Response(JSON.stringify({ order: existing }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const m = session.metadata || {};
    const insertRow = {
      customer_name: m.customer_name || "",
      customer_email: session.customer_email || m.customer_email || "",
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

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      console.error("insert error", error);
      throw error;
    }

    console.log("Order inserted", order.id);
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
