// Fixed: Updated API route using MongoDB and proper validation
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import { createLinkSchema } from "@/lib/schemas";

// In-memory rate limiting (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiter function
function isRateLimited(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    // Reset the counter
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  } else {
    // Increment the counter
    if (record.count >= limit) {
      return true; // Rate limited
    }
    rateLimitMap.set(ip, { count: record.count + 1, resetTime: record.resetTime });
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip.toString())) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const usernameCookie = req.cookies.get("username");
    const username = usernameCookie?.value;
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const id = formData.get("id");
    const urlMobile = formData.get("urlMobile");
    const urlDesktop = formData.get("urlDesktop");
    const file = formData.get("image");

    // Validate using Zod
    const parsedData = createLinkSchema.safeParse({
      id: id as string,
      urlMobile: urlMobile as string,
      urlDesktop: urlDesktop as string | null,
      image: file as File
    });

    if (!parsedData.success) {
      const errors = parsedData.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: `Validation error: ${errors}` }, { status: 400 });
    }

    const { id: validatedId, urlMobile: validatedUrlMobile, urlDesktop: validatedUrlDesktop, image: validatedFile } = parsedData.data;

    // Check if ID already exists in database
    await dbConnect();
    const existingLink = await Link.findOne({ id: validatedId }).exec();
    if (existingLink) {
      return NextResponse.json({ error: "ID already exists" }, { status: 400 });
    }

    // Secure filename generation
    const fileExtension = path.extname(validatedFile.name).toLowerCase();
    const newFilename = `${uuidv4()}${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, newFilename);

    // Convert File to buffer and write to disk
    const buffer = Buffer.from(await validatedFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Save to database
    const newLink = new Link({
      id: validatedId,
      image: `/uploads/${newFilename}`, // Path relative to public directory
      urlMobile: validatedUrlMobile,
      urlDesktop: validatedUrlDesktop || undefined,
      username: username
    });

    await newLink.save();

    const origin = req.headers.get("origin") ?? "";
    const shortUrl = `${origin}/${validatedId}`;

    return NextResponse.json({ link: shortUrl }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
