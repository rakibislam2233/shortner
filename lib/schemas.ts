// Fixed: Zod validation schemas
import { z } from 'zod';

// Schema for validating the link creation form
export const createLinkSchema = z.object({
  id: z.string()
    .min(3, 'Custom ID must be at least 3 characters')
    .max(20, 'Custom ID must be at most 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Custom ID can only contain letters, numbers, and hyphens'),
  urlMobile: z.string().url('Mobile URL must be a valid URL'),
  urlDesktop: z.string().url('Desktop URL must be a valid URL').optional().nullable(),
  image: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      file => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type),
      'Only JPEG, PNG, and GIF files are allowed'
    ),
});

// Schema for validating login form
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username must be at most 50 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password is too long')
});