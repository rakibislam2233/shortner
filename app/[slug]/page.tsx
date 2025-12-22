import { notFound } from "next/navigation";
import RedirectComponent from "@/components/RedirectComponent";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getLinkBySlug(slug: string, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/links/slug/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.code === 200 ? data.data : null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return notFound();
  }
  const link = await getLinkBySlug(slug, token);

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
