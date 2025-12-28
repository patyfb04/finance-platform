"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

type Props = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: Props) {
  const queryClient = getQueryClient({ children });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
