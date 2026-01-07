import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.plaid)["exchange-public-token"]["$post"]
>;

type RequestType = InferRequestType<
  (typeof client.api.plaid)["exchange-public-token"]["$post"]
>["json"];

export const useExchangePublicToken = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json: RequestType) => {
      const response = await client.api.plaid["exchange-public-token"].$post({
        json,
      });
      if (!response.ok) {
        throw new Error("Failed to exchange public token");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Public token exchanged successfully");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["connected-bank  "] });
    },
    onError: () => {
      toast.error("Failed to exchange public token");
    },
  });
};
