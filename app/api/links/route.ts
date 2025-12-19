import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';


export async function GET(req: NextRequest) {
  const usernameCookie = req.cookies.get('username');
  const username = usernameCookie?.value;
  if (!username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const dataFile = path.join(process.cwd(), 'data', 'links.json');
  try {
    const json = await fs.readFile(dataFile, 'utf8');
    const linksData = JSON.parse(json) as Record<string, any>;
    const hasFlatEntries = Object.values(linksData).some((v: any) =>
      v && typeof v === 'object' && 'id' in v
    );
    if (hasFlatEntries) {
      return NextResponse.json(linksData);
    }
    const userLinks = linksData[username] ?? {};
    return NextResponse.json(userLinks);
  } catch {
    return NextResponse.json({});
  }
}