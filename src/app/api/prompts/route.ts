import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createPromptSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  category: z.enum([
    'GENERAL',
    'WRITING',
    'CODING',
    'MARKETING',
    'SALES',
    'SUPPORT',
    'CUSTOM',
  ]),
  variables: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'system', 'user', 'public'

    const supabase = await createClient();
    let query = supabase.from('prompts').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (type === 'system') {
      query = query.eq('is_system', true);
    } else if (type === 'user') {
      query = query.eq('user_id', user.id);
    } else if (type === 'public') {
      query = query.eq('is_public', true);
    } else {
      // Default: show user's prompts and public/system prompts
      query = query.or(`is_public.eq.true,is_system.eq.true,user_id.eq.${user.id}`);
    }

    const { data: prompts, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch prompts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPromptSchema.parse(body);

    const supabase = await createClient();
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        content: validatedData.content,
        category: validatedData.category,
        variables: validatedData.variables || [],
        is_public: validatedData.isPublic || false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create prompt:', error);
      return NextResponse.json(
        { error: 'Failed to create prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(prompt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
