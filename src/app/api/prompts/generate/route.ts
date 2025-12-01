import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptId, variables } = await req.json();

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    // Get the prompt
    const prompt = await db.prompt.findFirst({
      where: {
        id: promptId,
        OR: [
          { isPublic: true },
          { isSystem: true },
          { userId: session.user.id },
        ],
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check user's subscription limits
    const subscription = await db.subscription.findFirst({
      where: { userId: session.user.id },
    });

    // For demo purposes, we'll skip the actual limit check
    // In production, you'd check against subscription.plan limits

    // Replace variables in prompt content
    let filledPrompt = prompt.content;
    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        filledPrompt = filledPrompt.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value as string
        );
      });
    }

    // Generate response using OpenAI
    const startTime = Date.now();
    let output = '';
    let tokens = 0;

    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond in a clear, professional manner.',
          },
          {
            role: 'user',
            content: filledPrompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      output = completion.choices[0]?.message?.content || '';
      tokens = completion.usage?.total_tokens || 0;
    } else {
      // Demo mode without OpenAI key
      output = `[Demo Mode - No OpenAI API Key]\n\nThis is a simulated response for the prompt:\n\n${filledPrompt}\n\nTo enable real AI generation, add your OPENAI_API_KEY to the environment variables.`;
      tokens = 0;
    }

    const duration = Date.now() - startTime;

    // Record usage
    await db.promptUsage.create({
      data: {
        promptId: prompt.id,
        userId: session.user.id,
        input: variables,
        output,
        tokens,
        duration,
      },
    });

    // Update prompt usage count
    await db.prompt.update({
      where: { id: prompt.id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({
      output,
      tokens,
      duration,
    });
  } catch (error) {
    console.error('Failed to generate:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
