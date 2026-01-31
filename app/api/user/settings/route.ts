/**
 * User Settings API
 * GET - Retrieve user settings
 * POST - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateUserId } from '@/lib/auth/user-identity';
import { z } from 'zod';

// Validation schema for settings update
const settingsSchema = z.object({
  defaultProvider: z.enum(['openai', 'anthropic', 'gemini', 'deepseek', 'openai_compatible']).optional(),
  defaultModel: z.string().optional(),
  outputLengthPreset: z.enum(['concise', 'standard', 'verbose']).optional(),
  outputTokenEstimate: z.number().min(32).max(8192).optional(),
  preferences: z.record(z.unknown()).optional(),
});

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    
    // Get or create default settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }
    
    return NextResponse.json({
      defaultProvider: settings.defaultProvider,
      defaultModel: settings.defaultModel,
      outputLengthPreset: settings.outputLengthPreset,
      outputTokenEstimate: settings.outputTokenEstimate,
      preferences: settings.preferences,
    });
  } catch (error) {
    console.error('[Settings GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getOrCreateUserId();
    const body = await request.json();
    
    // Validate input
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    
    // Build update data, handling JSON preferences properly
    const updateData: {
      defaultProvider?: 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'openai_compatible';
      defaultModel?: string;
      outputLengthPreset?: 'concise' | 'standard' | 'verbose';
      outputTokenEstimate?: number;
      preferences?: object;
    } = {};
    
    if (parsed.data.defaultProvider) updateData.defaultProvider = parsed.data.defaultProvider;
    if (parsed.data.defaultModel) updateData.defaultModel = parsed.data.defaultModel;
    if (parsed.data.outputLengthPreset) updateData.outputLengthPreset = parsed.data.outputLengthPreset;
    if (parsed.data.outputTokenEstimate) updateData.outputTokenEstimate = parsed.data.outputTokenEstimate;
    if (parsed.data.preferences) updateData.preferences = parsed.data.preferences;
    
    // Upsert settings
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData,
      },
      update: updateData,
    });
    
    return NextResponse.json({
      defaultProvider: settings.defaultProvider,
      defaultModel: settings.defaultModel,
      outputLengthPreset: settings.outputLengthPreset,
      outputTokenEstimate: settings.outputTokenEstimate,
      preferences: settings.preferences,
    });
  } catch (error) {
    console.error('[Settings POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
