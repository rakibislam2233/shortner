import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import path from "path";
import fs from "fs/promises";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ imageName: string }> }
) {
  try {
    const { imageName } = await params;
    // Check user authentication
    const username = (await cookies()).get("username")?.value;
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();

    // Find the link to delete using imageName
    const link = await Link.findOne({ imageName, username }).exec();
    if (!link) {
      return NextResponse.json(
        { error: "Link not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }
    try {
      const imagePath = path.join(process.cwd(), "public", link.image);
      await fs.unlink(imagePath);
    } catch (fileError) {
      console.warn("Could not delete image file:", fileError);
    }
    await Link.deleteOne({ imageName });
    revalidatePath("/");
    return NextResponse.json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
