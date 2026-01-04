"use client";
import { useGetAccounts } from "../features/accounts/api/use-get-accounts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewAccount } from "@/app/features/accounts/hooks/use-new-account";
import { DataGrid } from "@/components/data-grid";
import { DataCharts } from "@/components/data-charts";

export default function Home() {
  const { data: accounts, isLoading } = useGetAccounts();
  const { onOpen } = useNewAccount();

  return (
    <>
      {isLoading ? (
        <Loader2 className="size-8 animate-spin text-slate-400"></Loader2>
      ) : (
        <div className="max-w-full-2xl mx-auto w-full pb-10 -mt-24">
          <DataGrid />
          <DataCharts />
        </div>
      )}
    </>
  );
}
