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
  const supabase = await createClient();

  const [systemPromptsResult, userPromptsResult] = await Promise.all([
    supabase
      .from('prompts')
      .select('*')
      .or('is_system.eq.true,is_public.eq.true')
      .order('usage_count', { ascending: false }),
    supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
  ]);

  return {
    systemPrompts: systemPromptsResult.data || [],
    userPrompts: userPromptsResult.data || [],
  };
}

export default async function PromptsPage() {
  const user = await getUser();
  if (!user) return null;

  const { systemPrompts, userPrompts } = await getPrompts(user.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 프롬프트</h1>
          <p className="text-muted-foreground mt-2">
            AI 프롬프트를 탐색하고 사용하여 작업 효율을 높이세요
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/prompts/new">
            <Plus className="mr-2 h-4 w-4" />
            프롬프트 생성
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="프롬프트 검색..." className="pl-10" />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">템플릿</TabsTrigger>
          <TabsTrigger value="my-prompts">내 프롬프트</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* System Prompts Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemPrompts.map((prompt: any) => {
              const Icon = categoryIcons[prompt.category] || Sparkles;
              return (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                        {prompt.usage_count}회 사용됨
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/prompts/${prompt.id}`}>사용</Link>
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
              <h3 className="mt-4 text-lg font-semibold">템플릿이 없습니다</h3>
              <p className="text-muted-foreground mt-2">
                시스템 프롬프트가 추가되면 여기에 표시됩니다.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-prompts" className="space-y-6">
          {/* User's Prompts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userPrompts.map((prompt: any) => {
              const Icon = categoryIcons[prompt.category] || Sparkles;
              return (
                <Card key={prompt.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                        {prompt.usage_count}회 사용됨
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/prompts/${prompt.id}/edit`}>
                            편집
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/prompts/${prompt.id}`}>사용</Link>
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
              <h3 className="mt-4 text-lg font-semibold">프롬프트가 없습니다</h3>
              <p className="text-muted-foreground mt-2">
                첫 번째 커스텀 프롬프트를 만들어 시작하세요.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/prompts/new">
                  <Plus className="mr-2 h-4 w-4" />
                  프롬프트 생성
                </Link>
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
