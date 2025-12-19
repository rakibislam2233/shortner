import dbConnect from "@/lib/db";
import LinkModel from "@/models/Link";
import { notFound } from "next/navigation";
import RedirectComponent from "./RedirectComponent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Server component that resolves the provided id to a stored link entry.
 *
 * If the id exists in the data store, it renders a client component that
 * displays the loading image and performs a timed redirect. Otherwise it
 * triggers the notFound() helper to render the 404 page.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Connect to database
  await dbConnect();

  // Find the link in the database
  const entry = await LinkModel.findOne({ id }).exec();

  if (!entry) {
    return notFound();
  }

  return (
    <RedirectComponent
      image={entry.image}
      urlMobile={entry.urlMobile}
      urlDesktop={entry.urlDesktop}
    />
  );
}