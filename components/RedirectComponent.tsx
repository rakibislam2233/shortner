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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Basic mobile detection using user agent strings
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Use desktop URL if available and the device is not mobile
    const target = isMobile ? urlMobile : urlDesktop || urlMobile;

    // Security: Validate URL to prevent open redirect attacks
    let validatedTarget: string | null = null;
    try {
      const url = new URL(target);
      // Allow only HTTP and HTTPS protocols
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen lg:p-8 space-y-4">
      {image ? (
        <div className="relative w-full lg:max-w-[800px]">
          {/* Actual image */}
          <img
            src={`${API_BASE_URL}/${image}`}
            alt="Redirecting"
            width={800}
            height={600}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`lg:max-w-[800px] lg:aspect-[4/3] w-full mx-auto rounded-lg transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      ) : (
        // Default skeleton when no image provided
        <div className="w-full lg:max-w-[800px]">
          <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg lg:aspect-[4/3] h-64 lg:h-[600px]">
            <div className="flex items-center justify-center h-full">
              <div className="space-y-3 text-center">
                <div className="w-16 h-16 border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 text-lg font-medium">
                  Redirecting...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
