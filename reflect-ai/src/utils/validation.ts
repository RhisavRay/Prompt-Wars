import { z } from 'zod';

/**
 * Placeholder validation schema for future journal inputs
 */
export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(10, 'Reflection content must be at least 10 characters').max(5000, 'Content is too long'),
  mood: z.string().min(1, 'Mood selection is required'),
  tags: z.array(z.string()).optional(),
});

/**
 * Placeholder validation schema for future login inputs
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
