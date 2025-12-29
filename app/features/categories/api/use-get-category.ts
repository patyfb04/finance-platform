import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCategory = (
  id?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    enabled: options?.enabled ?? !!id,
    queryKey: ["categories", { id }],
    queryFn: async () => {
      const response = await client.api.categories[":id"].$get({
        param: { id },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const { data } = await response.json();
      return data ?? null;
    },
  });
};
