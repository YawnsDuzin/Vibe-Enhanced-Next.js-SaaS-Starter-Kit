import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { absoluteUrl } from '@/lib/utils';
import { cookies } from 'next/headers';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email: string;
    name: string;
    nickname?: string;
    profile_image?: string;
  };
}

async function getNaverToken(code: string, state: string): Promise<NaverTokenResponse> {
  const tokenUrl = new URL('https://nid.naver.com/oauth2.0/token');
  tokenUrl.searchParams.set('grant_type', 'authorization_code');
  tokenUrl.searchParams.set('client_id', NAVER_CLIENT_ID);
  tokenUrl.searchParams.set('client_secret', NAVER_CLIENT_SECRET);
  tokenUrl.searchParams.set('code', code);
  tokenUrl.searchParams.set('state', state);

  const response = await fetch(tokenUrl.toString(), {
    method: 'GET',
  });

  return response.json();
}

async function getNaverUser(accessToken: string): Promise<NaverUserResponse> {
  const response = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Naver OAuth error:', error);
      return NextResponse.redirect(absoluteUrl('/login?error=naver_auth_failed'));
    }

    if (!code || !state) {
      return NextResponse.redirect(absoluteUrl('/login?error=missing_params'));
    }

    // Decode state to get redirect URL
    let next = '/dashboard';
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      next = stateData.next || '/dashboard';
    } catch {
      // Use default redirect if state parsing fails
    }

    // Get Naver access token
    const tokenData = await getNaverToken(code, state);

    if (tokenData.error) {
      console.error('Naver token error:', tokenData.error_description);
      return NextResponse.redirect(absoluteUrl('/login?error=token_error'));
    }

    // Get Naver user info
    const userData = await getNaverUser(tokenData.access_token);

    if (userData.resultcode !== '00') {
      console.error('Naver user error:', userData.message);
      return NextResponse.redirect(absoluteUrl('/login?error=user_info_error'));
    }

    const naverUser = userData.response;

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user exists by email
    const { data: existingUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', naverUser.email)
      .limit(1);

    let userId: string;

    if (existingUsers && existingUsers.length > 0) {
      // User exists - update profile with Naver info if needed
      userId = existingUsers[0].id;

      await supabaseAdmin
        .from('profiles')
        .update({
          name: naverUser.name || naverUser.nickname,
          avatar_url: naverUser.profile_image,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: naverUser.email,
        email_confirm: true,
        user_metadata: {
          name: naverUser.name || naverUser.nickname,
          full_name: naverUser.name || naverUser.nickname,
          avatar_url: naverUser.profile_image,
          provider: 'naver',
          provider_id: naverUser.id,
        },
      });

      if (createError || !newUser.user) {
        console.error('User creation error:', createError);
        return NextResponse.redirect(absoluteUrl('/login?error=user_creation_failed'));
      }

      userId = newUser.user.id;
    }

    // Generate a magic link for the user to sign in
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: naverUser.email,
      options: {
        redirectTo: absoluteUrl(next),
      },
    });

    if (linkError || !linkData.properties?.hashed_token) {
      console.error('Magic link error:', linkError);
      return NextResponse.redirect(absoluteUrl('/login?error=session_error'));
    }

    // Extract the token from the magic link
    const magicLinkUrl = new URL(linkData.properties.action_link);
    const token = magicLinkUrl.searchParams.get('token');
    const type = magicLinkUrl.searchParams.get('type');

    if (!token) {
      return NextResponse.redirect(absoluteUrl('/login?error=token_generation_failed'));
    }

    // Redirect to Supabase auth callback with the token
    const callbackUrl = new URL('/auth/callback', origin);
    callbackUrl.searchParams.set('token_hash', linkData.properties.hashed_token);
    callbackUrl.searchParams.set('type', type || 'magiclink');
    callbackUrl.searchParams.set('next', next);

    return NextResponse.redirect(callbackUrl.toString());
  } catch (error) {
    console.error('Naver OAuth callback error:', error);
    return NextResponse.redirect(absoluteUrl('/login?error=auth_callback_error'));
  }
}
