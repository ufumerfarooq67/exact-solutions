"use client"

// app/(auth)/layout.tsx
import { AuthenticatedLayout, ProtectedRoute } from "@/lib/layouts";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // This is a Server Component that safely renders your Client Component
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>;
    </ProtectedRoute>
  );
}
