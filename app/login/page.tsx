"use client";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { login } from "@/lib/api";
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username.trim() || !password) {
      toast.error("Please provide both a username and a password.");
      setLoading(false);
      return;
    }

    try {
      const response = await login(username.trim().toLowerCase(), password);

      // Store tokens and user info in cookies
      document.cookie = `accessToken=${response.data.tokens.accessToken}; path=/; max-age=3600`; // 1 hour
      document.cookie = `refreshToken=${response.data.tokens.refreshToken}; path=/; max-age=2592000`; // 30 days
      document.cookie = `username=${encodeURIComponent(response.data.user.email)}; path=/; max-age=3600`; // 1 hour

      toast.success("Login successful!");
      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto mt-16 p-6 rounded-lg shadow-xl bg-white/90 backdrop-blur-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-medium px-4 py-2 rounded-md shadow transition-opacity duration-200 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
        {/* <p className="mt-6 text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-purple-600 hover:text-purple-800 underline">
            Register here
          </Link>
        </p> */}
      </motion.div>
    </>
  );
}
