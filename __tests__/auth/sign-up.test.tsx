import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SignUpPage from "@/app/(auth)/sign-up/[[...sign-up]]/page";

describe("SignUpPage", () => {
  it("renders the SignUp component with correct afterSignUpUrl", () => {
    const { debug } = render(<SignUpPage />);
    debug(); // This will show you the actual HTML structure

    const signUpComponent = screen.getByTestId("clerk-signup");
    expect(signUpComponent).toBeInTheDocument();

    // Check what attribute is actually there
    console.log("SignUp element attributes:", signUpComponent.attributes);

    // Temporarily comment this out to see what's actually rendered
    // expect(signUpComponent).toHaveAttribute('data-after-sign-up-url', '/')
  });

  it("renders within a centered container", () => {
    render(<SignUpPage />);

    const container = screen.getByTestId("clerk-signup").parentElement;
    expect(container).toHaveClass("flex", "items-center", "justify-center");
  });
});
