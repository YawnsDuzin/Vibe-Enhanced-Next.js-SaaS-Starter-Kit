import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createCheckoutSession, createOrGetCustomer, PLANS } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import type { PlanType } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body as { plan: PlanType };

    if (!plan || !PLANS[plan] || !PLANS[plan].priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create Stripe customer
    const customer = await createOrGetCustomer({
      email: session.user.email,
      name: session.user.name || undefined,
      userId: session.user.id,
    });

    // Check if user already has a subscription with this customer
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        stripeCustomerId: customer.id,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription?.stripeSubscriptionId) {
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
    await db.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        stripeCustomerId: customer.id,
        plan: 'FREE',
        status: 'ACTIVE',
      },
      update: {
        stripeCustomerId: customer.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
