import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      items,
      customer_name,
      customer_email,
      customer_phone,
      delivery_method,
      delivery_address,
      delivery_city,
      delivery_fee,
      delivery_date,
      subtotal,
      tax,
      total,
    } = body;

    if (!items?.length || !customer_email || !customer_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-12-18.acacia",
    });

    const line_items = items.map((i: any) => ({
      price_data: {
        currency: "cad",
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    }));

    // Add tax as a single line item
    if (tax > 0) {
      line_items.push({
        price_data: {
          currency: "cad",
          product_data: { name: "HST (13%)" },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    if (delivery_method === "delivery" && delivery_fee > 0) {
      line_items.push({
        price_data: {
          currency: "cad",
          product_data: { name: `Delivery Fee (${delivery_city})` },
          unit_amount: Math.round(delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email,
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        customer_name,
        customer_phone,
        delivery_method,
        delivery_address: delivery_address || "",
        delivery_city: delivery_city || "",
        delivery_fee: String(delivery_fee || 0),
        delivery_date: delivery_date || "",
        subtotal: String(subtotal),
        tax: String(tax),
        total: String(total),
        items: JSON.stringify(items),
      },
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
