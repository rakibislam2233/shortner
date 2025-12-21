"use client";
import React, { useEffect, useState } from "react";
import RedirectComponent from "./RedirectComponent";
import { LinkEntry } from "./Table";
import { useParams } from "next/navigation";
import { getLinkBySlug } from "@/lib/api";
import { toast } from "sonner";
const LinkDetailsPage = () => {
  const { slug } = useParams();
  const [link, setLink] = useState<LinkEntry>({
    _id: "",
    imageName: "",
    slug: "",
    image: "",
    urlMobile: "",
    urlDesktop: "",
    createdAt: "",
  });

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        if (!token) {
          toast.error("Authentication required");
          return;
        }
        const response = await getLinkBySlug(slug as string, token);
        if (response.code === 200) {
          setLink(response?.data);
        }
      } catch (error) {
        console.error("Error fetching link:", error);
      }
    };
    fetchLink();
  }, [slug]);
  return (
    <RedirectComponent
      image={link.image}
      urlMobile={link.urlMobile}
      urlDesktop={link.urlDesktop}
    />
  );
};

export default LinkDetailsPage;
