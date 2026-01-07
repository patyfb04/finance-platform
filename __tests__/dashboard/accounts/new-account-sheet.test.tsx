import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks before importing the component - no external variables
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
  FormField: ({ render }: any) => (
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

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="button">{children}</button>
  ),
}));

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      fn({});
    },
    formState: { isSubmitting: false, errors: {} },
    reset: vi.fn(),
  }),
  Controller: ({ render }: any) =>
    render({ field: { onChange: vi.fn(), value: "" } }),
}));

// Import after all mocks
import { NewAccountSheet } from "@/app/features/accounts/components/new-account-sheet";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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
});
