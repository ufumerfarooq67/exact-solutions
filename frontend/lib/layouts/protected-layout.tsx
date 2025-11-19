"use client"

import { useAuth } from "@/lib/contexts/auth-context";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { redirect } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return redirect("/login");
  }

  if (requireAdmin && !isAdmin) {
    return redirect("/dashboard");
  }

  return <>{children}</>;
}
