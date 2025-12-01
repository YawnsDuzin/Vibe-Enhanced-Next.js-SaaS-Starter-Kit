import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatCompactNumber } from '@/lib/utils';
import { PLANS } from '@/lib/stripe';

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [subscriptionResult, promptCountResult, teamCountResult, recentPromptsResult] =
    await Promise.all([
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('prompt_usages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('prompt_usages')
        .select(`
          *,
          prompt:prompts (
            name,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  return {
    subscription: subscriptionResult.data,
    promptCount: promptCountResult.count || 0,
    teamCount: teamCountResult.count || 0,
    recentPrompts: recentPromptsResult.data || [],
  };
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;

  const { subscription, promptCount, teamCount, recentPrompts } =
    await getDashboardData(user.id);

  const plan = subscription?.plan || 'FREE';
  const planDetails = PLANS[plan as keyof typeof PLANS];
  const promptsUsedToday = 0; // This would come from actual tracking
  const promptLimit = planDetails?.limits?.promptsPerDay || 5;
  const promptPercentage =
    promptLimit === -1 ? 0 : (promptsUsedToday / promptLimit) * 100;

  const stats = [
    {
      title: '총 프롬프트 사용',
      value: formatCompactNumber(promptCount),
      change: '+12%',
      trend: 'up',
      icon: Sparkles,
    },
    {
      title: '팀',
      value: teamCount.toString(),
      change: '+2',
      trend: 'up',
      icon: Users,
    },
    {
      title: '현재 플랜',
      value: planDetails?.name || 'Free',
      badge: plan === 'FREE' ? '무료' : '활성',
      icon: CreditCard,
    },
    {
      title: 'API 사용량',
      value: '2,431',
      change: '-5%',
      trend: 'down',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          환영합니다, {user.name?.split(' ')[0] || '사용자'}님!
        </h1>
        <p className="text-muted-foreground mt-2">
          오늘의 계정 현황을 확인하세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.badge && (
                  <Badge variant={plan === 'FREE' ? 'secondary' : 'default'}>
                    {stat.badge}
                  </Badge>
                )}
              </div>
              {stat.change && (
                <p
                  className={`text-xs flex items-center gap-1 ${
                    stat.trend === 'up'
                      ? 'text-success'
                      : 'text-destructive'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change} 지난 달 대비
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Usage Card */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>일일 프롬프트 사용량</CardTitle>
            <CardDescription>
              {promptLimit === -1
                ? '무제한 프롬프트를 사용할 수 있습니다'
                : `오늘 ${promptsUsedToday} / ${promptLimit} 프롬프트 사용`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {promptLimit !== -1 && (
              <div className="space-y-2">
                <Progress value={promptPercentage} />
                <p className="text-sm text-muted-foreground">
                  {promptLimit - promptsUsedToday}개 프롬프트 남음
                </p>
              </div>
            )}
            {promptLimit === -1 && (
              <p className="text-sm text-muted-foreground">
                {planDetails?.name} 플랜에서는 무제한 프롬프트를 사용할 수 있습니다.
              </p>
            )}
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/prompts">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI 프롬프트 사용하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>최근 프롬프트 사용 기록</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                최근 활동이 없습니다. 프롬프트를 사용해보세요!
              </p>
            ) : (
              <div className="space-y-4">
                {recentPrompts.map((usage: any) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {usage.prompt?.name || '프롬프트'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {usage.prompt?.category || 'GENERAL'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {usage.tokens || 0} 토큰
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>
            자주 사용하는 작업과 단축키
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/prompts/new">
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  <span>프롬프트 생성</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/team/invite">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>팀 초대</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/api-keys">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>API 키</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/billing">
                <div className="flex flex-col items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  <span>플랜 업그레이드</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
