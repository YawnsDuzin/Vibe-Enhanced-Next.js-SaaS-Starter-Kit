'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Check, Sparkles, Zap, Building2, Crown } from 'lucide-react';
import { useEffect } from 'react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'For individuals getting started',
    icon: Sparkles,
    features: [
      '5 AI prompts per day',
      'Basic templates',
      'Community support',
      '1 team member',
    ],
    priceId: null,
    popular: false,
  },
  {
    name: 'Starter',
    price: 19,
    description: 'For small teams and growing businesses',
    icon: Zap,
    features: [
      '100 AI prompts per day',
      'All templates',
      'Email support',
      '5 team members',
      'API access',
    ],
    priceId: 'STARTER',
    popular: true,
  },
  {
    name: 'Pro',
    price: 49,
    description: 'For larger teams with advanced needs',
    icon: Crown,
    features: [
      'Unlimited AI prompts',
      'All templates + custom',
      'Priority support',
      '20 team members',
      'Advanced API access',
      'Custom integrations',
    ],
    priceId: 'PRO',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'For large organizations',
    icon: Building2,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
      'SSO/SAML',
    ],
    priceId: 'ENTERPRISE',
    popular: false,
  },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan] = useState('FREE'); // This would come from user's subscription

  useEffect(() => {
    if (searchParams.get('success')) {
      toast.success('Subscription successful! Welcome to your new plan.');
    }
    if (searchParams.get('canceled')) {
      toast.info('Checkout canceled. You can try again anytime.');
    }
  }, [searchParams]);

  const handleSubscribe = async (planId: string) => {
    if (!planId) return;

    setLoading(planId);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to start checkout');
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

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
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the{' '}
            <span className="font-semibold">{currentPlan}</span> plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleManageBilling}
            loading={loading === 'portal'}
          >
            Manage Billing
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toUpperCase();
            const Icon = plan.icon;

            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular ? 'border-primary shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || !plan.priceId}
                    loading={loading === plan.priceId}
                    onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
