"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Table from "../components/Table";
import { getMyLinks } from "@/lib/api";

export default function HomePage() {
  const [initialLinks, setInitialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await getMyLinks(token);
        setInitialLinks(response.data || []);
      } catch (error) {
        console.error("Error fetching links:", error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const username = document.cookie
    .split('; ')
    .find(row => row.startsWith('username='))
    ?.split('=')[1];

  return (
    <>
      <Header initialUsername={username ? decodeURIComponent(username) : ''} />
      <Table initialLinks={initialLinks} />
    </>
  );
}
