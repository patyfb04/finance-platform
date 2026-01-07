import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}));

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  auth: () => ({ userId: "user_test123" }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  ClerkLoaded: ({ children }: { children: React.ReactNode }) => children,
  ClerkLoading: ({ children }: { children: React.ReactNode }) => null,
  useUser: () => ({ user: { id: "user_test123" } }),
  SignIn: (props: any) => {
    console.log("SignIn props:", props);
    return React.createElement(
      "div",
      {
        "data-testid": "clerk-signin",
        "data-after-sign-in-url": props.afterSignInUrl || "no-url-provided",
      },
      "Mocked SignIn Component"
    );
  },
  SignUp: (props: any) => {
    console.log("SignUp props:", props); // Debug log
    return React.createElement(
      "div",
      {
        "data-testid": "clerk-signup",
        "data-after-sign-up-url": props.afterSignUpUrl || "no-url-provided",
      },
      "Mocked SignUp Component"
    );
  },
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
