import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmTossPayment, PLANS, type PlanType } from '@/lib/payments';
import { absoluteUrl } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.redirect(
        absoluteUrl('/dashboard/billing?error=missing_params')
      );
    }

    // orderId에서 userId와 plan 추출 (형식: {userId}_{plan}_{timestamp})
    const orderParts = orderId.split('_');
    if (orderParts.length < 3) {
      return NextResponse.redirect(
        absoluteUrl('/dashboard/billing?error=invalid_order')
      );
    }

    const userId = orderParts[0];
    const plan = orderParts[1] as PlanType;

    if (!PLANS[plan]) {
      return NextResponse.redirect(
        absoluteUrl('/dashboard/billing?error=invalid_plan')
      );
    }

    // 토스페이먼츠 결제 승인
    const paymentResult = await confirmTossPayment({
      paymentKey,
      orderId,
      amount: parseInt(amount, 10),
    });

    const supabase = await createClient();

    // 기존 구독 확인 및 업데이트
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (existingSubscription) {
      // 기존 구독 업데이트
      await supabase
        .from('subscriptions')
        .update({
          plan,
          status: 'ACTIVE',
          payment_provider: 'toss',
          external_id: paymentResult.paymentKey,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', existingSubscription.id);
    } else {
      // 새 구독 생성
      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan,
        status: 'ACTIVE',
        payment_provider: 'toss',
        external_id: paymentResult.paymentKey,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }

    // 결제 내역 저장
    await supabase.from('payment_history').insert({
      user_id: userId,
      amount: parseInt(amount, 10),
      currency: 'KRW',
      status: 'COMPLETED',
      payment_provider: 'toss',
      external_id: paymentResult.paymentKey,
      order_id: orderId,
      plan,
      metadata: {
        method: paymentResult.method,
        approvedAt: paymentResult.approvedAt,
        receipt: paymentResult.receipt?.url,
      },
    });

    return NextResponse.redirect(
      absoluteUrl('/dashboard/billing?success=true')
    );
  } catch (error) {
    console.error('Toss payment success handler error:', error);
    return NextResponse.redirect(
      absoluteUrl('/dashboard/billing?error=payment_failed')
    );
  }
}
