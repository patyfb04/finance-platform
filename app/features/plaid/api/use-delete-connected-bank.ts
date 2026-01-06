import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.plaid)["connected-bank"]["$delete"],
  200
>;

export const useDeleteConnectedBank = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.plaid["connected-bank"]["$delete"]();
      if (!response.ok) {
        throw new Error("Failed to delete connected bank");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Connected bank deleted");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["connected-bank  "] });
    },
    onError: () => {
      toast.error("Failed to delete connected bank");
    },
  });
};
