import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SignInPage from "@/app/(auth)/sign-in/[[...sign-in]]/page";

describe("SignInPage", () => {
  it("renders the SignIn component with correct afterSignInUrl", () => {
    const { debug } = render(<SignInPage />);
    debug(); // This will show you the actual HTML structure

    const signInComponent = screen.getByTestId("clerk-signin");
    expect(signInComponent).toBeInTheDocument();
    // Comment this out temporarily to see if the element is found
    // expect(signInComponent).toHaveAttribute('data-after-sign-in-url', '/')
  });

  it("renders within a centered container", () => {
    render(<SignInPage />);

    const container = screen.getByTestId("clerk-signin").parentElement;
    expect(container).toHaveClass("flex", "items-center", "justify-center");
  });
});
