// Fixed: API route for user logout
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Create response and clear the username cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("username", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
}