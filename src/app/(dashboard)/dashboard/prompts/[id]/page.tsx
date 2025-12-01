'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Sparkles, RefreshCw } from 'lucide-react';

interface Prompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category: string;
  variables: string[] | null;
  isPublic: boolean;
  isSystem: boolean;
  usageCount: number;
}

export default function PromptExecutePage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchPrompt() {
      setLoading(true);
      try {
        const response = await fetch(`/api/prompts/${params.id}`);
        if (!response.ok) {
          toast.error('Prompt not found');
          router.push('/dashboard/prompts');
          return;
        }
        const data = await response.json();
        setPrompt(data);

        // Initialize variables
        if (data.variables) {
          const initialVars: Record<string, string> = {};
          data.variables.forEach((v: string) => {
            initialVars[v] = '';
          });
          setVariables(initialVars);
        }
      } catch {
        toast.error('Failed to load prompt');
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [params.id, router]);

  const handleGenerate = async () => {
    if (!prompt) return;

    // Check if all variables are filled
    const emptyVars = Object.entries(variables).filter(
      ([_, value]) => !value.trim()
    );
    if (emptyVars.length > 0) {
      toast.error('Please fill in all variables');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: prompt.id,
          variables,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate');
        return;
      }

      const data = await response.json();
      setOutput(data.output);
      toast.success('Generated successfully!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getFilledPrompt = () => {
    if (!prompt) return '';
    let filled = prompt.content;
    Object.entries(variables).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
    });
    return filled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prompt) return null;

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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{prompt.name}</h1>
            <Badge variant={prompt.isSystem ? 'default' : 'secondary'}>
              {prompt.category}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{prompt.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Variables */}
          {prompt.variables && prompt.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variables</CardTitle>
                <CardDescription>
                  Fill in the values for each variable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {prompt.variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={variable} className="capitalize">
                      {variable.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Input
                      id={variable}
                      placeholder={`Enter ${variable}...`}
                      value={variables[variable] || ''}
                      onChange={(e) =>
                        setVariables((prev) => ({
                          ...prev,
                          [variable]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Prompt Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Prompt Preview</CardTitle>
                <CardDescription>
                  This is what will be sent to the AI
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(getFilledPrompt())}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-[300px] overflow-y-auto">
                {getFilledPrompt()}
              </pre>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            loading={generating}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate with AI
          </Button>
        </div>

        {/* Output Section */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Output</CardTitle>
              <CardDescription>AI-generated response</CardDescription>
            </div>
            {output && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(output)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Fill in the variables and click Generate to see the AI output
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
