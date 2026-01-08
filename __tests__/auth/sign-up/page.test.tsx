import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../../../app/(auth)/sign-up/[[...sign-up]]/page";

// Mock Clerk and Lucide components
vi.mock("@clerk/nextjs", () => ({
  ClerkLoaded: ({ children }: any) => <>{children}</>,
  ClerkLoading: ({ children }: any) => <>{children}</>,
  SignUp: () => <div>SignUp Component</div>,
}));
vi.mock("lucide-react", () => ({
  Loader2: () => <div>Loader</div>,
}));
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe("Page", () => {
  it("renders welcome message", () => {
    render(<Page />);
    expect(screen.getByText("Welcome back!")).not.toBeNull();
    expect(screen.getByText(/Log In or Create and account/i)).not.toBeNull();
  });

  it("renders SignUp component", () => {
    render(<Page />);
    const signUpComponents = screen.getAllByText("SignUp Component");
    expect(signUpComponents.length).toBeGreaterThan(0);
  });

  it("renders logo image", () => {
    render(<Page />);
    const logos = screen.getAllByAltText("Logo");
    expect(logos.length).toBeGreaterThan(0);
  });
});
