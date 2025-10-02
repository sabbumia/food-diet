"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome Back! 👋
          </h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Name</p>
              <p className="text-xl font-semibold text-gray-800">
                {session.user?.name}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-xl font-semibold text-gray-800">
                {session.user?.email}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">Age</p>
              <p className="text-xl font-semibold text-gray-800">
                {(session.user as any)?.age || "N/A"}
              </p>
            </div>

            <div className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">User ID</p>
              <p className="text-xl font-semibold text-gray-800">
                {(session.user as any)?.id}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🎉 Account Active
            </h3>
            <p className="text-blue-700">
              Your account is successfully authenticated and all your information is securely stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}