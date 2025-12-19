import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import { createLinkSchema } from "@/lib/schemas";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (isRateLimited(ip.toString())) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const usernameCookie = req.cookies.get("username");
    const username = usernameCookie?.value;
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const imageName = formData.get("imageName");
    const urlMobile = formData.get("urlMobile");
    const urlDesktop = formData.get("urlDesktop");
    const file = formData.get("image");

    // Validate using Zod
    // Convert urlDesktop to null if it's an empty string or just whitespace
    let urlDesktopValue = null;
    if (typeof urlDesktop === "string" && urlDesktop.trim() !== "") {
      urlDesktopValue = urlDesktop.trim();
    }

    const parsedData = createLinkSchema.safeParse({
      imageName: imageName as string,
      urlMobile: urlMobile as string,
      urlDesktop: urlDesktopValue,
      image: file as File,
    });

    if (!parsedData.success) {
      const errors = parsedData.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: `Validation error: ${errors}` },
        { status: 400 }
      );
    }

    const {
      imageName: originalImageName,
      urlMobile: validatedUrlMobile,
      urlDesktop: validatedUrlDesktop,
      image: validatedFile,
    } = parsedData.data;

    // Convert spaces to underscores in imageName
    const processedImageName = originalImageName.replace(/\s+/g, '_');

    // Check if imageName already exists in database
    await dbConnect();
    const existingLink = await Link.findOne({ imageName: processedImageName }).exec();
    if (existingLink) {
      return NextResponse.json({ error: "Image name already exists" }, { status: 400 });
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
      imageName: processedImageName,
      image: `/uploads/${newFilename}`, // Path relative to public directory
      urlMobile: validatedUrlMobile,
      urlDesktop: validatedUrlDesktop || undefined,
      username: username,
    });

    await newLink.save();

    const origin = req.headers.get("origin") ?? "";
    const shortUrl = `${origin}/${processedImageName}`;

    return NextResponse.json({ link: shortUrl }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
