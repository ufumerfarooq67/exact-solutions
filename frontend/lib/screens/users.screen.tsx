"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";
import { Badge } from "@/lib/components/ui/badge";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { Users as UsersIcon } from "lucide-react";
import { apiRequest } from "../utils/queryClient";
import { IUser } from "../types";
import { USERS_QUERY_KEY } from "../constants";

export default function Users() {
  const { data: users, isLoading: usersLoading } = useQuery<IUser[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => apiRequest<IUser[]>("GET", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/users`),
  });

  if (usersLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Users
        </h1>
        <p className="text-muted-foreground">Manage team members and their roles</p>
      </div>

      {users && users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user) => (
            <Card key={user.id} data-testid={`card-user-${user.id}`}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate" data-testid={`text-name-${user.id}`}>
                    {user.name}
                  </CardTitle>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1" data-testid={`badge-role-${user.id}`}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate" data-testid={`text-email-${user.id}`}>
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">ID: {user.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
