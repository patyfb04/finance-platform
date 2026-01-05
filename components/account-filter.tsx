"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGetAccounts } from "@/app/features/accounts/api/use-get-accounts";

export const AccountFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: accounts, isLoading } = useGetAccounts();
  const currentAccountId = searchParams.get("accountId") || "all";

  const onAccountChange = (accountId: string) => {
    const currentQuery = qs.parse(searchParams.toString());

    const updatedQuery = {
      ...currentQuery,
      accountId: accountId === "all" ? undefined : accountId,
    };

    const url = qs.stringifyUrl(
      { url: pathname, query: updatedQuery },
      { skipNull: true }
    );
    router.push(url);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Select
      value={currentAccountId}
      onValueChange={(value) => onAccountChange(value)}
      disabled={false}
    >
      <SelectTrigger className="lg:auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-2 focus:ring-transparent outline-none text-white focus:bg-white/30 transition">
        <SelectValue placeholder="Account" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
