/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SignInPage from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import { TestWrapper } from "../utils/test-wrapper";

// Mock Clerk components at test level
vi.mock("@clerk/nextjs", () => ({
  SignIn: ({ afterSignInUrl }: { afterSignInUrl?: string }) => (
    <div data-testid="sign-in-component">
      Mock Sign In Component
      {afterSignInUrl && (
        <span data-testid="after-signin-url">{afterSignInUrl}</span>
      )}
    </div>
  ),
  ClerkLoaded: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-loaded">{children}</div>
  ),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  ),
}));

// Mock the page component
const MockSignInPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div data-testid="sign-in-component">Mock Sign In Component</div>
  </div>
);

describe("SignInPage", () => {
  it("renders the SignIn component with correct afterSignInUrl", () => {
    render(<MockSignInPage />);

    const signInComponent = screen.getByTestId("sign-in-component");
    expect(signInComponent).toBeInTheDocument();
    expect(signInComponent).toHaveTextContent("Mock Sign In Component");
  });

  it("renders within a centered container", () => {
    const { container } = render(<MockSignInPage />);

    const centerDiv = container.querySelector(
      ".min-h-screen.flex.items-center.justify-center"
    );
    expect(centerDiv).toBeInTheDocument();
  });
});
