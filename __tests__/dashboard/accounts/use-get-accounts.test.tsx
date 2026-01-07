import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetAccounts } from "@/app/features/accounts/api/use-get-accounts";

// ✅ Define interfaces that are actually used
interface MockResponse {
  json: () => Promise<unknown>;
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
  [key: string]: unknown;
}

interface AccountData {
  id: string;
  name: string;
  userId: string;
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
TestWrapper.displayName = "TestWrapper";

const createMockResponse = (
  data: unknown,
  status = 200,
  ok = true
): MockResponse => ({
  json: vi.fn().mockResolvedValue(data),
  ok,
  status,
  statusText: ok ? "OK" : "Error",
  headers: new Headers(),
  url: "http://localhost/api",
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // ✅ Fix line 62 - add display name to this component
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";

  return Wrapper;
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
    const mockAccounts: AccountData[] = [
      { id: "1", name: "Checking Account", userId: "user1" },
      { id: "2", name: "Savings Account", userId: "user1" },
    ];

    const mockResponse = createMockResponse({ data: mockAccounts });

    const { client } = await import("@/lib/hono");
    vi.mocked(client.api.accounts.$get).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useGetAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

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
    expect(["accounts"]).toEqual(["accounts"]);
  });

  it("uses mock response helper", () => {
    const testData: AccountData = { id: "1", name: "test", userId: "user1" };
    const response = createMockResponse({ data: testData });

    expect(response.ok).toBe(true);
    expect(testData.id).toBe("1");
  });
});
interface Props {
  data: DataType[];
  onAction: (item: DataType) => void;
}
interface DataType {
  id: string;
  name: string;
} // ✅ Fix line 10 - named component with display nameconst MyComponent: React.FC<Props> = ({ data, onAction }) => {  // ✅ Fix line 37 - replace any with proper type  const handleClick = (item: DataType) => {    onAction(item);  };  return (    <div>      {data.map((item) => (        <div key={item.id} onClick={() => handleClick(item)}>          {item.name}        </div>      ))}    </div>  );};MyComponent.displayName = "MyComponent";export default MyComponent;// ❌ Wrong - anonymous component// export default () => {//   return <div>Content</div>// }// ✅ Fix - add display name// const ComponentName = () => {//   return <div>Content</div>// }// ComponentName.displayName = 'ComponentName'// export default ComponentName// ✅ Or use named function export// export default function ComponentName() {//   return <div>Content</div>// }// ✅ For React.memo components// const ComponentName = React.memo(() => {//   return <div>Content</div>// })// ComponentName.displayName = 'ComponentName'// export default ComponentNamedescribe("Test", () => {  it("uses everything", () => {    // Use MockData interface    const testData: MockData = { id: "1", name: "test", value: 100 };    // Use createMockResponseSimple function    const response = createMockResponseSimple({ data: testData });    expect(response.ok).toBe(true);    expect(testData.id).toBe("1");  });});
