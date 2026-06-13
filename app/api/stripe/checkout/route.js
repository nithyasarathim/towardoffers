import { NextResponse } from "next/server";

const priceIds = {
  starter: "STRIPE_STARTER_PRICE_ID",
  pro: "STRIPE_PRO_PRICE_ID",
};

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY in .env" }, { status: 500 });
  }

  const { planId } = await request.json();
  const priceEnvKey = priceIds[planId];
  const priceId = priceEnvKey ? process.env[priceEnvKey] : null;

  if (!priceId) {
    return NextResponse.json({ error: `Missing Stripe price id for ${planId}` }, { status: 400 });
  }

  const appUrl = getAppUrl();
  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "payment",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${appUrl}/checkout/success?plan=${encodeURIComponent(planId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      "metadata[planId]": planId,
    }),
  });

  const session = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return NextResponse.json({ error: session.error?.message || "Stripe checkout failed" }, { status: stripeResponse.status });
  }

  return NextResponse.json({ url: session.url });
}
