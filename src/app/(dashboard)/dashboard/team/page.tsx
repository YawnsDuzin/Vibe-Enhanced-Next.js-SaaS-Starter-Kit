import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatDate } from '@/lib/utils';
import { Plus, Users, Shield } from 'lucide-react';

async function getTeamData(userId: string) {
  const supabase = await createClient();

  // Get teams where user is a member
  const { data: membershipData } = await supabase
    .from('team_members')
    .select(`
      team_id,
      role,
      teams (
        id,
        name,
        slug,
        description,
        image,
        owner_id,
        created_at
      )
    `)
    .eq('user_id', userId);

  if (!membershipData || membershipData.length === 0) {
    return [];
  }

  // Get team details with members
  const teamIds = membershipData.map((m: any) => m.team_id);

  const { data: teamsWithMembers } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        id,
        user_id,
        role,
        profiles (
          id,
          name,
          email,
          avatar_url
        )
      )
    `)
    .in('id', teamIds);

  // Combine the data
  return (teamsWithMembers || []).map((team: any) => {
    const userMembership = membershipData.find((m: any) => m.team_id === team.id);
    return {
      ...team,
      userRole: userMembership?.role,
      _count: {
        members: team.team_members?.length || 0,
      },
    };
  });
}

export default async function TeamPage() {
  const user = await getUser();
  if (!user) return null;

  const teams = await getTeamData(user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">팀</h1>
          <p className="text-muted-foreground mt-2">
            팀을 관리하고 다른 사람들과 협업하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/team/new">
            <Plus className="mr-2 h-4 w-4" />
            팀 생성
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">아직 팀이 없습니다</h3>
          <p className="text-muted-foreground mt-2">
            첫 번째 팀을 만들어 협업을 시작하세요.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/team/new">
              <Plus className="mr-2 h-4 w-4" />
              팀 생성
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: any) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{team.name}</CardTitle>
                  <Badge variant="secondary">{team.userRole}</Badge>
                </div>
                <CardDescription>
                  {team.description || '설명 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Team Members Preview */}
                <div>
                  <p className="text-sm font-medium mb-2">멤버</p>
                  <div className="flex -space-x-2">
                    {team.team_members?.slice(0, 5).map((member: any) => (
                      <Avatar
                        key={member.id}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarImage src={member.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {getInitials(member.profiles?.name || member.profiles?.email || '')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team._count.members > 5 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                        +{team._count.members - 5}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{team._count.members}명의 멤버</span>
                  <span>{formatDate(team.created_at)} 생성</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/team/${team.id}`}>팀 보기</Link>
                  </Button>
                  {(team.userRole === 'OWNER' || team.userRole === 'ADMIN') && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/team/${team.id}/settings`}>
                        <Shield className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
