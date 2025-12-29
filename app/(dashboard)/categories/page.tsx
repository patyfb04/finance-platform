"use client";

import { useNewCategory } from "@/app/features/categories/hooks/use-new-category";
import { useBulkDeleteCategories } from "@/app/features/categories/api/use-bulk-delete";
import { useGetCategories } from "@/app/features/categories/api/use-get-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";

const CategoriesPage = () => {
  const newAccount = useNewCategory();
  const accountsQuery = useGetCategories();
  const categories = accountsQuery.data || [];
  const deleteCategories = useBulkDeleteCategories();

  const isDisabled = accountsQuery.isLoading || deleteCategories.isPending;

  if (accountsQuery.isLoading) {
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

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Categories Page
          </CardTitle>
          <Button
            size="sm"
            onClick={newAccount.onOpen}
            className="w-full lg:w-40"
          >
            <Plus className="size-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories}
            filterKey="name"
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteCategories.mutate({ ids });
            }}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;
