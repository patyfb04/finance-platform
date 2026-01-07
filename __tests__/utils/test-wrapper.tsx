import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

interface TestWrapperProps {
  children: ReactNode;
}

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: "/",
  query: {},
  asPath: "/",
  route: "/",
  basePath: "",
  locale: undefined,
  locales: undefined,
  defaultLocale: undefined,
  domainLocales: undefined,
  isReady: true,
  isPreview: false,
  isLocaleDomain: false,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

export const TestWrapper = ({ children }: TestWrapperProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
      },
    },
  });

  return (
    <ClerkProvider
      publishableKey="pk_test_fake_key_for_testing"
      appearance={{
        baseTheme: undefined,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  );
};
