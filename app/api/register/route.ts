// Fixed: API route for user registration
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Validate input using the registration schema
    const validatedData = registerSchema.safeParse({ username, password });
    if (!validatedData.success) {
      const errors = validatedData.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: `Validation error: ${errors}` }, { status: 400 });
    }

    const { username: validatedUsername, password: validatedPassword } = validatedData.data;

    // Connect to database
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ username: validatedUsername.toLowerCase() }).exec();
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(validatedPassword, saltRounds);

    // Create the new user
    const newUser = new User({
      username: validatedUsername.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();

    return NextResponse.json(
      { success: true, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}