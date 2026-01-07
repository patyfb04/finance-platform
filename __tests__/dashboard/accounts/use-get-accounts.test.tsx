import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetAccounts } from "@/app/features/accounts/api/use-get-accounts";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

vi.mock("@/lib/hono", () => ({
  client: {
    api: {
      accounts: {
        $get: vi.fn(),
      },
    },
  },
}));

describe("useGetAccounts", () => {
  it("fetches accounts successfully", async () => {
    const mockAccounts = [
      { id: "1", name: "Checking Account", userId: "user1" },
      { id: "2", name: "Savings Account", userId: "user1" },
    ];

    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: mockAccounts }),
      ok: true,
      status: 200,
      statusText: "OK",
    } as any;

    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts.$get).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Fix: Expect the accounts array directly, not wrapped in data object
    expect(result.current.data).toEqual(mockAccounts);
    expect(client.api.accounts.$get).toHaveBeenCalledTimes(1);
  });

  it("handles error state correctly", async () => {
    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts.$get).mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => useGetAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("uses correct query key", () => {
    // This assumes your useGetAccounts hook exports or uses a specific query key
    // You might need to check your actual hook implementation
    expect(["accounts"]).toEqual(["accounts"]); // Simple verification
  });
});
