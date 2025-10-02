'use client';
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Food Image Classifier
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload a food image and discover what dish it is with our AI-powered classifier
        </p>
        <div className="space-x-4">
          {status === "authenticated" ? (
            <>
              <Link
                href="/profile"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
              >
                Profile
              </Link>
              <Link
                href="/classifier"
                className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
              >
                Classify Food
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}