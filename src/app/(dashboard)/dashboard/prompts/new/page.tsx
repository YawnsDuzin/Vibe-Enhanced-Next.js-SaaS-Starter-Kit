'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X } from 'lucide-react';

const promptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Prompt content is required'),
  category: z.enum([
    'GENERAL',
    'WRITING',
    'CODING',
    'MARKETING',
    'SALES',
    'SUPPORT',
    'CUSTOM',
  ]),
  isPublic: z.boolean(),
});

type PromptForm = z.infer<typeof promptSchema>;

export default function NewPromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromptForm>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      category: 'GENERAL',
      isPublic: false,
    },
  });

  const addVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim())) {
      setVariables([...variables, newVariable.trim()]);
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter((v) => v !== variable));
  };

  const onSubmit = async (data: PromptForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          variables,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to create prompt');
        return;
      }

      toast.success('Prompt created successfully!');
      router.push('/dashboard/prompts');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/prompts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Prompt</h1>
          <p className="text-muted-foreground mt-1">
            Create a new custom prompt template
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide basic details about your prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="E.g., Blog Post Outline Generator"
                    {...register('name')}
                    error={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="A brief description of what this prompt does"
                    {...register('description')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    defaultValue="GENERAL"
                    onValueChange={(value) =>
                      setValue('category', value as PromptForm['category'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="WRITING">Writing</SelectItem>
                      <SelectItem value="CODING">Coding</SelectItem>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="SALES">Sales</SelectItem>
                      <SelectItem value="SUPPORT">Support</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic">Make Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to use this prompt
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={watch('isPublic')}
                    onCheckedChange={(checked) => setValue('isPublic', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variables</CardTitle>
                <CardDescription>
                  Add variables that users can fill in. Use them in your prompt
                  as {'{{variableName}}'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Variable name (e.g., topic)"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addVariable();
                      }
                    }}
                  />
                  <Button type="button" onClick={addVariable}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                        <button
                          type="button"
                          onClick={() => removeVariable(variable)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prompt Content */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Prompt Content</CardTitle>
              <CardDescription>
                Write your prompt. Use {'{{variableName}}'} to insert variables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your prompt here...

Example:
Write a blog post outline about {{topic}}.
The tone should be {{tone}}.
Include {{numberOfPoints}} main points."
                className="min-h-[400px] font-mono text-sm"
                {...register('content')}
                error={!!errors.content}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-2">
                  {errors.content.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" loading={loading}>
            Create Prompt
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/prompts">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
