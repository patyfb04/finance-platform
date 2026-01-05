"use client";

import { Suspense } from "react";
import { AccountFilter } from "./account-filter";
import { DateFilter } from "./date-filter";

function FiltersContent() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
      <div className="w-full lg:w-auto">
        <AccountFilter />
      </div>
      <div className="w-full lg:w-auto">
        <DateFilter />
      </div>
    </div>
  );
}

export const Filters = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-y-0 lg:gap-x-2">
          <div className="w-full lg:w-auto">
            <div className="h-9 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
          <div className="w-full lg:w-auto">
            <div className="h-9 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
      }
    >
      <FiltersContent />
    </Suspense>
  );
};
