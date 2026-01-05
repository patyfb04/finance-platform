"use client";
import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetSummary } from "@/app/features/summary/api/use-get-summary";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { ChevronDown } from "lucide-react";
import { cn, formatDateRange } from "@/lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DatePicker } from "./date-picker";
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale";
import { PopoverClose } from "@radix-ui/react-popover";

export const DateFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 120);

  const paramState = {
    from: searchParams.get("from")
      ? new Date(searchParams.get("from")!)
      : defaultFrom,
    to: searchParams.get("to") ? new Date(searchParams.get("to")!) : defaultTo,
  };

  const [date, setDate] = useState<DateRange | undefined>({
    from: paramState.from,
    to: paramState.to,
  });

  const pushToUrl = (dateRange: DateRange | undefined) => {
    const query = {
      from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
      to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
      accountId: searchParams.get("accountId"),
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  };

  const onReset = () => {
    setDate(undefined);
    pushToUrl(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={false}
          size="sm"
          variant="outline"
          className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-2 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
        >
          <span>
            {formatDateRange({ from: paramState.from, to: paramState.to })}
          </span>
          <ChevronDown className="ml-2 size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          disabled={false}
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
        <div className="p-4 flex items-center gap-x-2 max-w-full">
          <Button
            onClick={onReset}
            disabled={!date?.from || !date?.to}
            className="flex-1"
            variant="outline"
            size="sm"
          >
            Reset
          </Button>
          <Button
            onClick={() => pushToUrl(date)}
            disabled={!date?.from || !date?.to}
            className="flex-1"
            size="sm"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
