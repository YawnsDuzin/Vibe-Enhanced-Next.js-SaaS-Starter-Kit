import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
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
import { formatNumber, formatCompactNumber } from '@/lib/utils';
import { PLANS } from '@/lib/stripe';

async function getDashboardData(userId: string) {
  const [subscription, promptCount, teamCount, recentPrompts] =
    await Promise.all([
      db.subscription.findFirst({
        where: { userId },
      }),
      db.promptUsage.count({
        where: { userId },
      }),
      db.teamMember.count({
        where: { userId },
      }),
      db.promptUsage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          prompt: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      }),
    ]);

  return {
    subscription,
    promptCount,
    teamCount,
    recentPrompts,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { subscription, promptCount, teamCount, recentPrompts } =
    await getDashboardData(session.user.id);

  const plan = subscription?.plan || 'FREE';
  const planDetails = PLANS[plan];
  const promptsUsedToday = 0; // This would come from actual tracking
  const promptLimit = planDetails.limits.promptsPerDay;
  const promptPercentage =
    promptLimit === -1 ? 0 : (promptsUsedToday / promptLimit) * 100;

  const stats = [
    {
      title: 'Total Prompts Used',
      value: formatCompactNumber(promptCount),
      change: '+12%',
      trend: 'up',
      icon: Sparkles,
    },
    {
      title: 'Teams',
      value: teamCount.toString(),
      change: '+2',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Current Plan',
      value: planDetails.name,
      badge: plan === 'FREE' ? 'Free' : 'Active',
      icon: CreditCard,
    },
    {
      title: 'API Usage',
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
          Welcome back, {session.user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your account today.
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
                  {stat.change} from last month
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
            <CardTitle>Daily Prompt Usage</CardTitle>
            <CardDescription>
              {promptLimit === -1
                ? 'Unlimited prompts on your plan'
                : `${promptsUsedToday} of ${promptLimit} prompts used today`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {promptLimit !== -1 && (
              <div className="space-y-2">
                <Progress value={promptPercentage} />
                <p className="text-sm text-muted-foreground">
                  {promptLimit - promptsUsedToday} prompts remaining
                </p>
              </div>
            )}
            {promptLimit === -1 && (
              <p className="text-sm text-muted-foreground">
                You have unlimited prompts with your {planDetails.name} plan.
              </p>
            )}
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/prompts">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Use AI Prompts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest prompt usage</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity. Start using prompts!
              </p>
            ) : (
              <div className="space-y-4">
                {recentPrompts.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {usage.prompt.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {usage.prompt.category}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {usage.tokens || 0} tokens
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts to get things done faster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/prompts/new">
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  <span>Create Prompt</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/team/invite">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Invite Team</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/api-keys">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>API Keys</span>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link href="/dashboard/billing">
                <div className="flex flex-col items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Upgrade Plan</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
