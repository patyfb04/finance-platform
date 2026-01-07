import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteAccount } from "@/app/features/accounts/api/use-delete-account";

const createMockResponse = (data: unknown, status = 200, ok = true) =>
  ({
    json: vi.fn().mockResolvedValue(data),
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    body: null,
    bodyUsed: false,
    headers: new Headers(),
    url: "http://localhost/api",
    redirected: false,
    type: "basic" as ResponseType,
    clone: vi.fn(),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    formData: vi.fn().mockResolvedValue(new FormData()),
    text: vi.fn().mockResolvedValue(""),
    redirect: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
TestWrapper.displayName = "TestWrapper";

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

describe("useDeleteAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete account successfully", async () => {
    const accountId = "account-1";
    const mockResponse = createMockResponse({ data: { id: accountId } }, 200);

    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts[":id"].$delete).mockResolvedValue(
      mockResponse
    );

    const { result } = renderHook(() => useDeleteAccount(accountId), {
      wrapper: TestWrapper,
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(client.api.accounts[":id"].$delete).toHaveBeenCalledWith({
      param: { id: accountId },
    });
    expect(result.current.isError).toBe(false);
  });

  it("should handle error response", async () => {
    const { client } = await import("@/lib/hono");

    vi.mocked(client.api.accounts[":id"].$delete).mockRejectedValue(
      new Error("Delete failed")
    );

    const { result } = renderHook(() => useDeleteAccount("invalid-id"), {
      wrapper: TestWrapper,
    });

    result.current.mutate();

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000, interval: 100 }
    );

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Delete failed");
    expect(result.current.isSuccess).toBe(false);
    // ✅ Fix: Use isPending instead of isLoading
    expect(result.current.isPending).toBe(false);
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useDeleteAccount("test-id"), {
      wrapper: TestWrapper,
    });

    expect(result.current.isIdle).toBe(true);
    // ✅ Fix: Use isPending instead of isLoading
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should show pending state during mutation", async () => {
    const { client } = await import("@/lib/hono");

    // ✅ Mock a delayed response to test pending state
    vi.mocked(client.api.accounts[":id"].$delete).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(createMockResponse({ data: { id: "test" } })),
            100
          )
        )
    );

    const { result } = renderHook(() => useDeleteAccount("test-id"), {
      wrapper: TestWrapper,
    });

    // ✅ Before mutation
    expect(result.current.isPending).toBe(false);

    // ✅ Start mutation
    result.current.mutate();

    // ✅ Should be pending
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // ✅ Should complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isPending).toBe(false);
    });
  });
});

const ComponentName = () => {
  return <div>Content</div>;
};
ComponentName.displayName = "ComponentName";
export default ComponentName;
