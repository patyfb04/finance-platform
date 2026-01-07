import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNewAccount } from "@/app/features/accounts/hooks/use-new-account";

// ✅ Define proper interfaces for props
interface FormFieldProps {
  render: (args: {
    field: { onChange: () => void; value: string; name: string };
  }) => React.ReactNode;
}

interface InputProps {
  [key: string]: unknown;
}

interface HandleSubmitFunction {
  (data: Record<string, unknown>): void;
}

interface FormControllerProps {
  render: (args: {
    field: { onChange: () => void; value: string };
  }) => React.ReactNode;
}

// Mock the hooks before importing the component
vi.mock("@/app/features/accounts/hooks/use-new-account", () => ({
  useNewAccount: vi.fn(() => ({
    isOpen: false,
    onClose: vi.fn(),
  })),
}));

vi.mock("@/app/features/accounts/api/use-create-account", () => ({
  useCreateAccount: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
    reset: vi.fn(),
  })),
}));

// Mock UI components
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? (
      <div data-testid="sheet">{children}</div>
    ) : (
      <div data-testid="sheet-closed"></div>
    ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="sheet-title">{children}</h2>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="sheet-description">{children}</p>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => (
    <form data-testid="form">{children}</form>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-control">{children}</div>
  ),
  // ✅ Fix line 54: Replace any with proper interface
  FormField: ({ render }: FormFieldProps) => (
    <div data-testid="form-field">
      {render &&
        render({ field: { onChange: vi.fn(), value: "", name: "test" } })}
    </div>
  ),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-message">{children}</div>
  ),
}));

// ✅ Fix line 72: Replace any with proper interface
vi.mock("@/components/ui/input", () => ({
  Input: (props: InputProps) => <input data-testid="input" {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="button">{children}</button>
  ),
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    // ✅ Fix line 84: Replace both any types
    handleSubmit: (fn: HandleSubmitFunction) => (e: Event | undefined) => {
      e?.preventDefault?.();
      fn({});
    },
    formState: { isSubmitting: false, errors: {} },
    reset: vi.fn(),
  }),
  // ✅ Fix line 91: Replace any with proper interface
  Controller: ({ render }: FormControllerProps) =>
    render({ field: { onChange: vi.fn(), value: "" } }),
}));

// Import after all mocks
import { NewAccountSheet } from "@/app/features/accounts/components/new-account-sheet";

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

describe("NewAccountSheet", () => {
  it("component renders without crashing when closed", () => {
    expect(() => {
      render(<NewAccountSheet />, { wrapper: createWrapper() });
    }).not.toThrow();
  });

  it("component can be imported", async () => {
    // Simple test to verify the component exists
    expect(NewAccountSheet).toBeDefined();
    expect(typeof NewAccountSheet).toBe("function");
  });

  it("renders sheet content when open", () => {
    const mockUseNewAccount = vi.mocked(useNewAccount);
    mockUseNewAccount.mockReturnValue({
      isOpen: true,
      onClose: vi.fn(),
    });

    const { getByTestId } = render(<NewAccountSheet />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId("sheet")).toBeInTheDocument();
  });
});
