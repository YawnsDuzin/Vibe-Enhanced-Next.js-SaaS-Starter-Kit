/**
 * 통합 결제 시스템
 * 리전에 따라 Stripe 또는 토스페이먼츠를 자동 선택
 */

import Stripe from 'stripe';
import { detectRegionServer, getPaymentProvider, getCurrency, getRegionInfo } from './region';
import {
  confirmTossPayment,
  getTossPayment,
  cancelTossPayment,
  issueTossBillingKey,
  chargeTossBilling,
  generateOrderId,
  getTossClientKey,
  type TossPaymentResponse,
} from './toss';
import {
  type PaymentProvider,
  type PaymentRegion,
  type PaymentRequest,
  type PaymentResult,
  type PaymentSession,
  type PlanType,
  PLANS,
  getPlanPrice,
} from './types';

// Stripe 클라이언트 (지연 초기화)
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
      typescript: true,
    });
  }
  return stripeClient;
}

/**
 * 결제 세션 생성 (통합)
 */
export async function createPaymentSession(
  request: PaymentRequest
): Promise<PaymentSession> {
  const region = request.region || (await detectRegionServer());
  const provider = getPaymentProvider(region);
  const currency = getCurrency(region);

  if (provider === 'stripe') {
    return createStripeSession(request, currency);
  } else {
    return createTossSession(request, currency);
  }
}

/**
 * Stripe 결제 세션 생성
 */
async function createStripeSession(
  request: PaymentRequest,
  currency: string
): Promise<PaymentSession> {
  const stripe = getStripe();

  // 고객 조회 또는 생성
  const existingCustomers = await stripe.customers.list({
    email: request.email,
    limit: 1,
  });

  let customer: Stripe.Customer;
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: request.email,
      name: request.name,
      metadata: { userId: request.userId },
    });
  }

  const plan = PLANS[request.plan as PlanType];
  if (!plan || !plan.priceId.stripe) {
    throw new Error('Invalid plan or plan not configured for Stripe');
  }

  // Checkout 세션 생성
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId.stripe,
        quantity: 1,
      },
    ],
    success_url: request.successUrl,
    cancel_url: request.cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      userId: request.userId,
      plan: request.plan,
    },
  });

  return {
    id: session.id,
    provider: 'stripe',
    url: session.url || undefined,
    amount: request.amount,
    currency,
    status: 'pending',
  };
}

/**
 * 토스페이먼츠 결제 세션 생성
 */
async function createTossSession(
  request: PaymentRequest,
  currency: string
): Promise<PaymentSession> {
  const plan = PLANS[request.plan as PlanType];
  if (!plan) {
    throw new Error('Invalid plan');
  }

  const orderId = generateOrderId();
  const amount = getPlanPrice(request.plan as PlanType, 'KR');

  return {
    id: orderId,
    provider: 'toss',
    clientKey: getTossClientKey(),
    orderId,
    amount,
    currency,
    status: 'pending',
  };
}

/**
 * 토스페이먼츠 결제 승인 처리
 */
export async function confirmPayment(
  provider: PaymentProvider,
  params: {
    paymentKey?: string;
    orderId?: string;
    amount?: number;
    sessionId?: string;
  }
): Promise<PaymentResult> {
  if (provider === 'toss') {
    if (!params.paymentKey || !params.orderId || !params.amount) {
      return {
        success: false,
        provider: 'toss',
        error: 'Missing required parameters for Toss payment',
      };
    }

    try {
      const result = await confirmTossPayment({
        paymentKey: params.paymentKey,
        orderId: params.orderId,
        amount: params.amount,
      });

      return {
        success: result.status === 'DONE',
        provider: 'toss',
        paymentKey: result.paymentKey,
        orderId: result.orderId,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'toss',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  } else {
    // Stripe는 웹훅으로 처리되므로 여기서는 세션 상태만 확인
    if (!params.sessionId) {
      return {
        success: false,
        provider: 'stripe',
        error: 'Missing session ID',
      };
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(params.sessionId);

      return {
        success: session.payment_status === 'paid',
        provider: 'stripe',
        subscriptionId: session.subscription as string,
        customerId: session.customer as string,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'stripe',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * 결제 취소
 */
export async function cancelPayment(
  provider: PaymentProvider,
  params: {
    paymentKey?: string;
    subscriptionId?: string;
    reason: string;
    amount?: number;
  }
): Promise<PaymentResult> {
  if (provider === 'toss') {
    if (!params.paymentKey) {
      return {
        success: false,
        provider: 'toss',
        error: 'Missing payment key',
      };
    }

    try {
      await cancelTossPayment({
        paymentKey: params.paymentKey,
        cancelReason: params.reason,
        cancelAmount: params.amount,
      });

      return {
        success: true,
        provider: 'toss',
        paymentKey: params.paymentKey,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'toss',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  } else {
    if (!params.subscriptionId) {
      return {
        success: false,
        provider: 'stripe',
        error: 'Missing subscription ID',
      };
    }

    try {
      const stripe = getStripe();
      await stripe.subscriptions.update(params.subscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        success: true,
        provider: 'stripe',
        subscriptionId: params.subscriptionId,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'stripe',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * 빌링키 발급 (정기결제용 - 토스)
 */
export async function issueBillingKey(
  customerKey: string,
  authKey: string
): Promise<PaymentResult> {
  try {
    const result = await issueTossBillingKey({ customerKey, authKey });

    return {
      success: true,
      provider: 'toss',
      paymentKey: result.billingKey,
      customerId: result.customerKey,
    };
  } catch (error) {
    return {
      success: false,
      provider: 'toss',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 정기 결제 실행 (토스 빌링키 사용)
 */
export async function chargeSubscription(
  billingKey: string,
  customerKey: string,
  amount: number,
  orderName: string
): Promise<PaymentResult> {
  try {
    const orderId = generateOrderId();
    const result = await chargeTossBilling({
      billingKey,
      customerKey,
      amount,
      orderId,
      orderName,
    });

    return {
      success: result.status === 'DONE',
      provider: 'toss',
      paymentKey: result.paymentKey,
      orderId: result.orderId,
    };
  } catch (error) {
    return {
      success: false,
      provider: 'toss',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stripe 고객 포털 세션 생성
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

// Re-export types and utilities
export * from './types';
export * from './region';
export { getTossClientKey, generateOrderId, TOSS_AVAILABLE_METHODS, TOSS_PAYMENT_METHODS } from './toss';
