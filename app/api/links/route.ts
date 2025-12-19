import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Link from '@/models/Link';

export async function GET(req: NextRequest) {
  const usernameCookie = req.cookies.get('username');
  const username = usernameCookie?.value;

  if (!username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Connect to database
    await dbConnect();

    // Fetch links for the authenticated user
    const userLinks = await Link.find({ username })
      .select('_id id image urlMobile urlDesktop createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json(userLinks);
  } catch (error) {
    console.error('Error fetching user links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}