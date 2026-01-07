import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-create"]["$post"]
>["json"];

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json: RequestType) => {
      const response = await client.api.transactions["bulk-create"].$post({
        json,
      });

      if (!response.ok) {
        throw new Error(response.json.toString());
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transactions Created");
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
    },
    onError: () => {
      toast.error("Failed to create Transactions");
    },
  });
};
