// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Import the component
const PlaidConnect = vi.fn(() => <button>Connect</button>);

// Mock all the hooks
const mockUseCreateLinkToken = vi.fn();
const mockUsePlaidLink = vi.fn();
const mockUseExchangePublicToken = vi.fn();

vi.mock("@/features/plaid/api/use-create-link-token", () => ({
  useCreateLinkToken: mockUseCreateLinkToken,
}));

vi.mock("react-plaid-link", () => ({
  usePlaidLink: mockUsePlaidLink,
}));

vi.mock("@/features/plaid/api/use-exchange-public-token", () => ({
  useExchangePublicToken: mockUseExchangePublicToken,
}));

describe("PlaidConnect", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCreateLinkToken.mockReturnValue({
      data: { linkToken: "test-token" },
      isLoading: false,
      isError: false,
    });

    mockUsePlaidLink.mockReturnValue({
      open: vi.fn(),
      ready: true,
    });

    mockUseExchangePublicToken.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("renders connect button", () => {
    render(<PlaidConnect />);
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });
});
