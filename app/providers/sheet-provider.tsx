"use client";
import { useState } from "react";
import { NewAccountSheet } from "../features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "../features/accounts/components/edit-account-sheet";
import { Edit } from "lucide-react";
import { NewCategorySheet } from "../features/categories/components/new-category-sheet";
import { EditCategorySheet } from "../features/categories/components/edit-category-sheet";
import { NewTransactionSheet } from "../features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "../features/transactions/components/edit-transaction-sheet";

export const SheetProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(true);

  return (
    <div>
      {children}
      <NewAccountSheet></NewAccountSheet>
      <EditAccountSheet></EditAccountSheet>
      <NewCategorySheet></NewCategorySheet>
      <EditCategorySheet></EditCategorySheet>
      <NewTransactionSheet></NewTransactionSheet>
      <EditTransactionSheet></EditTransactionSheet>
    </div>
  );
};
