"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import { createLinkSchema } from "@/lib/schemas";
import type { Document } from "mongoose";

// Define the return type for links
interface ILinkDocument extends Document {
  id: string;
  image: string;
  urlMobile: string;
  urlDesktop?: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rate limiting in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Helper function for rate limiting
function isRateLimited(
  ip: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (now > record.resetTime) {
    // Reset the counter
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  } else {
    // Increment the counter
    if (record.count >= limit) {
      return true; // Rate limited
    }
    rateLimitMap.set(ip, {
      count: record.count + 1,
      resetTime: record.resetTime,
    });
    return false;
  }
}

// Create a new short link
export async function createLink(formData: FormData) {
  try {
    // Get IP address for rate limiting
    const ip = (global as any).ipAddress || "unknown";
    if (isRateLimited(ip)) {
      return { error: "Too many requests. Please try again later." };
    }

    // Check user authentication
    const username = (await cookies()).get("username")?.value;
    if (!username) {
      return { error: "Unauthorized" };
    }

    // Validate form data using Zod
    const rawFormData = {
      id: formData.get("id") as string,
      urlMobile: formData.get("urlMobile") as string,
      urlDesktop: (formData.get("urlDesktop") as string) || null,
      image: formData.get("image") as File,
    };

    const validatedData = createLinkSchema.parse(rawFormData);
    // Connect to the database
    await dbConnect();
    // Check if the ID already exists - FIXED
    const existingLink = await Link.findOne({ id: validatedData.id }).exec();
    if (existingLink) {
      return { error: "ID already exists" };
    }
    // Prepare file upload
    const fileExtension = path.extname(validatedData.image.name).toLowerCase();
    const newFilename = `${uuidv4()}${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, newFilename);

    // Save file to public/uploads
    const buffer = Buffer.from(await validatedData.image.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Create the new link in the database
    const newLink = new Link({
      id: validatedData.id,
      image: `/uploads/${newFilename}`,
      urlMobile: validatedData.urlMobile,
      urlDesktop: validatedData.urlDesktop || undefined,
      username: username,
    });

    await newLink.save();

    // Revalidate the home page to show the new link
    revalidatePath("/");

    return {
      success: true,
      message: "Link created successfully!",
      link: `/${validatedData.id}`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "An unexpected error occurred" };
  }
}

// Get all links for the current user - FIXED
export async function getUserLinks() {
  try {
    const username = (await cookies()).get("username")?.value;
    if (!username) {
      return [];
    }

    await dbConnect();

    // Fixed: Properly typed query with .exec()
    const links = await Link.find({ username })
      .select("_id id image urlMobile urlDesktop createdAt")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(links)); // Convert ObjectId to string for client-side usage
  } catch (error) {
    console.error("Error fetching user links:", error);
    return [];
  }
}

// Delete a link - BONUS FUNCTION
export async function deleteLink(linkId: string) {
  try {
    const username = (await cookies()).get("username")?.value;
    if (!username) {
      return { error: "Unauthorized" };
    }

    await dbConnect();

    // Find and delete the link if it belongs to the user
    const deletedLink = await Link.findOneAndDelete({
      id: linkId,
      username,
    }).exec();

    if (!deletedLink) {
      return { error: "Link not found or unauthorized" };
    }

    // Delete the associated image file
    if (deletedLink.image) {
      const imagePath = path.join(process.cwd(), "public", deletedLink.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error("Error deleting image file:", err);
      }
    }

    revalidatePath("/");

    return { success: true, message: "Link deleted successfully" };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { error: "Failed to delete link" };
  }
}

// Get a single link by ID - BONUS FUNCTION
export async function getLinkById(linkId: string) {
  try {
    await dbConnect();

    const link = await Link.findOne({ id: linkId })
      .select("id image urlMobile urlDesktop")
      .lean()
      .exec();

    if (!link) {
      return null;
    }

    return JSON.parse(JSON.stringify(link));
  } catch (error) {
    console.error("Error fetching link:", error);
    return null;
  }
}
