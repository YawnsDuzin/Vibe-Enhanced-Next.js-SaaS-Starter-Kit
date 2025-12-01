import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/utils';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  console.error('Toss payment failed:', { code, message, orderId });

  // 에러 코드에 따른 메시지 매핑
  const errorMessages: Record<string, string> = {
    PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
    PAY_PROCESS_ABORTED: '결제 처리 중 오류가 발생했습니다.',
    REJECT_CARD_COMPANY: '카드사에서 결제를 거부했습니다.',
    EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과했습니다.',
    EXCEED_MAX_PAYMENT_AMOUNT: '결제 금액 한도를 초과했습니다.',
    INVALID_CARD_EXPIRATION: '카드 유효기간이 만료되었습니다.',
    INVALID_STOPPED_CARD: '정지된 카드입니다.',
    INVALID_CARD_LOST_OR_STOLEN: '분실 또는 도난 신고된 카드입니다.',
    NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT: '할부가 지원되지 않는 카드입니다.',
    INVALID_CARD_NUMBER: '유효하지 않은 카드 번호입니다.',
  };

  const displayMessage = code ? (errorMessages[code] || message || '결제에 실패했습니다.') : '결제에 실패했습니다.';

  // 에러 메시지를 URL 인코딩하여 전달
  const encodedMessage = encodeURIComponent(displayMessage);

  return NextResponse.redirect(
    absoluteUrl(`/dashboard/billing?error=payment_failed&message=${encodedMessage}`)
  );
}
