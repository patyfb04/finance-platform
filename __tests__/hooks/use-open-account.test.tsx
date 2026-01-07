import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useOpenAccount } from "@/app/features/accounts/hooks/use-open-account";

describe("useOpenAccount", () => {
  it("should initialize with closed state", () => {
    const { result } = renderHook(() => useOpenAccount());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.id).toBeUndefined();
  });

  it("should open with id when onOpen is called", () => {
    const { result } = renderHook(() => useOpenAccount());

    act(() => {
      result.current.onOpen("test-id");
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.id).toBe("test-id");
  });

  it("should close and clear id when onClose is called", () => {
    const { result } = renderHook(() => useOpenAccount());

    act(() => {
      result.current.onOpen("test-id");
    });

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.id).toBeUndefined();
  });
});
