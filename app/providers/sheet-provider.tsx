"use client";
import { useEffect, useState } from "react";
import { NewAccountSheet } from "../features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "../features/accounts/components/edit-account-sheet";
import { Edit } from "lucide-react";

export const SheetProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NewAccountSheet></NewAccountSheet>
      <EditAccountSheet></EditAccountSheet>
    </>
  );
};
