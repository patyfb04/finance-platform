import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hono client - no external variables
vi.mock("@/lib/hono", () => ({
  client: {
    api: {
      transactions: {
        $get: vi.fn(),
      },
    },
  },
}));

// Mock next/navigation - no external variables
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
    toString: vi.fn(() => ""),
  })),
}));

import { useGetTransactions } from "@/app/features/transactions/api/use-get-transactions";
import { client } from "@/lib/hono";
import { useSearchParams } from "next/navigation";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGetTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches transactions successfully", async () => {
    const mockTransactions = [
      { id: "1", amount: 100, payee: "Test Payee 1" },
      { id: "2", amount: 200, payee: "Test Payee 2" },
    ];

    vi.mocked(client.api.transactions.$get).mockResolvedValue({
      json: () => Promise.resolve({ data: mockTransactions }),
      ok: true,
    } as any);

    const { result } = renderHook(() => useGetTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTransactions);
  });

  it("fetches transactions with search params", async () => {
    const mockTransactions = [
      { id: "1", amount: 100, payee: "Test Payee 1", accountId: "acc1" },
    ];

    // Mock useSearchParams to return specific values
    const mockGet = vi.fn().mockImplementation((key: string) => {
      switch (key) {
        case "accountId":
          return "acc1";
        case "from":
          return "2023-01-01";
        case "to":
          return "2023-12-31";
        default:
          return null;
      }
    });

    vi.mocked(useSearchParams).mockReturnValue({
      get: mockGet,
      toString: vi.fn(() => ""),
    } as any);

    vi.mocked(client.api.transactions.$get).mockResolvedValue({
      json: () => Promise.resolve({ data: mockTransactions }),
      ok: true,
    } as any);

    const { result } = renderHook(() => useGetTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTransactions);
    expect(mockGet).toHaveBeenCalledWith("accountId");
  });

  it("handles API errors", async () => {
    const mockError = new Error("Failed to fetch transactions");

    vi.mocked(client.api.transactions.$get).mockRejectedValue(mockError);

    const { result } = renderHook(() => useGetTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it("hook has correct structure", () => {
    vi.mocked(client.api.transactions.$get).mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
      ok: true,
    } as any);

    const { result } = renderHook(() => useGetTransactions(), {
      wrapper: createWrapper(),
    });

    // Verify the hook returns expected properties
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("isSuccess");
  });

  it("handles empty search params", async () => {
    // Reset to default mock behavior (returns null)
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn(() => null),
      toString: vi.fn(() => ""),
    } as any);

    vi.mocked(client.api.transactions.$get).mockResolvedValue({
      json: () => Promise.resolve({ data: [] }),
      ok: true,
    } as any);

    const { result } = renderHook(() => useGetTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
