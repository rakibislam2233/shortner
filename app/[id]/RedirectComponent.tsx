"use client";
import Image from "next/image";
import { useEffect } from "react";

interface Props {
  image: string;
  urlMobile: string;
  urlDesktop?: string;
}

export default function RedirectComponent({ image, urlMobile, urlDesktop }: Props) {
  useEffect(() => {
    // Basic mobile detection using user agent strings. You may refine this as needed.
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    // Use desktop URL if available and the device is not mobile; otherwise fallback to mobile
    const target = isMobile ? urlMobile : urlDesktop || urlMobile;
    
    // Security: Validate URL to prevent open redirect attacks
    let validatedTarget: string | null = null;
    try {
      const url = new URL(target);
      // Allow only HTTP and HTTPS protocols
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        validatedTarget = url.href;
      }
    } catch {
      // If parsing fails, treat as invalid URL
      console.warn('Invalid redirect URL detected:', target);
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
      <Image
        src={image.startsWith('/') ? image : `/${image}`}
        alt="Loading"
        width={800}
        height={600}
        loading="lazy"
        className="lg:max-w-[800px] lg:aspect-[4:3] w-full mx-auto"
      />
    </div>
  );
}