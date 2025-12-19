import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Table from "./components/Table";
import Header from "./components/Header";
import { getUserLinks } from '@/lib/actions';

/**
 * The root page loads the existing links from the database on the
 * server and passes them to a client component to render. This page
 * itself is a server component, which makes it easy to read data
 * from the database synchronously at request time.
 */
export default async function HomePage() {
  // Read the username from cookies. If no cookie is present, redirect
  // to the login page. We only perform this check on the server to
  // prevent rendering any of the authenticated UI for anonymous users.
  const cookieStore = cookies();
  const username = (await cookies()).get('username')?.value;
  if (!username) {
    redirect("/login");
  }

  // Get user's links from the database
  const initialLinks = await getUserLinks();

  return (
    <>
      <Header initialUsername={username} />
      <Table initialLinks={initialLinks} />
    </>
  );
}
