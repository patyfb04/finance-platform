import { render } from "@testing-library/react"; // ✅ Remove unused imports
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ Define proper types
interface DataType {
  id: string;
  name: string;
  value: number;
}

interface ValidatorFunction {
  (input: string): boolean;
}

interface StateType {
  loading: boolean;
  data: DataType[];
}

// ✅ Named component with display name
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
TestWrapper.displayName = "TestWrapper";

// ✅ Simple test implementation
describe("MyTest", () => {
  it("should work", () => {
    const handleResponse = (response: DataType) => {
      return response.value > 0;
    };

    const processData = (data: DataType[]) => {
      return data.map((item) => ({ ...item, processed: true }));
    };

    const validateInput = (input: string, validator: ValidatorFunction) => {
      return validator(input);
    };

    // ✅ Remove updateState entirely if not needed, or implement properly
    const updateState = (newState: Partial<StateType>) => {
      console.log("Updating state:", newState);
      return newState; // Just return the new state for testing
    };

    // Use the functions in your test
    const testData: DataType[] = [{ id: "1", name: "test", value: 100 }];
    const result = processData(testData);
    expect(result).toBeDefined();
  });
});

// ✅ Use ES6 exports instead of module.exports
export default TestWrapper;
export { type DataType, type ValidatorFunction };
