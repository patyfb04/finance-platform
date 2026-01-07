import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteAccount } from "@/app/features/accounts/api/use-delete-account";
import { toast } from "sonner";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

vi.mock("@/lib/hono", () => ({
  client: {
    api: {
      accounts: {
        ":id": {
          $delete: vi.fn(),
        },
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useDeleteAccount", () => {
  it("deletes account successfully", async () => {
    const accountId = "account-1";
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: { id: accountId } }),
      ok: true,
      status: 200,
      statusText: "OK",
    } as any;

    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts[":id"].$delete).mockResolvedValue(
      mockResponse
    );

    const { result } = renderHook(() => useDeleteAccount(accountId), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(client.api.accounts[":id"].$delete).toHaveBeenCalledWith({
      param: { id: accountId },
    });
    expect(toast.success).toHaveBeenCalledWith("Account deleted");
  });

  it("handles delete error", async () => {
    const accountId = "account-1";
    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts[":id"].$delete).mockRejectedValue(
      new Error("Delete failed")
    );

    const { result } = renderHook(() => useDeleteAccount(accountId), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to delete Account");
  });

  it("invalidates queries after successful deletion", async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: { id: "account-1" } }),
      ok: true,
      status: 200,
      statusText: "OK",
    } as any;

    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts[":id"].$delete).mockResolvedValue(
      mockResponse
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteAccount("account-1"), {
      wrapper,
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["accounts"],
    });
  });
});
