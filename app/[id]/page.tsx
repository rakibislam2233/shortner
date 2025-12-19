import dbConnect from "@/lib/db";
import LinkModel from "@/models/Link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Connect to database
  await dbConnect();

  // Find the link in the database
  const entry = await LinkModel.findOne({ id }).exec();

  if (!entry) {
    return notFound();
  }

  // Get headers to detect user agent
  const requestHeaders = headers();
  const userAgent = (await requestHeaders).get('user-agent') || '';

  // Determine target URL based on device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const targetUrl = isMobile ? entry.urlMobile : entry.urlDesktop || entry.urlMobile;

  // Validate the target URL to prevent open redirect vulnerabilities
  try {
    const url = new URL(targetUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return notFound();
    }
  } catch {
    return notFound();
  }

  // Perform immediate server-side redirect
  redirect(targetUrl);
}