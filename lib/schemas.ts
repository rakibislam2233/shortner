import { z } from "zod";

export const createLinkSchema = z.object({
  imageName: z
    .string()
    .min(3, "Image name must be at least 3 characters")
    .max(50, "Image name must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Image name can only contain letters, numbers, spaces, and hyphens"
    ),
  urlMobile: z
    .string({
      required_error: "Mobile URL is required",
      invalid_type_error: "Mobile URL must be a string",
    })
    .url("Mobile URL must be a valid URL"),
  urlDesktop: z
    .string()
    .url("Desktop URL must be a valid URL")
    .optional()
    .nullable(),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          file.type
        ),
      "Only JPEG, PNG, and GIF files are allowed"
    ),
});

// Schema for validating login form
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password is too long"),
});

// Schema for validating registration form
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});
