/**
 * Individual Prompt API
 * GET - Get single prompt with blocks
 * DELETE - Delete prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth/user-identity';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getOrCreateUserId();
    
    const prompt = await prisma.prompt.findFirst({
      where: { 
        id: params.id,
        userId,
      },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Update use count and lastUsedAt
    await prisma.prompt.update({
      where: { id: params.id },
      data: {
        useCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      id: prompt.id,
      title: prompt.title,
      blocks: prompt.blocks,
      compiledPrompt: prompt.compiledPrompt,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      lastUsedAt: prompt.lastUsedAt,
      useCount: prompt.useCount + 1,
    });
  } catch (error) {
    console.error('[Prompt GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getOrCreateUserId();
    
    // Verify ownership before delete
    const prompt = await prisma.prompt.findFirst({
      where: { 
        id: params.id,
        userId,
      },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    await prisma.prompt.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Prompt DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
