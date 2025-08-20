import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use the latest API version
});

export async function POST(req: NextRequest) {
  try {
    // You would typically get the priceId from your frontend,
    // based on the subscription plan the user selected.
    // For now, we'll use a placeholder.
    // Make sure to create this product and price in your Stripe Dashboard.
    const priceId = 'price_1RsE8CAhajhc2ULmiNjcj1yd'; // REPLACE WITH YOUR ACTUAL STRIPE PRICE ID FOR MONTHLY SUBSCRIPTION

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // These URLs will be redirected to after successful payment or cancellation
      success_url: `${req.nextUrl.origin}/success`, // Replace with your actual success page URL
      cancel_url: `${req.nextUrl.origin}/cancel`,   // Replace with your actual cancel page URL
      automatic_tax: { enabled: true }, // Enable automatic tax calculation if needed
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
