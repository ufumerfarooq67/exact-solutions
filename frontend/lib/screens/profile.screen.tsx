"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";
import { Badge } from "@/lib/components/ui/badge";
import { User, Shield, Edit, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../utils/queryClient";
import { toast } from "../hooks/use-toast";

export default function Profile() {
  const { user, login } = useAuth(); // assume setUser updates auth context
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  if (!user) return null;

  // API - Hooks
  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => apiRequest("PATCH", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/users/profile`, data),
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      login(updatedUser); // update context
      setEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleSave = () => {
    updateMutation.mutate({ name });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Account Information</CardTitle>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-blue-500 flex items-center gap-1">
                <Edit className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="text-green-500 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name);
                  }}
                  className="text-red-500 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editing ? (
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-2 py-1" />
                ) : (
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                )}
                <Badge className="mt-2">{user?.role === "admin" ? "Administrator" : "User"}</Badge>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-md bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>

                  <p className="text-base font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-base font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
              <p className="text-xs font-mono bg-muted p-2 rounded">{user?.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
