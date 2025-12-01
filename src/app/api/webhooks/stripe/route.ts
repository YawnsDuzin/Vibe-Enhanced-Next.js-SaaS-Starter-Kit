import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, getPlanByPriceId } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get customer to find user
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return;

  const userId = customer.metadata?.userId;
  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanByPriceId(priceId);

  // Update or create subscription record
  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: 'ACTIVE',
      plan: plan || 'STARTER',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: 'ACTIVE',
      plan: plan || 'STARTER',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: false,
    },
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanByPriceId(priceId);

  // Find subscription by Stripe customer ID
  const existingSubscription = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) {
    console.error('Subscription not found for customer:', customerId);
    return;
  }

  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    unpaid: 'UNPAID',
    paused: 'ACTIVE', // Treat paused as active for now
  };

  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: statusMap[subscription.status] as 'ACTIVE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID',
      plan: plan || existingSubscription.plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const existingSubscription = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) return;

  // Downgrade to free plan
  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'CANCELED',
      plan: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
      cancelAtPeriodEnd: false,
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const existingSubscription = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existingSubscription) return;

  await db.invoice.create({
    data: {
      subscriptionId: existingSubscription.id,
      stripeInvoiceId: invoice.id,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status || 'paid',
      invoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const existingSubscription = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!existingSubscription) return;

  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'PAST_DUE',
    },
  });

  // TODO: Send email notification about failed payment
}
