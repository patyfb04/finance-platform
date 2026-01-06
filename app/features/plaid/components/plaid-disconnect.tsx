"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCreateLinkToken } from "../api/use-create-link-token";
import { PlaidLink, usePlaidLink } from "react-plaid-link";
import { useExchangePublicToken } from "../api/use-exchange-public-token";
import { useDeleteConnectedBank } from "../api/use-delete-connected-bank";
import { useConfirm } from "@/app/hooks/use-confirm";

export const PlaidDisconnect = () => {
  const [Dialog, confirm] = useConfirm(
    "Are you sure?",
    "This will disconnect your bank account and remove all data associated with it."
  );
  const deleteConnectedBank = useDeleteConnectedBank();

  const isDisabled = deleteConnectedBank.isPending;

  const onClick = async () => {
    const ok = await confirm();
    if (ok) {
      deleteConnectedBank.mutate();
    }
  };

  return (
    <>
      <Dialog />
      <Button size="sm" variant="ghost" onClick={onClick} disabled={isDisabled}>
        Disconnect
      </Button>
    </>
  );
};
