import dbConnect from "@/lib/db";
import LinkModel from "@/models/Link";
import { notFound } from "next/navigation";
import RedirectComponent from "./RedirectComponent";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Connect to database
  await dbConnect();

  // Find the link in the database using imageName
  const entry = await LinkModel.findOne({ imageName: id }).exec();

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