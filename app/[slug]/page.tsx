import { notFound } from "next/navigation";
import { Metadata } from "next";
import RedirectComponent from "@/components/RedirectComponent";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://rakib8080.sobhoy.com/api/v1";

interface LinkEntry {
  slug: string;
  image: string;
  urlMobile: string;
  urlDesktop?: string;
  imageName: string;
}

async function getLinkBySlug(slug: string): Promise<LinkEntry | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/links/slug/${slug}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.code === 200 ? data.data : null;
  } catch (error) {
    console.error("Error fetching link:", error);
    return null;
  }
}

// Generate metadata for Facebook/Twitter
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link) {
    return {
      title: "Link Not Found",
    };
  }

  const imageUrl = link.image.startsWith("http")
    ? link.image
    : `${API_BASE_URL}/${link.image}`;

  const currentUrl = `https://brcanva.com/${slug}`;

  return {
    title: link.imageName || "Redirecting...",
    description: "Click to continue",
    openGraph: {
      type: "website",
      url: currentUrl,
      title: link.imageName || "Redirecting...",
      description: "Click to continue",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: link.imageName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: link.imageName || "Redirecting...",
      description: "Click to continue",
      images: [imageUrl],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link) {
    return notFound();
  }

  return (
    <RedirectComponent
      image={link.image}
      urlMobile={link.urlMobile}
      urlDesktop={link.urlDesktop}
    />
  );
}
