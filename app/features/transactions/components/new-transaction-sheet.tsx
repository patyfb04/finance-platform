import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useNewTransaction } from "../hooks/use-new-transaction";
import { TransactionForm } from "./transaction-form";
import { insertTransactionSchema } from "@/app/database/schema";
import z from "zod";
import { useCreateTransaction } from "../api/use-create-transaction";
import { useCreateCategory } from "../../categories/api/use-create-category";
import { useGetCategories } from "../../categories/api/use-get-categories";
import { useCreateAccount } from "../../accounts/api/use-create-account";
import { useGetAccounts } from "../../accounts/api/use-get-accounts";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

export const NewTransactionSheet = () => {
  const { isOpen, onOpen, onClose } = useNewTransaction();
  const createMutation = useCreateTransaction();

  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const onCreateCategory = (name?: string) => {
    if (!name) return;
    const safeName: string = name;
    categoryMutation.mutate({ name: safeName });
  };

  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.id,
    value: category.name,
  }));
  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const onCreateAccount = (name?: string) => {
    if (!name) return;
    const safeName: string = name; // TS now knows it's a string
    accountMutation.mutate({ name: safeName });
  };

  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.id,
    value: account.name,
  }));

  const isPending =
    createMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

  const onSubmit = (values: ApiFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>Create a new transaction here.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin"></Loader2>
          </div>
        ) : (
          <TransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            categoryOptions={categoryOptions}
            onCreateCategory={onCreateCategory}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
