// Fixed: Updated home page with database validation
import { getUserLinks } from '@/lib/actions';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "../components/Header";
import Table from "../components/Table";

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
