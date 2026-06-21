import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

// Initialize Stripe if secret is configured and not placeholder
const stripe = stripeSecret && !stripeSecret.includes('placeholder')
  ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' as any })
  : null;

export async function POST(request: Request) {
  try {
    const { items, successUrl, cancelUrl } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // If Stripe is not configured, return simulated payment route URL
    if (!stripe) {
      console.log('Stripe not configured. Returning simulated checkout.');
      return NextResponse.json({ url: '/simulated-payment' });
    }

    // Create line items for Stripe Checkout
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.food.name,
          images: [item.food.cover_pic],
        },
        unit_amount: Math.round(item.food.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}${successUrl}`,
      cancel_url: `${request.headers.get('origin')}${cancelUrl}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe session creation failed:', error);
    return NextResponse.json({ error: error.message || 'Payment setup failed' }, { status: 500 });
  }
}
