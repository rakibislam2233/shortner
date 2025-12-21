"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../../components/Header";
import { register } from "@/lib/api";
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password || !fullName) {
      setError("Please provide all required fields.");
      return;
    }
    try {
      const response = await register(fullName, email, password);
      if (response.success) {
        // Store tokens and user info in cookies
        document.cookie = `accessToken=${response.data.tokens.accessToken}; path=/; max-age=3600`; // 1 hour
        document.cookie = `refreshToken=${response.data.tokens.refreshToken}; path=/; max-age=2592000`; // 30 days
        document.cookie = `username=${encodeURIComponent(
          response.data.user.email
        )}; path=/; max-age=3600`; // 1 hour

        // Redirect to verify OTP page
        router.push("/verify-otp");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <>
      {/* Header for registration page. Without authentication the
          header will display only the app title. */}
      <Header />
      <div className="max-w-md mx-auto mt-16 p-6 rounded-lg shadow-xl bg-white/90 backdrop-blur-md animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullname(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-medium px-4 py-2 rounded-md shadow transition-opacity duration-200"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </>
  );
}
