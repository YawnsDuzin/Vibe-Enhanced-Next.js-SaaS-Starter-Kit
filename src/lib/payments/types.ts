// 결제 제공자 타입 정의
export type PaymentProvider = 'stripe' | 'toss';

// 리전 타입
export type PaymentRegion = 'KR' | 'GLOBAL';

// 결제 방법 타입
export type PaymentMethod =
  | 'card'           // 신용/체크카드
  | 'kakao_pay'      // 카카오페이
  | 'naver_pay'      // 네이버페이
  | 'toss_pay'       // 토스페이
  | 'samsung_pay'    // 삼성페이
  | 'apple_pay'      // Apple Pay
  | 'google_pay'     // Google Pay
  | 'bank_transfer'  // 계좌이체
  | 'virtual_account'; // 가상계좌

// 통합 결제 세션 타입
export interface PaymentSession {
  id: string;
  provider: PaymentProvider;
  url?: string;
  clientKey?: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

// 결제 요청 타입
export interface PaymentRequest {
  userId: string;
  email: string;
  name?: string;
  plan: string;
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  region?: PaymentRegion;
  paymentMethod?: PaymentMethod;
}

// 결제 결과 타입
export interface PaymentResult {
  success: boolean;
  provider: PaymentProvider;
  paymentKey?: string;
  orderId?: string;
  subscriptionId?: string;
  customerId?: string;
  error?: string;
}

// 구독 정보 타입
export interface SubscriptionInfo {
  id: string;
  provider: PaymentProvider;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  plan: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

// 플랜 정보 (한국 원화 가격 포함)
export const PLANS = {
  FREE: {
    name: '무료',
    nameEn: 'Free',
    description: '개인 사용자를 위한 기본 플랜',
    descriptionEn: 'For individuals getting started',
    price: {
      KRW: 0,
      USD: 0,
    },
    priceId: {
      stripe: null,
      toss: null,
    },
    features: {
      KR: [
        '하루 5개 AI 프롬프트',
        '기본 템플릿',
        '커뮤니티 지원',
        '1명의 팀원',
      ],
      EN: [
        '5 AI prompts per day',
        'Basic templates',
        'Community support',
        '1 team member',
      ],
    },
    limits: {
      promptsPerDay: 5,
      teamMembers: 1,
      projects: 3,
    },
  },
  STARTER: {
    name: '스타터',
    nameEn: 'Starter',
    description: '소규모 팀을 위한 플랜',
    descriptionEn: 'For small teams and growing businesses',
    price: {
      KRW: 19000,
      USD: 19,
    },
    priceId: {
      stripe: process.env.STRIPE_PRICE_ID_STARTER || null,
      toss: process.env.TOSS_PRICE_ID_STARTER || 'starter_monthly',
    },
    features: {
      KR: [
        '하루 100개 AI 프롬프트',
        '모든 템플릿',
        '이메일 지원',
        '5명의 팀원',
        'API 액세스',
      ],
      EN: [
        '100 AI prompts per day',
        'All templates',
        'Email support',
        '5 team members',
        'API access',
      ],
    },
    limits: {
      promptsPerDay: 100,
      teamMembers: 5,
      projects: 10,
    },
  },
  PRO: {
    name: '프로',
    nameEn: 'Pro',
    description: '대규모 팀을 위한 고급 플랜',
    descriptionEn: 'For larger teams with advanced needs',
    price: {
      KRW: 49000,
      USD: 49,
    },
    priceId: {
      stripe: process.env.STRIPE_PRICE_ID_PRO || null,
      toss: process.env.TOSS_PRICE_ID_PRO || 'pro_monthly',
    },
    features: {
      KR: [
        '무제한 AI 프롬프트',
        '모든 템플릿 + 커스텀',
        '우선 지원',
        '20명의 팀원',
        '고급 API 액세스',
        '커스텀 통합',
      ],
      EN: [
        'Unlimited AI prompts',
        'All templates + custom',
        'Priority support',
        '20 team members',
        'Advanced API access',
        'Custom integrations',
      ],
    },
    limits: {
      promptsPerDay: -1,
      teamMembers: 20,
      projects: -1,
    },
  },
  ENTERPRISE: {
    name: '엔터프라이즈',
    nameEn: 'Enterprise',
    description: '대기업을 위한 맞춤형 플랜',
    descriptionEn: 'For large organizations',
    price: {
      KRW: 199000,
      USD: 199,
    },
    priceId: {
      stripe: process.env.STRIPE_PRICE_ID_ENTERPRISE || null,
      toss: process.env.TOSS_PRICE_ID_ENTERPRISE || 'enterprise_monthly',
    },
    features: {
      KR: [
        'Pro의 모든 기능',
        '무제한 팀원',
        '전담 지원',
        '커스텀 SLA',
        '온프레미스 옵션',
        'SSO/SAML',
      ],
      EN: [
        'Everything in Pro',
        'Unlimited team members',
        'Dedicated support',
        'Custom SLA',
        'On-premise option',
        'SSO/SAML',
      ],
    },
    limits: {
      promptsPerDay: -1,
      teamMembers: -1,
      projects: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// 플랜 가격 조회 (리전 기반)
export function getPlanPrice(plan: PlanType, region: PaymentRegion): number {
  const currency = region === 'KR' ? 'KRW' : 'USD';
  return PLANS[plan].price[currency];
}

// 플랜 기능 조회 (리전 기반)
export function getPlanFeatures(plan: PlanType, region: PaymentRegion): string[] {
  const lang = region === 'KR' ? 'KR' : 'EN';
  return [...PLANS[plan].features[lang]];
}

// Price ID로 플랜 조회
export function getPlanByPriceId(priceId: string, provider: PaymentProvider): PlanType | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId[provider] === priceId) {
      return key as PlanType;
    }
  }
  return null;
}
