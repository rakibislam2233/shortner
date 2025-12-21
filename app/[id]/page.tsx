import { notFound } from "next/navigation";
import RedirectComponent from "./RedirectComponent";
import { getLinkBySlug } from "@/lib/api";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Get the link by slug from external API
    const response = await getLinkBySlug(id);
    const entry = response.data;

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
  } catch (error) {
    console.error("Error fetching link:", error);
    return notFound();
  }
}