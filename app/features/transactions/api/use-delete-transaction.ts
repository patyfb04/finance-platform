import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$delete"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)[":id"]["$delete"]
>;

export const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, void>({
    mutationFn: async () => {
      if (!id) throw new Error("Missing ID");
      const response = await client.api.transactions[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transaction deleted");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", { id }] });
    },
    onError: () => {
      toast.error("Failed to delete Transaction");
    },
  });
};
