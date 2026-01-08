import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import Page from "../../../app/(auth)/sign-in/[[...sign-in]]/page";

// Mock Clerk and Lucide components
vi.mock("@clerk/nextjs", () => ({
  ClerkLoaded: ({ children }: PropsWithChildren<object>) => <>{children}</>,
  ClerkLoading: ({ children }: PropsWithChildren<object>) => <>{children}</>,
  SignIn: () => <div>SignIn Component</div>,
}));
vi.mock("lucide-react", () => ({
  Loader2: () => <div>Loader</div>,
}));
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe("Page", () => {
  it("renders welcome message", () => {
    render(<Page />);
    expect(screen.getByText("Welcome back!")).not.toBeNull();
    expect(screen.getByText(/Log In or Create and account/i)).not.toBeNull();
  });

  it("renders SignIn component", () => {
    render(<Page />);
    const signInComponents = screen.getAllByText("SignIn Component");
    expect(signInComponents.length).toBeGreaterThan(0);
  });

  it("renders logo image", () => {
    render(<Page />);
    const logos = screen.getAllByAltText("Logo");
    expect(logos.length).toBeGreaterThan(0);
  });
});
