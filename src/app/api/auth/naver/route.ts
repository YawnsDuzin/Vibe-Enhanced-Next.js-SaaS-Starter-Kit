import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/utils';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
const NAVER_REDIRECT_URI = absoluteUrl('/api/auth/naver/callback');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get('next') || '/dashboard';

  // Generate state for CSRF protection
  const state = Buffer.from(JSON.stringify({ next, timestamp: Date.now() })).toString('base64');

  const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
  naverAuthUrl.searchParams.set('response_type', 'code');
  naverAuthUrl.searchParams.set('client_id', NAVER_CLIENT_ID);
  naverAuthUrl.searchParams.set('redirect_uri', NAVER_REDIRECT_URI);
  naverAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(naverAuthUrl.toString());
}
