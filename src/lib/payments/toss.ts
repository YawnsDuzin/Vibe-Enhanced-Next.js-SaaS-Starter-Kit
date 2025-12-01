/**
 * 토스페이먼츠 결제 연동
 * https://docs.tosspayments.com/
 */

import type { PaymentMethod } from './types';

// 환경 변수
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';
const TOSS_API_URL = 'https://api.tosspayments.com/v1';

// 토스페이먼츠 결제 방법 매핑
export const TOSS_PAYMENT_METHODS: Record<PaymentMethod, string> = {
  card: '카드',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
  toss_pay: '토스페이',
  samsung_pay: '삼성페이',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  bank_transfer: '계좌이체',
  virtual_account: '가상계좌',
};

// 토스페이먼츠 지원 결제 방법
export const TOSS_AVAILABLE_METHODS: PaymentMethod[] = [
  'card',
  'kakao_pay',
  'naver_pay',
  'toss_pay',
  'samsung_pay',
  'bank_transfer',
  'virtual_account',
];

/**
 * 토스페이먼츠 클라이언트 키 반환
 */
export function getTossClientKey(): string {
  return TOSS_CLIENT_KEY;
}

/**
 * 주문 ID 생성
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `ORDER_${timestamp}_${random}`;
}

/**
 * 토스페이먼츠 결제 승인 요청
 */
export async function confirmTossPayment({
  paymentKey,
  orderId,
  amount,
}: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new TossPaymentError(error.code, error.message);
  }

  return response.json();
}

/**
 * 토스페이먼츠 결제 조회
 */
export async function getTossPayment(paymentKey: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new TossPaymentError(error.code, error.message);
  }

  return response.json();
}

/**
 * 토스페이먼츠 결제 취소
 */
export async function cancelTossPayment({
  paymentKey,
  cancelReason,
  cancelAmount,
}: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason,
      ...(cancelAmount && { cancelAmount }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new TossPaymentError(error.code, error.message);
  }

  return response.json();
}

/**
 * 토스페이먼츠 빌링키 발급 (정기결제용)
 */
export async function issueTossBillingKey({
  customerKey,
  authKey,
}: {
  customerKey: string;
  authKey: string;
}): Promise<TossBillingResponse> {
  const response = await fetch(`${TOSS_API_URL}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey,
      authKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new TossPaymentError(error.code, error.message);
  }

  return response.json();
}

/**
 * 토스페이먼츠 빌링키로 자동결제
 */
export async function chargeTossBilling({
  billingKey,
  customerKey,
  amount,
  orderId,
  orderName,
}: {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
}): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/billing/${billingKey}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey,
      amount,
      orderId,
      orderName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new TossPaymentError(error.code, error.message);
  }

  return response.json();
}

/**
 * 웹훅 시그니처 검증
 */
export function verifyTossWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');

  return signature === expectedSignature;
}

// 토스페이먼츠 응답 타입
export interface TossPaymentResponse {
  mId: string;
  version: string;
  paymentKey: string;
  status: 'READY' | 'IN_PROGRESS' | 'WAITING_FOR_DEPOSIT' | 'DONE' | 'CANCELED' | 'PARTIAL_CANCELED' | 'ABORTED' | 'EXPIRED';
  transactionKey: string;
  orderId: string;
  orderName: string;
  requestedAt: string;
  approvedAt?: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card?: TossCardInfo;
  virtualAccount?: TossVirtualAccountInfo;
  transfer?: TossTransferInfo;
  easyPay?: TossEasyPayInfo;
  country: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  method: string;
  receipt?: {
    url: string;
  };
  checkout?: {
    url: string;
  };
  failure?: {
    code: string;
    message: string;
  };
  cancels?: TossCancelInfo[];
}

export interface TossCardInfo {
  company: string;
  number: string;
  installmentPlanMonths: number;
  isInterestFree: boolean;
  interestPayer?: string;
  approveNo: string;
  useCardPoint: boolean;
  cardType: string;
  ownerType: string;
  acquireStatus: string;
  receiptUrl: string;
}

export interface TossVirtualAccountInfo {
  accountType: string;
  accountNumber: string;
  bank: string;
  customerName: string;
  dueDate: string;
  refundStatus: string;
  expired: boolean;
  settlementStatus: string;
}

export interface TossTransferInfo {
  bank: string;
  settlementStatus: string;
}

export interface TossEasyPayInfo {
  provider: string;
  amount: number;
  discountAmount: number;
}

export interface TossCancelInfo {
  cancelAmount: number;
  cancelReason: string;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  refundableAmount: number;
  easyPayDiscountAmount: number;
  canceledAt: string;
  transactionKey: string;
}

export interface TossBillingResponse {
  mId: string;
  customerKey: string;
  authenticatedAt: string;
  method: string;
  billingKey: string;
  card?: {
    company: string;
    number: string;
    cardType: string;
    ownerType: string;
  };
}

// 토스페이먼츠 에러 클래스
export class TossPaymentError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'TossPaymentError';
  }
}

// 토스페이먼츠 웹훅 이벤트 타입
export interface TossWebhookEvent {
  eventType: 'PAYMENT_STATUS_CHANGED' | 'BILLING_STATUS_CHANGED' | 'PAYOUT_STATUS_CHANGED';
  createdAt: string;
  data: TossPaymentResponse | TossBillingResponse;
}
