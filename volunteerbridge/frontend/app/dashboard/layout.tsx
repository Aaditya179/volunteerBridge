/**
 * Dashboard layout — AuthGuard + Sidebar + TopBar wrapper.
 */

"use client";

import AuthGuard from "@/components/shell/AuthGuard";
import Sidebar from "@/components/shell/Sidebar";
import TopBar from "@/components/shell/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-[240px] transition-all duration-300">
          <TopBar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
