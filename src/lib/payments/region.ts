import { headers } from 'next/headers';
import type { PaymentRegion, PaymentProvider } from './types';

// 한국 IP 대역 (대표적인 것들)
const KOREA_IP_PREFIXES = [
  '1.', '14.', '27.', '39.', '42.', '49.', '58.', '59.',
  '61.', '112.', '115.', '116.', '118.', '119.', '121.',
  '122.', '123.', '124.', '125.', '175.', '180.', '182.',
  '183.', '203.', '210.', '211.', '218.', '219.', '220.',
  '221.', '222.', '223.',
];

// 한국 타임존
const KOREA_TIMEZONES = ['Asia/Seoul', 'Asia/Pyongyang'];

// 한국어 언어 코드
const KOREAN_LOCALES = ['ko', 'ko-KR', 'ko-kr'];

/**
 * 서버 사이드에서 리전 감지
 * Vercel, Cloudflare 등의 헤더를 우선적으로 사용
 */
export async function detectRegionServer(): Promise<PaymentRegion> {
  const headersList = await headers();

  // 1. Vercel 지역 헤더 확인 (가장 정확)
  const vercelCountry = headersList.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry === 'KR' ? 'KR' : 'GLOBAL';
  }

  // 2. Cloudflare 지역 헤더 확인
  const cfCountry = headersList.get('cf-ipcountry');
  if (cfCountry) {
    return cfCountry === 'KR' ? 'KR' : 'GLOBAL';
  }

  // 3. X-Forwarded-For에서 IP 추출 후 대략적 판단
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim();
    if (isKoreanIP(ip)) {
      return 'KR';
    }
  }

  // 4. Accept-Language 헤더 확인
  const acceptLanguage = headersList.get('accept-language');
  if (acceptLanguage) {
    const primaryLanguage = acceptLanguage.split(',')[0].toLowerCase();
    if (KOREAN_LOCALES.some(locale => primaryLanguage.startsWith(locale))) {
      return 'KR';
    }
  }

  // 기본값: GLOBAL
  return 'GLOBAL';
}

/**
 * 클라이언트 사이드에서 리전 감지
 */
export function detectRegionClient(): PaymentRegion {
  if (typeof window === 'undefined') {
    return 'GLOBAL';
  }

  // 1. 브라우저 언어 확인
  const language = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';
  if (KOREAN_LOCALES.some(locale => language.toLowerCase().startsWith(locale))) {
    return 'KR';
  }

  // 2. 타임존 확인
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (KOREA_TIMEZONES.includes(timezone)) {
    return 'KR';
  }

  return 'GLOBAL';
}

/**
 * IP가 한국 대역인지 대략적으로 확인
 * 참고: 정확한 판단을 위해서는 IP 데이터베이스 사용 권장
 */
function isKoreanIP(ip: string): boolean {
  return KOREA_IP_PREFIXES.some(prefix => ip.startsWith(prefix));
}

/**
 * 리전에 따른 결제 제공자 선택
 */
export function getPaymentProvider(region: PaymentRegion): PaymentProvider {
  return region === 'KR' ? 'toss' : 'stripe';
}

/**
 * 리전에 따른 통화 코드
 */
export function getCurrency(region: PaymentRegion): string {
  return region === 'KR' ? 'KRW' : 'USD';
}

/**
 * 리전에 따른 통화 기호
 */
export function getCurrencySymbol(region: PaymentRegion): string {
  return region === 'KR' ? '₩' : '$';
}

/**
 * 금액 포맷팅
 */
export function formatPrice(amount: number, region: PaymentRegion): string {
  const currency = getCurrency(region);
  const locale = region === 'KR' ? 'ko-KR' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  }).format(amount);
}

/**
 * 리전 정보 전체 반환
 */
export interface RegionInfo {
  region: PaymentRegion;
  provider: PaymentProvider;
  currency: string;
  currencySymbol: string;
  locale: string;
  language: 'ko' | 'en';
}

export function getRegionInfo(region: PaymentRegion): RegionInfo {
  return {
    region,
    provider: getPaymentProvider(region),
    currency: getCurrency(region),
    currencySymbol: getCurrencySymbol(region),
    locale: region === 'KR' ? 'ko-KR' : 'en-US',
    language: region === 'KR' ? 'ko' : 'en',
  };
}
