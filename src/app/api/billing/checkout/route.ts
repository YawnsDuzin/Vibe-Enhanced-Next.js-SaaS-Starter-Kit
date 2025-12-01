import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession, createOrGetCustomer, PLANS } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import type { PlanType } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body as { plan: PlanType };

    if (!plan || !PLANS[plan] || !PLANS[plan].priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create Stripe customer
    const customer = await createOrGetCustomer({
      email: user.email,
      name: user.name || undefined,
      userId: user.id,
    });

    const supabase = await createClient();

    // Check if user already has an active subscription with this customer
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('stripe_customer_id', customer.id)
      .eq('status', 'ACTIVE')
      .single();

    if (existingSubscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please manage it from the billing portal.' },
        { status: 400 }
      );
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: customer.id,
      priceId: PLANS[plan].priceId!,
      successUrl: absoluteUrl('/dashboard/billing?success=true'),
      cancelUrl: absoluteUrl('/dashboard/billing?canceled=true'),
    });

    // Store customer ID if not already stored
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customer.id })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: customer.id,
          plan: 'FREE',
          status: 'ACTIVE',
        });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
