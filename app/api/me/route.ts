// Fixed: API route to get current user information
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    // Get username from cookies
    const usernameCookie = req.cookies.get("username");
    const username = usernameCookie?.value;

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find user in database to verify they exist
    const user = await User.findOne({ username }).select('username createdAt').exec();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Return user information
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}