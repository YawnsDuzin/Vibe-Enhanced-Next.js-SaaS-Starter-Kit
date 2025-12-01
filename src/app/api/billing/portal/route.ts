import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createCustomerPortalSession } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription with Stripe customer ID
    const subscription = await db.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 400 }
      );
    }

    // Create customer portal session
    const portalSession = await createCustomerPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: absoluteUrl('/dashboard/billing'),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
