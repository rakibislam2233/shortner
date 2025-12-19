// Fixed: API login route with bcrypt and MongoDB
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { loginSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate input using the login schema
    const validatedData = loginSchema.safeParse({ username, password });
    if (!validatedData.success) {
      const errors = validatedData.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: `Validation error: ${errors}` }, { status: 400 });
    }

    const { username: validatedUsername, password: validatedPassword } = validatedData.data;

    // Connect to database
    await dbConnect();

    // Find user
    const user = await User.findOne({ username: validatedUsername.toLowerCase() }).exec();
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(validatedPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create response with success and set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("username", user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}