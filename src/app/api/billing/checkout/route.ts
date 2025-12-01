import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  createPaymentSession,
  detectRegionServer,
  getPaymentProvider,
  getPlanPrice,
  PLANS,
  type PlanType,
  type PaymentRegion,
} from '@/lib/payments';
import { absoluteUrl } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, region: clientRegion } = body as { plan: PlanType; region?: PaymentRegion };

    // 플랜 검증
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 무료 플랜은 결제 불필요
    if (plan === 'FREE') {
      return NextResponse.json({ error: 'Free plan does not require payment' }, { status: 400 });
    }

    // 리전 감지 (클라이언트 제공값 우선, 없으면 서버에서 감지)
    const region = clientRegion || (await detectRegionServer());
    const provider = getPaymentProvider(region);
    const amount = getPlanPrice(plan, region);

    const supabase = await createClient();

    // 이미 활성 구독이 있는지 확인
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .single();

    if (existingSubscription?.plan !== 'FREE') {
      return NextResponse.json(
        { error: '이미 활성화된 구독이 있습니다. 결제 관리에서 변경해주세요.' },
        { status: 400 }
      );
    }

    // 결제 세션 생성
    const session = await createPaymentSession({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      plan,
      amount,
      successUrl: absoluteUrl('/dashboard/billing?success=true'),
      cancelUrl: absoluteUrl('/dashboard/billing?canceled=true'),
      region,
    });

    // 토스페이먼츠의 경우 클라이언트에서 SDK로 결제 진행
    if (provider === 'toss') {
      return NextResponse.json({
        provider: 'toss',
        clientKey: session.clientKey,
        orderId: session.orderId,
        amount: session.amount,
        orderName: `${PLANS[plan].name} 월간 구독`,
        customerName: user.name || user.email,
        customerEmail: user.email,
        successUrl: absoluteUrl('/api/billing/toss/success'),
        failUrl: absoluteUrl('/api/billing/toss/fail'),
        plan,
      });
    }

    // Stripe의 경우 리다이렉트 URL 반환
    return NextResponse.json({
      provider: 'stripe',
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: '결제 세션 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
