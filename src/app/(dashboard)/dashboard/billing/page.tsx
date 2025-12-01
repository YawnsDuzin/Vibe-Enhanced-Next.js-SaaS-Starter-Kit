'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Check, Sparkles, Zap, Building2, Crown, Globe, CreditCard } from 'lucide-react';
import {
  PLANS,
  type PlanType,
  type PaymentRegion,
  detectRegionClient,
  formatPrice,
  getCurrency,
} from '@/lib/payments';

// Toss Payments SDK types
interface TossPaymentsInstance {
  requestPayment: (
    method: string,
    options: {
      amount: number;
      orderId: string;
      orderName: string;
      customerName?: string;
      customerEmail?: string;
      successUrl: string;
      failUrl: string;
    }
  ) => Promise<void>;
}

// Dynamically load Toss Payments SDK
async function loadTossPayments(clientKey: string): Promise<TossPaymentsInstance> {
  // Check if already loaded
  if (typeof window !== 'undefined' && (window as unknown as { TossPayments?: unknown }).TossPayments) {
    return (window as unknown as { TossPayments: (key: string) => TossPaymentsInstance }).TossPayments(clientKey);
  }

  // Load the SDK script
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v1/payment';
    script.onload = () => {
      if ((window as unknown as { TossPayments?: unknown }).TossPayments) {
        resolve((window as unknown as { TossPayments: (key: string) => TossPaymentsInstance }).TossPayments(clientKey));
      } else {
        reject(new Error('Failed to load TossPayments SDK'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load TossPayments SDK'));
    document.head.appendChild(script);
  });
}

const planIcons = {
  FREE: Sparkles,
  STARTER: Zap,
  PRO: Crown,
  ENTERPRISE: Building2,
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
  const [region, setRegion] = useState<PaymentRegion>('GLOBAL');
  const [isLoadingRegion, setIsLoadingRegion] = useState(true);

  // Detect region on mount
  useEffect(() => {
    const detectedRegion = detectRegionClient();
    setRegion(detectedRegion);
    setIsLoadingRegion(false);
  }, []);

  // Handle URL params for success/error messages
  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success(
        region === 'KR'
          ? '구독이 완료되었습니다! 새로운 플랜을 이용하세요.'
          : 'Subscription successful! Welcome to your new plan.'
      );
    }
    if (searchParams.get('canceled')) {
      toast.info(
        region === 'KR'
          ? '결제가 취소되었습니다. 언제든 다시 시도하세요.'
          : 'Checkout canceled. You can try again anytime.'
      );
    }
    if (searchParams.get('error')) {
      const message = searchParams.get('message');
      toast.error(
        message
          ? decodeURIComponent(message)
          : region === 'KR'
          ? '결제 처리 중 오류가 발생했습니다.'
          : 'An error occurred during payment.'
      );
    }
  }, [searchParams, region]);

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/billing/subscription');
        if (response.ok) {
          const data = await response.json();
          if (data.subscription?.plan) {
            setCurrentPlan(data.subscription.plan as PlanType);
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    };
    fetchSubscription();
  }, []);

  const handleSubscribe = useCallback(async (planId: PlanType) => {
    if (!planId || planId === 'FREE') return;

    setLoading(planId);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, region }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to start checkout');
        return;
      }

      // Handle based on payment provider
      if (data.provider === 'toss') {
        // Initialize Toss Payments SDK
        try {
          const tossPayments = await loadTossPayments(data.clientKey);
          await tossPayments.requestPayment('카드', {
            amount: data.amount,
            orderId: data.orderId,
            orderName: data.orderName,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            successUrl: data.successUrl,
            failUrl: data.failUrl,
          });
        } catch (error) {
          console.error('Toss payment error:', error);
          toast.error('결제를 시작할 수 없습니다. 다시 시도해주세요.');
        }
      } else {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch {
      toast.error(
        region === 'KR'
          ? '오류가 발생했습니다. 다시 시도해주세요.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(null);
    }
  }, [region]);

  const handleManageBilling = async () => {
    setLoading('portal');
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to open billing portal');
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error(
        region === 'KR'
          ? '오류가 발생했습니다. 다시 시도해주세요.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(null);
    }
  };

  const toggleRegion = () => {
    setRegion(region === 'KR' ? 'GLOBAL' : 'KR');
  };

  const currency = getCurrency(region);
  const isKorean = region === 'KR';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isKorean ? '결제 및 구독' : 'Billing'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isKorean
              ? '구독 및 결제 정보를 관리하세요'
              : 'Manage your subscription and billing information'}
          </p>
        </div>

        {/* Region Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleRegion}
          className="flex items-center gap-2"
          disabled={isLoadingRegion}
        >
          <Globe className="h-4 w-4" />
          {isKorean ? '한국' : 'Global'}
          <CreditCard className="h-4 w-4 ml-1" />
          {isKorean ? '토스페이먼츠' : 'Stripe'}
        </Button>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>{isKorean ? '현재 플랜' : 'Current Plan'}</CardTitle>
          <CardDescription>
            {isKorean ? (
              <>
                현재 <span className="font-semibold">{PLANS[currentPlan]?.name || currentPlan}</span> 플랜을
                이용 중입니다
              </>
            ) : (
              <>
                You are currently on the{' '}
                <span className="font-semibold">{PLANS[currentPlan]?.nameEn || currentPlan}</span> plan
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={loading === 'portal'}
          >
            {loading === 'portal'
              ? isKorean
                ? '로딩 중...'
                : 'Loading...'
              : isKorean
              ? '결제 관리'
              : 'Manage Billing'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {isKorean ? '이용 가능한 플랜' : 'Available Plans'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(
            ([planId, plan]) => {
              const isCurrentPlan = currentPlan === planId;
              const Icon = planIcons[planId];
              const price = plan.price[currency];
              const features = isKorean ? plan.features : plan.featuresEn;
              const isPopular = planId === 'STARTER';

              return (
                <Card
                  key={planId}
                  className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      {isKorean ? '인기' : 'Most Popular'}
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{isKorean ? plan.name : plan.nameEn}</CardTitle>
                    </div>
                    <CardDescription>
                      {isKorean ? plan.description : plan.descriptionEn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {formatPrice(price, region)}
                      </span>
                      <span className="text-muted-foreground">
                        /{isKorean ? '월' : 'month'}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? 'outline' : 'default'}
                      disabled={isCurrentPlan || planId === 'FREE' || loading === planId}
                      onClick={() => handleSubscribe(planId)}
                    >
                      {loading === planId
                        ? isKorean
                          ? '처리 중...'
                          : 'Processing...'
                        : isCurrentPlan
                        ? isKorean
                          ? '현재 플랜'
                          : 'Current Plan'
                        : planId === 'FREE'
                        ? isKorean
                          ? '무료'
                          : 'Free'
                        : isKorean
                        ? '구독하기'
                        : 'Subscribe'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Payment Provider Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            {isKorean ? (
              <span>
                결제는 <strong>토스페이먼츠</strong>를 통해 안전하게 처리됩니다.
                신용카드, 체크카드, 계좌이체 등을 지원합니다.
              </span>
            ) : (
              <span>
                Payments are securely processed through <strong>Stripe</strong>.
                We accept all major credit cards and payment methods.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
