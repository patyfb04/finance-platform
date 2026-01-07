import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface CategoryTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey?: string;
    payload?: Record<string, unknown>; // The original data point
  }>;
  label?: string | number;
}

export const CategoryTooltip = ({ active, payload }: CategoryTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const name = payload[0]?.payload?.name;
  const value = payload[0].value;

  return (
    <div className="rounded-sm bg-white shadow-sm border overflow-hidden">
      <div className="text-sm p-2 px-3 bg-muted text-muted-foreground">
        {typeof name === "string" ? name : String(name ?? "Unknown")}
      </div>
      <Separator />
      <div className="p-2 px-3 space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 bg-blue-500 rounded-full" />
            <p className="text-sm text-muted-foreground">Income</p>
          </div>
          <p className="text-sm text-right font-medium">
            {formatCurrency(value)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            <div className="size-1.5 bg-blue-500 rounded-full" />
            <p className="text-sm text-muted-foreground">Expenses</p>
          </div>
          <p className="text-sm text-right font-medium">
            {formatCurrency(value * -1)}
          </p>
        </div>
      </div>
    </div>
  );
};
