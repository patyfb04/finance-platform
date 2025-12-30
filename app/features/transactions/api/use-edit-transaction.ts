import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)[":id"]["$patch"]
>["json"];

export const useEditTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json: any) => {
      const response = await client.api.transactions[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transaction updated");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", { id }] });
    },
    onError: () => {
      toast.error("Failed to updated Transaction");
    },
  });
};
