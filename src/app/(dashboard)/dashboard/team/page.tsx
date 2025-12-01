import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
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
import { Plus, Users, Mail, Shield } from 'lucide-react';

async function getTeamData(userId: string) {
  const teams = await db.team.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  return teams;
}

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) return null;

  const teams = await getTeamData(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teams and collaborate with others
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/team/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No teams yet</h3>
          <p className="text-muted-foreground mt-2">
            Create your first team to start collaborating with others.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/team/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const userMembership = team.members.find(
              (m) => m.userId === session.user.id
            );

            return (
              <Card key={team.id} hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{team.name}</CardTitle>
                    <Badge variant="secondary">{userMembership?.role}</Badge>
                  </div>
                  <CardDescription>
                    {team.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Members Preview */}
                  <div>
                    <p className="text-sm font-medium mb-2">Members</p>
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 5).map((member) => (
                        <Avatar
                          key={member.id}
                          size="sm"
                          className="border-2 border-background"
                        >
                          <AvatarImage src={member.user.image || ''} />
                          <AvatarFallback>
                            {getInitials(member.user.name || member.user.email)}
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
                    <span>{team._count.members} members</span>
                    <span>Created {formatDate(team.createdAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/team/${team.id}`}>View Team</Link>
                    </Button>
                    {(userMembership?.role === 'OWNER' ||
                      userMembership?.role === 'ADMIN') && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/team/${team.id}/settings`}>
                          <Shield className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
