"use client";

import { useNewTransaction } from "@/app/features/transactions/hooks/use-new-transaction";
import { useBulkDeleteTransactions } from "@/app/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/app/features/transactions/api/use-get-transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, Suspense } from "react";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { AccountColumn } from "./account-column";
import { useSelectAccount } from "@/app/features/accounts/hooks/use-select-account";
import { transactions as transactionsSchema } from "@/app/database/schema";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/app/features/transactions/api/use-bulk-create-transactions";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = { data: [], errors: [], meta: {} };

const TransactionsPageContent = () => {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [AccountSelectDialog, confirm] = useSelectAccount();

  const newTransaction = useNewTransaction();
  const transactionsQuery = useGetTransactions({}); // This uses useSearchParams internally
  const transactions = transactionsQuery.data || [];
  const deleteTransactions = useBulkDeleteTransactions();

  const createTransactions = useBulkCreateTransactions();

  const isDisabled =
    transactionsQuery.isLoading || deleteTransactions.isPending;

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  const onSubmitImport = async (
    values: (typeof transactionsSchema.$inferInsert)[]
  ) => {
    const accountId = await confirm();
    if (!accountId) {
      return toast.error("Please select an account to continue");
    }

    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string,
      date:
        value.date instanceof Date
          ? value.date.toISOString().split("T")[0] // "YYYY-MM-DD"
          : value.date,
      categoryId: value.categoryId ?? undefined,
      notes: value.notes ?? undefined,
    }));

    createTransactions.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  if (transactionsQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48"></Skeleton>
          </CardHeader>
          <CardContent>
            <div className="h-[500] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin"></Loader2>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountSelectDialog></AccountSelectDialog>
        <ImportCard
          data={importResults.data}
          onSubmit={onSubmitImport}
          onCancel={onCancelImport}
        />
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transactions History
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <Button
              size="sm"
              onClick={newTransaction.onOpen}
              className="w-full lg:w-30"
            >
              <Plus className="size-4 mr-2" />
              Add New
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={transactions}
            filterKey="payee"
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteTransactions.mutate({ ids });
            }}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const TransactionsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
          <Card className="border-none drop-shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-48"></Skeleton>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full flex items-center justify-center">
                <Loader2 className="size-6 text-slate-300 animate-spin"></Loader2>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <TransactionsPageContent />
    </Suspense>
  );
};

export default TransactionsPage;
