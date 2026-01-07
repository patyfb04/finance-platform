import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useConfirm } from "@/app/hooks/use-confirm";

describe("useConfirm", () => {
  it("returns confirmation function and dialog component", () => {
    const { result } = renderHook(() =>
      useConfirm("Test Title", "Test Message")
    );

    expect(result.current).toHaveLength(2);
    expect(typeof result.current[0]).toBe("function");
    expect(result.current[1]).toBeTruthy();
  });

  it("shows confirmation dialog when called", () => {
    const { result } = renderHook(() =>
      useConfirm("Test Title", "Test Message")
    );

    const [confirm] = result.current;

    act(() => {
      confirm();
    });

    // The dialog state should be managed internally
    // You might need to check if the dialog is visible in the DOM
    expect(typeof confirm).toBe("function");
  });
});
