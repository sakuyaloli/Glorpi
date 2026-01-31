/**
 * Cookie-based user identity for Glorpi Prompt Studio
 * No login required - uses persistent anonymous ID
 */

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const COOKIE_NAME = 'glorpi_uid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get or create a user ID from cookies
 * Creates a new user in the database on first visit
 */
export async function getOrCreateUserId(): Promise<string> {
  const cookieStore = cookies();
  const existingId = cookieStore.get(COOKIE_NAME)?.value;
  
  if (existingId) {
    // Update lastSeenAt for existing user
    try {
      await prisma.user.update({
        where: { id: existingId },
        data: { lastSeenAt: new Date() },
      });
    } catch {
      // User might have been deleted, create new one
      return await createNewUser();
    }
    return existingId;
  }
  
  return await createNewUser();
}

/**
 * Create a new user and set cookie
 */
async function createNewUser(): Promise<string> {
  const cookieStore = cookies();
  
  // Create user in database
  const user = await prisma.user.create({
    data: {},
  });
  
  // Set cookie
  cookieStore.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  
  return user.id;
}

/**
 * Get user ID from cookies without creating new user
 * Returns null if no user cookie exists
 */
export function getUserIdFromCookie(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/**
 * Clear user cookie (for testing/reset purposes)
 */
export function clearUserCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
