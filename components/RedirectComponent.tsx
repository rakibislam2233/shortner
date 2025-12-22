"use client";
import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://rakib8080.sobhoy.com/api/v1";

interface Props {
  image: string;
  urlMobile: string;
  urlDesktop?: string;
}

export default function RedirectComponent({
  image,
  urlMobile,
  urlDesktop,
}: Props) {
  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const target = isMobile ? urlMobile : urlDesktop || urlMobile;

    let validatedTarget: string | null = null;
    try {
      const url = new URL(target);
      if (url.protocol === "http:" || url.protocol === "https:") {
        validatedTarget = url.href;
      }
    } catch {
      console.warn("Invalid redirect URL detected:", target);
      return;
    }
    if (validatedTarget) {
      const timer = setTimeout(() => {
        window.location.href = validatedTarget!;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [urlMobile, urlDesktop]);
  const getImageUrl = () => {
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/")) {
      return `${API_BASE_URL}${image}`;
    }
    return `${API_BASE_URL}/${image}`;
  };
  const imageUrl = getImageUrl();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen lg:p-8 space-y-4">
      <img
        src={imageUrl}
        alt="Loading"
        className="lg:max-w-[800px] lg:aspect-[4:3] w-full mx-auto"
      />
    </div>
  );
}
