"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { dmMono, sortsMillGoudy, dmSans, fragmentMono } from "@/app/fonts";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerifying(true);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      const message = clerkErr?.errors?.[0]?.message || "Failed to create account";
      setError(message);
      if (process.env.NODE_ENV === "development") {
        console.error("[SignUp] Error details:", JSON.stringify(err, null, 2));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      setError(clerkErr?.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded || googleLoading) return;

    setGoogleLoading(true);
    setError("");

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      setError(clerkErr.errors?.[0]?.message || "Failed to sign up with Google");
      setGoogleLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/logo.new.svg" alt="Saga" width={32} height={32} className="mr-1" />
            <span className={`${sortsMillGoudy.className} text-4xl text-white tracking-[-0.02em]`}>
              Saga
            </span>
          </div>
          <div className="bg-[#1F1F1F] rounded-3xl p-8">
            <h1 className={`${sortsMillGoudy.className} text-4xl text-white mb-3`}>
              Verify your email
            </h1>
            <p className={`${dmMono.className} text-gray-300 mb-6`}>
              We sent a verification code to{" "}
              <span className="text-white font-medium">{email}</span>. Enter it below.
            </p>
            {error && (
              <div
                className={`${dmMono.className} mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm`}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <input
                id="code"
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter your 6-digit code"
                required
                className={`${dmSans.className} text-lg w-full bg-[#181818] border border-[#1A1A1A] text-white placeholder-gray-500 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF1A00] focus:border-transparent transition-all`}
              />
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className={`${dmSans.className} text-lg w-full bg-[#FF1A00] hover:bg-[#E01700] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setVerifying(false)}
              className={`${dmMono.className} mt-4 text-gray-400 hover:text-white text-sm transition-colors`}
            >
              ← Back to sign up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] px-6 py-12">
      <div className="w-full max-w-6xl flex items-center justify-center gap-16 lg:gap-24">
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/logo.new.svg" alt="Saga" width={32} height={32} className="mr-1" />
            <span className={`${sortsMillGoudy.className} text-4xl text-white tracking-[-0.02em]`}>
              Saga
            </span>
          </div>

          <div className="mb-10 mt-10">
            <h1
              className={`${sortsMillGoudy.className} text-5xl md:text-6xl lg:text-5xl text-white mb-3 mt-10 leading-[0.85] tracking-[-0.05em]`}
            >
              Think, Write, Create.
            </h1>
          </div>

          <div className="bg-[#1F1F1F] rounded-3xl p-8">
            {error && (
              <div
                className={`${dmMono.className} mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm`}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignUp}
              disabled={!isLoaded || googleLoading}
              className={`${fragmentMono.className} w-full flex text-lg items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin shrink-0" />
                  <span className="animate-pulse">Redirecting to Google...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                    <path
                      d="M19.8055 10.2292C19.8055 9.55015 19.7501 8.86682 19.6319 8.19904H10.2V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0879V17.5866H16.8251C18.7175 15.8449 19.8055 13.2728 19.8055 10.2292Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.2 20.0006C12.8934 20.0006 15.1612 19.1151 16.8288 17.5865L13.6062 15.0879C12.7096 15.6979 11.5478 16.0434 10.2037 16.0434C7.59675 16.0434 5.38967 14.2834 4.59976 11.9165H1.27539V14.4923C3.00135 17.8691 6.43041 20.0006 10.2 20.0006Z"
                      fill="#34A853"
                    />
                    <path
                      d="M4.59605 11.9165C4.16605 10.6746 4.16605 9.32986 4.59605 8.08794V5.51221H1.27537C-0.165124 8.33794 -0.165124 11.6665 1.27537 14.4923L4.59605 11.9165Z"
                      fill="#FBBC04"
                    />
                    <path
                      d="M10.2 3.95805C11.6246 3.93555 13.0004 4.47105 14.0367 5.45305L16.8917 2.60155C15.0754 0.904553 12.6816 -0.0316971 10.2 0.000552898C6.43041 0.000552898 3.00135 2.13205 1.27539 5.51214L4.59607 8.08787C5.38229 5.71637 7.59306 3.95805 10.2 3.95805Z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`${dmMono.className} px-4 bg-[#1F1F1F] text-gray-400`}>OR</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={`${dmSans.className} text-lg w-full bg-[#181818] border border-[#1A1A1A] text-white placeholder-gray-500 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF1A00] focus:border-transparent transition-all`}
              />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (8+ characters)"
                required
                minLength={8}
                className={`${dmSans.className} text-lg w-full bg-[#181818] border border-[#1A1A1A] text-white placeholder-gray-500 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#FF1A00] focus:border-transparent transition-all`}
              />

              <div id="clerk-captcha" data-cl-theme="dark" />

              <button
                type="submit"
                disabled={loading || !isLoaded}
                className={`${dmSans.className} text-lg w-full bg-[#FF1A00] hover:bg-[#E01700] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className={`${dmMono.className} text-center text-gray-300 text-sm mt-6`}>
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-[#FF1A00] hover:text-[#E01700] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg scale-80">
            <Image
              src="/Group 118.svg"
              alt="Decorative illustration"
              width={466}
              height={459}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
