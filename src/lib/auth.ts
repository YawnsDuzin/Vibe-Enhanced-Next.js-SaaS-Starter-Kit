import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Tables } from '@/types/database';

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    name: profile?.name || user.user_metadata?.name || null,
    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    role: (profile?.role as UserRole) || 'USER',
  };
}

export async function getCurrentUser() {
  return getUser();
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    redirect('/dashboard');
  }

  return user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getUserSubscription(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getUserWithSubscription() {
  const user = await getUser();
  if (!user) return null;

  const subscription = await getUserSubscription(user.id);

  return {
    ...user,
    subscription,
  };
}
