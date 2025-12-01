import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { type TossWebhookEvent, PLANS, type PlanType } from '@/lib/payments';
import crypto from 'crypto';

const TOSS_WEBHOOK_SECRET = process.env.TOSS_WEBHOOK_SECRET || '';

// 웹훅 서명 검증
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn('TOSS_WEBHOOK_SECRET is not configured');
    return true; // 개발 환경에서는 통과
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-tosspayments-signature') || '';

    // 서명 검증
    if (!verifyWebhookSignature(body, signature, TOSS_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body) as TossWebhookEvent;
    const supabase = await createClient();

    console.log('Toss webhook event:', event.eventType, event.data?.orderId);

    switch (event.eventType) {
      case 'PAYMENT_STATUS_CHANGED': {
        const { orderId, status, paymentKey } = event.data;

        if (!orderId) {
          return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        // orderId에서 userId 추출
        const userId = orderId.split('_')[0];

        // 구독 조회
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('payment_provider', 'toss')
          .single();

        if (!subscription) {
          console.log('No subscription found for userId:', userId);
          return NextResponse.json({ received: true });
        }

        // 상태에 따른 처리
        if (status === 'CANCELED' || status === 'EXPIRED') {
          await supabase
            .from('subscriptions')
            .update({
              status: 'CANCELED',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          // 결제 내역 업데이트
          if (paymentKey) {
            await supabase
              .from('payment_history')
              .update({
                status: status === 'CANCELED' ? 'REFUNDED' : 'FAILED',
                updated_at: new Date().toISOString(),
              })
              .eq('external_id', paymentKey);
          }
        }
        break;
      }

      case 'BILLING_STATUS_CHANGED': {
        // 정기결제 상태 변경
        const { billingKey, status, customerKey } = event.data;

        if (status === 'EXPIRED' || status === 'STOPPED') {
          // 정기결제 중단 - 구독 취소
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('external_id', billingKey)
            .single();

          if (subscription) {
            await supabase
              .from('subscriptions')
              .update({
                status: 'CANCELED',
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscription.id);
          }
        }
        break;
      }

      case 'PAYMENT_FAILED': {
        // 결제 실패 처리
        const { orderId, failCode, failMessage } = event.data;
        console.error('Payment failed:', { orderId, failCode, failMessage });

        if (orderId) {
          await supabase.from('payment_history').insert({
            order_id: orderId,
            status: 'FAILED',
            payment_provider: 'toss',
            metadata: { failCode, failMessage },
          });
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Toss webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
