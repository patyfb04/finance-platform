"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMount } from "react-use";
import { useCreateLinkToken } from "../api/use-create-link-token";
import { PlaidLink, usePlaidLink } from "react-plaid-link";
import { useExchangePublicToken } from "../api/use-exchange-public-token";
import { useQueryClient } from "@tanstack/react-query";

export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null);
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();
  const queryClient = useQueryClient();

  useMount(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: (data) => {
        if ("data" in data) {
          setToken(data.data);
        } else {
          console.error("Error creating link token:", data.error);
        }
      },
    });
  });

  const plaid = usePlaidLink({
    token: token || "",
    onSuccess: (public_token, metadata) => {
      exchangePublicToken.mutate(
        { public_token },
        {
          onSuccess: () => {
            // Invalidate and refetch connected bank data
            queryClient.invalidateQueries({ queryKey: ["connected-bank"] });
          },
        }
      );
    },
    env: "sandbox",
  });

  const isDisabled = !plaid.ready || exchangePublicToken.isPending;

  const onClick = () => {
    if (!isDisabled) {
      plaid.open();
    }
  };

  return (
    <Button size="sm" variant="ghost" onClick={onClick} disabled={isDisabled}>
      Connect
    </Button>
  );
};
