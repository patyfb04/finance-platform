import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$delete"]
>;
type RequestType = InferRequestType<
  (typeof client.api.accounts)[":id"]["$delete"]
>;

export const useDeleteAccount = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, void>({
    mutationFn: async () => {
      if (!id) throw new Error("Missing ID");
      const response = await client.api.accounts[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account deleted");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts", { id }] });
    },
    onError: () => {
      toast.error("Failed to delete Account");
    },
  });
};
