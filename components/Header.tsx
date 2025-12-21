"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/lib/api";
import { motion } from "framer-motion";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (token) {
        await logout(token);
      }

      // Clear all cookies
      document.cookie = "accessToken=; Max-Age=-99999999; path=/";
      document.cookie = "refreshToken=; Max-Age=-99999999; path=/";

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");

      // Clear cookies anyway
      document.cookie = "accessToken=; Max-Age=-99999999; path=/";
      document.cookie = "refreshToken=; Max-Age=-99999999; path=/";
      document.cookie = "username=; Max-Age=-99999999; path=/";
      router.push("/login");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8 flex items-center justify-between rounded-lg shadow-md p-4 bg-gradient-to-l from-blue-600 via-purple-600 to-pink-600 text-white"
    >
      <div className="flex flex-col lg:flex-row items-center space-x-2 text-xl md:text-2xl tracking-tight font-bold ">
        {/* App logo icon (simple link icon) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 015.657 0l1.414 1.415a4 4 0 010 5.657l-3.182 3.182a4 4 0 01-5.657 0l-.708-.708"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.172 13.828a4 4 0 01-5.657 0l-1.415-1.415a4 4 0 010-5.657l3.182-3.182a4 4 0 015.657 0l.708.708"
          />
        </svg>
        <span>Nobita Shortener</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center items-end gap-4">
        <span className="flex items-center text-sm md:text-base font-medium">
          {/* User icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h1>Rakib</h1>
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center bg-white/20 hover:bg-red-600 text-white px-3 py-1 md:px-4 md:py-2 rounded transition-colors duration-300"
        >
          {/* Sign-out icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0V7a3 3 0 016 0v1"
            />
          </svg>
          Logout
        </motion.button>
      </div>
    </motion.header>
  );
}
