import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

// Initialize Stripe if secret is configured and not placeholder
const stripe = stripeSecret && !stripeSecret.includes('placeholder')
  ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' as any })
  : null;

export async function POST(request: Request) {
  try {
    const { items, discountAmount, successUrl, cancelUrl } = await request.json();

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

    // Create Checkout Session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}${successUrl}`,
      cancel_url: `${request.headers.get('origin')}${cancelUrl}`,
    };

    if (discountAmount && discountAmount > 0) {
      try {
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: 'usd',
          duration: 'once',
          name: 'Applied Discount',
        });
        sessionParams.discounts = [{ coupon: coupon.id }];
      } catch (couponError) {
        console.error('Failed to create Stripe coupon:', couponError);
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe session creation failed:', error);
    return NextResponse.json({ error: error.message || 'Payment setup failed' }, { status: 500 });
  }
}
