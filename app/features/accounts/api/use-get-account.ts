import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetAccount = (id?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    enabled: options?.enabled ?? !!id,
    queryKey: ["accounts", { id }],
    queryFn: async () => {
      const response = await client.api.accounts[":id"].$get({
        param: { id },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const { data } = await response.json();
      return data ?? null;
    },
  });
};
