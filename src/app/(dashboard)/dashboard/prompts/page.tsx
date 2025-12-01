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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Sparkles, Code, Megaphone, MessageSquare, FileText, Settings } from 'lucide-react';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  GENERAL: Sparkles,
  WRITING: FileText,
  CODING: Code,
  MARKETING: Megaphone,
  SALES: MessageSquare,
  SUPPORT: MessageSquare,
  CUSTOM: Settings,
};

async function getPrompts(userId: string) {
  const [systemPrompts, userPrompts] = await Promise.all([
    db.prompt.findMany({
      where: {
        OR: [{ isSystem: true }, { isPublic: true }],
      },
      orderBy: { usageCount: 'desc' },
    }),
    db.prompt.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return { systemPrompts, userPrompts };
}

export default async function PromptsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { systemPrompts, userPrompts } = await getPrompts(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Prompts</h1>
          <p className="text-muted-foreground mt-2">
            Browse and use AI prompts to supercharge your workflow
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/prompts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Prompt
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search prompts..." className="pl-10" />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="my-prompts">My Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* System Prompts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemPrompts.map((prompt) => {
              const Icon = categoryIcons[prompt.category] || Sparkles;
              return (
                <Card key={prompt.id} hover className="cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{prompt.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {prompt.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Used {prompt.usageCount} times
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/prompts/${prompt.id}`}>Use</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {systemPrompts.length === 0 && (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
              <p className="text-muted-foreground mt-2">
                System prompts will appear here once added.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-prompts" className="space-y-6">
          {/* User's Prompts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userPrompts.map((prompt) => {
              const Icon = categoryIcons[prompt.category] || Sparkles;
              return (
                <Card key={prompt.id} hover className="cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{prompt.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {prompt.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-2">
                      {prompt.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Used {prompt.usageCount} times
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/prompts/${prompt.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/prompts/${prompt.id}`}>Use</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {userPrompts.length === 0 && (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No prompts yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first custom prompt to get started.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/prompts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Prompt
                </Link>
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
