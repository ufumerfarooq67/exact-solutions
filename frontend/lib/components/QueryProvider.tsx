// components/QueryProvider.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // cache queries for 1 minute
      retry: 1, // retry failed queries once
      refetchOnWindowFocus: false, // don't auto refetch on window focus
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Ensure the QueryClient is only created once (state hook)
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}

      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
