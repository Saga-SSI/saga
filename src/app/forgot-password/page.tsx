"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { dmSans, sagaLogoClass } from "@/app/fonts";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setSuccessMessage("Password reset link sent! Please check your email.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      setError(clerkErr.errors?.[0]?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/logo.new.svg" alt="Saga" width={32} height={32} />
          <span className={`${sagaLogoClass} text-3xl text-white`}>Saga</span>
        </div>

        <div className="mb-8 text-center">
          <h2 className={`${dmSans.className} text-3xl font-bold text-white mb-2`}>
            Reset your password
          </h2>
          <p className={`${dmSans.className} text-gray-400`}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {successMessage && (
          <div
            className={`${dmSans.className} mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center`}
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div
            className={`${dmSans.className} mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`${dmSans.className} block text-sm font-medium text-white mb-2`}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={`${dmSans.className} w-full bg-[#2A2A2A] border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF1A00] focus:border-transparent transition-all`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className={`${dmSans.className} w-full bg-[#FF1A00] hover:bg-[#E01700] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/sign-in"
            className={`${dmSans.className} text-[#FF1A00] hover:text-[#E01700] font-medium transition-colors inline-flex items-center gap-2`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 8H1M1 8L8 15M1 8L8 1" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
