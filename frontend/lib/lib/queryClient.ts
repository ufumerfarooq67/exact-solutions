import { QueryFunction } from "@tanstack/react-query";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// lib/lib/apiRequest.ts
export async function apiRequest<T = any>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  body?: any
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = new Error("Network response was not ok") as any;
    try {
      error.info = await res.json();
    } catch {
      error.info = {};
    }
    throw error;
  }

  // DELETE or 204: return undefined, cast as any to allow void
  if (method === "DELETE" || res.status === 204) {
    return undefined as any;
  }

  // Otherwise parse JSON
  const text = await res.text();
  if (!text) return {} as T; // fallback empty object
  return JSON.parse(text) as T;
}



type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

