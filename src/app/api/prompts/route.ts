import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'system', 'user', 'public'

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (type === 'system') {
      where.isSystem = true;
    } else if (type === 'user') {
      where.userId = session.user.id;
    } else if (type === 'public') {
      where.isPublic = true;
    } else {
      // Default: show user's prompts and public/system prompts
      where.OR = [
        { isPublic: true },
        { isSystem: true },
        { userId: session.user.id },
      ];
    }

    const prompts = await db.prompt.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPromptSchema.parse(body);

    const prompt = await db.prompt.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        content: validatedData.content,
        category: validatedData.category,
        variables: validatedData.variables || [],
        isPublic: validatedData.isPublic || false,
        userId: session.user.id,
      },
    });

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
