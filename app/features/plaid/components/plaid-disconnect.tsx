"use client";

import { Button } from "@/components/ui/button";
import { useDeleteConnectedBank } from "../api/use-delete-connected-bank";
import { useQueryClient } from "@tanstack/react-query";

export const PlaidDisconnect = () => {
  const deleteConnectedBank = useDeleteConnectedBank();
  const queryClient = useQueryClient();

  const onClick = () => {
    deleteConnectedBank.mutate(undefined, {
      onSuccess: () => {
        // Invalidate and refetch connected bank data
        queryClient.invalidateQueries({ queryKey: ["connected-bank"] });
      },
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={deleteConnectedBank.isPending}
    >
      Disconnect
    </Button>
  );
};
