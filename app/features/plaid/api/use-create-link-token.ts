import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.plaid)["create-link-token"]["$post"]
>;

export const useCreateLinkToken = () => {
  return useMutation<ResponseType, Error>({
    mutationFn: async (json: any) => {
      const response = await client.api.plaid["create-link-token"].$post({
        json,
      });
      if (!response.ok) {
        throw new Error("Failed to create link token");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Link token created");
    },
    onError: () => {
      toast.error("Failed to create link token");
    },
  });
};
