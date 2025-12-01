import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: 'Free',
    description: 'For individuals getting started',
    price: 0,
    priceId: null,
    features: [
      '5 AI prompts per day',
      'Basic templates',
      'Community support',
      '1 team member',
    ],
    limits: {
      promptsPerDay: 5,
      teamMembers: 1,
      projects: 3,
    },
  },
  STARTER: {
    name: 'Starter',
    description: 'For small teams and growing businesses',
    price: 19,
    priceId: process.env.STRIPE_PRICE_ID_STARTER,
    features: [
      '100 AI prompts per day',
      'All templates',
      'Email support',
      '5 team members',
      'API access',
    ],
    limits: {
      promptsPerDay: 100,
      teamMembers: 5,
      projects: 10,
    },
  },
  PRO: {
    name: 'Pro',
    description: 'For larger teams with advanced needs',
    price: 49,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    features: [
      'Unlimited AI prompts',
      'All templates + custom',
      'Priority support',
      '20 team members',
      'Advanced API access',
      'Custom integrations',
    ],
    limits: {
      promptsPerDay: -1, // unlimited
      teamMembers: 20,
      projects: -1,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
      'SSO/SAML',
    ],
    limits: {
      promptsPerDay: -1,
      teamMembers: -1,
      projects: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanType;
    }
  }
  return null;
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function createOrGetCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name?: string;
  userId: string;
}) {
  // Try to find existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function resumeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
