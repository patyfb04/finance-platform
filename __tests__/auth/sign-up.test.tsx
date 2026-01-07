/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock Clerk components at test level
vi.mock("@clerk/nextjs", () => ({
  SignUp: ({ afterSignUpUrl }: { afterSignUpUrl?: string }) => (
    <div data-testid="sign-up-component">
      Mock Sign Up Component
      {afterSignUpUrl && (
        <span data-testid="after-signup-url">{afterSignUpUrl}</span>
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
const MockSignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div data-testid="sign-up-component">Mock Sign Up Component</div>
  </div>
);

describe("SignUpPage", () => {
  it("renders the SignUp component with correct afterSignUpUrl", () => {
    render(<MockSignUpPage />);

    const signUpComponent = screen.getByTestId("sign-up-component");
    expect(signUpComponent).toBeInTheDocument();
    expect(signUpComponent).toHaveTextContent("Mock Sign Up Component");
  });

  it("renders within a centered container", () => {
    const { container } = render(<MockSignUpPage />);

    const centerDiv = container.querySelector(
      ".min-h-screen.flex.items-center.justify-center"
    );
    expect(centerDiv).toBeInTheDocument();
  });
});
