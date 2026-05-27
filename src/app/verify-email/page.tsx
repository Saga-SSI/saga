"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { dmMono, sortsMillGoudy, dmSans, sagaLogoClass } from "@/app/fonts";

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1C1C] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo.new.svg" alt="Saga" width={32} height={32} className="mr-1" />
          <span className={`${sagaLogoClass} text-4xl text-white tracking-[-0.02em]`}>
            Saga
          </span>
        </div>
        <div className="bg-[#1F1F1F] rounded-3xl p-8">
          <h1 className={`${sortsMillGoudy.className} text-4xl text-white mb-3`}>Verify your email</h1>
          <p className={`${dmMono.className} text-gray-300 mb-6`}>
            Email verification happens on the sign-up page. If you&apos;ve just signed up, check
            your email for a 6-digit code and enter it on the sign-up form.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/sign-up")}
              className={`${dmSans.className} w-full text-lg bg-[#FF1A00] hover:bg-[#E01700] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200`}
            >
              Go to sign up
            </button>
            <p className={`${dmMono.className} text-center text-gray-400 text-sm`}>
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#FF1A00] hover:text-[#E01700] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
