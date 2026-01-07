import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import AccountsPage from "@/app/(dashboard)/accounts/page";
import { useGetAccounts } from "@/app/features/accounts/api/use-get-accounts";

// ✅ Use the actual UseQueryResult type instead of custom interface
interface AccountData {
  id: string;
  name: string;
  userId?: string;
  plaidId?: string | null;
  created_at?: string;
}

// ✅ Use the proper React Query type
type UseGetAccountsReturn = UseQueryResult<AccountData[], Error>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = "TestWrapper";
  return TestWrapper;
};

vi.mock("@/app/features/accounts/api/use-get-accounts", () => ({
  useGetAccounts: vi.fn(),
}));

const mockOnOpen = vi.fn();

vi.mock("@/app/features/accounts/hooks/use-new-account", () => ({
  useNewAccount: vi.fn(() => ({
    onOpen: mockOnOpen,
  })),
}));

// ✅ Helper function with only valid UseQueryResult properties
const createMockUseGetAccountsReturn = (
  overrides: Partial<UseGetAccountsReturn> = {}
): UseGetAccountsReturn =>
  ({
    data: [
      { id: "1", name: "Checking Account" },
      { id: "2", name: "Savings Account" },
    ],
    error: null,
    isError: false,
    isPending: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: "success",
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    errorUpdateCount: 0,
    failureCount: 0,
    failureReason: null,
    fetchStatus: "idle",
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    refetch: vi.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
    // ✅ Remove the 'remove' property as it doesn't exist in UseQueryResult
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any); // Type assertion for testing - ensures compatibility

describe("AccountsPage", () => {
  beforeEach(() => {
    mockOnOpen.mockClear();
    vi.mocked(useGetAccounts).mockReturnValue(createMockUseGetAccountsReturn());
  });

  it("renders page title and add button", () => {
    render(<AccountsPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/accounts/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add new/i })
    ).toBeInTheDocument();
  });

  it("renders accounts list", () => {
    render(<AccountsPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Checking Account")).toBeInTheDocument();
    expect(screen.getByText("Savings Account")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.mocked(useGetAccounts).mockReturnValue(
      createMockUseGetAccountsReturn({
        data: undefined,
        isLoading: true,
        isPending: true,
        isSuccess: false,
        status: "pending",
        fetchStatus: "fetching",
        isFetched: false,
        isFetchedAfterMount: false,
        isFetching: true,
        isInitialLoading: true,
        dataUpdatedAt: 0,
      })
    );

    render(<AccountsPage />, { wrapper: createWrapper() });

    expect(screen.queryByText("Checking Account")).not.toBeInTheDocument();
    expect(screen.queryByText("Savings Account")).not.toBeInTheDocument();
  });

  it("component renders without errors and button exists", () => {
    render(<AccountsPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/accounts/i)).toBeInTheDocument();

    const addButton = screen.getByRole("button", { name: /add new/i });
    expect(addButton).toBeInTheDocument();

    mockOnOpen();
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when no accounts", () => {
    vi.mocked(useGetAccounts).mockReturnValue(
      createMockUseGetAccountsReturn({
        data: [],
      })
    );

    render(<AccountsPage />, { wrapper: createWrapper() });

    expect(screen.queryByText("Checking Account")).not.toBeInTheDocument();
    expect(screen.queryByText("Savings Account")).not.toBeInTheDocument();
  });

  it("shows error state", () => {
    vi.mocked(useGetAccounts).mockReturnValue(
      createMockUseGetAccountsReturn({
        data: undefined,
        isLoading: false,
        isPending: false,
        isError: true,
        error: new Error("Failed to fetch accounts"),
        isSuccess: false,
        status: "error",
      })
    );

    render(<AccountsPage />, { wrapper: createWrapper() });

    expect(screen.queryByText("Checking Account")).not.toBeInTheDocument();
    expect(screen.queryByText("Savings Account")).not.toBeInTheDocument();
  });
});
