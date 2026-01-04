"use client";
import { useGetSummary } from "@/app/features/summary/api/use-get-summary";
import { formatDateRange } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { DataCard, DataCardLoading } from "./data-card";

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary();
  const params = useSearchParams();
  const to = params.get("to") || undefined;
  const from = params.get("from") || undefined;
  const dateRange = formatDateRange({ from, to });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount}
        icon={FaPiggyBank}
        variant="default"
        dateRange={dateRange}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        icon={FaArrowTrendUp}
        variant="default"
        dateRange={dateRange}
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        icon={FaArrowTrendDown}
        variant="default"
        dateRange={dateRange}
      />
    </div>
  );
};
