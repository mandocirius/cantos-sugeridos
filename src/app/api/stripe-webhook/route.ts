import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${message}`);
    return NextResponse.json({ message: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.CheckoutSession;
      // Fulfill the purchase... or send email
      console.log('Checkout session completed:', checkoutSession.id);
      // Example: Send email notification for successful checkout
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await fetch(`${req.nextUrl.origin}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: adminEmail,
              subject: 'Nueva Suscripción - Pago Completado',
              html: `
                <p>¡Una nueva suscripción ha sido pagada!</p>
                <p>ID de Sesión de Checkout: ${checkoutSession.id}</p>
                <p>Cliente: ${checkoutSession.customer_details?.email || 'N/A'}</p>
                <p>Monto Total: ${checkoutSession.amount_total ? (checkoutSession.amount_total / 100).toFixed(2) : 'N/A'} ${checkoutSession.currency?.toUpperCase() || ''}</p>
              `,
            }),
          });
          console.log('Email notification sent for checkout.session.completed.');
        } else {
          console.warn('ADMIN_EMAIL is not set. Email notification for checkout.session.completed skipped.');
        }
      } catch (emailError) {
        console.error('Failed to send email notification for checkout.session.completed:', emailError);
      }
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('Subscription created:', subscription.id);
      // Example: Send email notification for new subscription
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await fetch(`${req.nextUrl.origin}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: adminEmail,
              subject: 'Nueva Suscripción Creada',
              html: `
                <p>¡Una nueva suscripción ha sido creada!</p>
                <p>ID de Suscripción: ${subscription.id}</p>
                <p>Cliente: ${subscription.customer}</p>
                <p>Estado: ${subscription.status}</p>
              `,
            }),
          });
          console.log('Email notification sent for customer.subscription.created.');
        } else {
          console.warn('ADMIN_EMAIL is not set. Email notification for customer.subscription.created skipped.');
        }
      } catch (emailError) {
        console.error('Failed to send email notification for customer.subscription.created:', emailError);
      }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
