import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEditAccount } from "@/app/features/accounts/api/use-edit-account";
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
          $patch: vi.fn(),
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

describe("useEditAccount", () => {
  it("edits account successfully", async () => {
    const accountId = "account-1";
    const updatedAccount = { id: accountId, name: "Updated Account" };
    const mockResponse = {
      json: vi.fn().mockResolvedValue({ data: updatedAccount }),
      ok: true,
      status: 200,
      statusText: "OK",
    } as any;

    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts[":id"].$patch).mockResolvedValue(
      mockResponse
    );

    const { result } = renderHook(() => useEditAccount(accountId), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: "Updated Account" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(client.api.accounts[":id"].$patch).toHaveBeenCalledWith({
      param: { id: accountId },
      json: { name: "Updated Account" },
    });
    expect(toast.success).toHaveBeenCalledWith("Account updated");
  });

  it("handles edit error", async () => {
    const accountId = "account-1";
    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts[":id"].$patch).mockRejectedValue(
      new Error("Update failed")
    );

    const { result } = renderHook(() => useEditAccount(accountId), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: "Updated Account" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to updated Account");
  });
});
