// Fixed: Updated home page with database validation
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Table from "./components/Table";
import Header from "./components/Header";
import { getUserLinks } from '@/lib/actions';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function HomePage() {
  const username = (await cookies()).get('username')?.value;
  if (!username) {
    redirect("/login");
  }
  await dbConnect();
  const user = await User.findOne({ username }).exec();
  if (!user) {
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
