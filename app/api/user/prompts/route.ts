/**
 * User Prompts API
 * GET - List all prompts
 * POST - Create/update prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth/user-identity';
import { z } from 'zod';

// Validation schema for prompt
const promptSchema = z.object({
  id: z.string().uuid().optional(), // If provided, update existing
  title: z.string().min(1).max(200),
  blocks: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    enabled: z.boolean(),
    locked: z.boolean().optional(),
    collapsed: z.boolean().optional(),
  })),
  compiledPrompt: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    
    const prompts = await prisma.prompt.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        lastUsedAt: true,
        useCount: true,
      },
    });
    
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('[Prompts GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json();
    
    // Validate input
    const parsed = promptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid prompt', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    const { id, title, blocks, compiledPrompt } = parsed.data;
    
    let prompt;
    
    if (id) {
      // Update existing prompt (verify ownership)
      const existing = await prisma.prompt.findFirst({
        where: { id, userId },
      });
      
      if (!existing) {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        );
      }
      
      prompt = await prisma.prompt.update({
        where: { id },
        data: {
          title,
          blocks,
          compiledPrompt,
          lastUsedAt: new Date(),
        },
      });
    } else {
      // Create new prompt
      prompt = await prisma.prompt.create({
        data: {
          userId,
          title,
          blocks,
          compiledPrompt,
          lastUsedAt: new Date(),
        },
      });
    }
    
    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      blocks: prompt.blocks,
      compiledPrompt: prompt.compiledPrompt,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    });
  } catch (error) {
    console.error('[Prompts POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
}
