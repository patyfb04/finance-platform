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
import { ImportCard, ImportedRow } from "./import-card";
import { AccountColumn } from "./account-column";
import { useSelectAccount } from "@/app/features/accounts/hooks/use-select-account";
import { transactions as transactionsSchema } from "@/app/database/schema";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/app/features/transactions/api/use-bulk-create-transactions";
import { ImportResults } from "./types/import-results";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS: ImportResults = {
  data: [],
  errors: [],
  meta: {},
};

const TransactionsPageContent = () => {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);
  const [AccountSelectDialog, confirm] = useSelectAccount();

  const newTransaction = useNewTransaction();
  const transactionsQuery = useGetTransactions(); // This uses useSearchParams internally
  const transactions = transactionsQuery.data || [];
  const deleteTransactions = useBulkDeleteTransactions();

  const createTransactions = useBulkCreateTransactions();

  const isDisabled =
    transactionsQuery.isLoading || deleteTransactions.isPending;

  const onUpload = (results: ImportResults) => {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  type ImportResults = typeof INITIAL_IMPORT_RESULTS;

  const onSubmitImport = async (rows: ImportedRow[]) => {
    const accountId = await confirm();
    if (!accountId) {
      return toast.error("Please select an account to continue");
    }

    // Map ImportedRow[] to your insert type here
    const data = rows.map((row) => ({
      date: row.date, // already a string, no need for toISOString
      amount: row.amount,
      payee: row.payee,
      accountId: row.accountId,
      notes: row.notes,
      categoryId: row.categoryId,
    }));

    // No type assertion needed if your mutation expects the correct type
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
          data={importResults.data as string[][]}
          onSubmit={onSubmitImport} // Now matches the expected type
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
