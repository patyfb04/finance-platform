"use client";
import { useGetAccounts } from "../features/accounts/api/use-get-accounts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewAccount } from "@/app/features/accounts/hooks/use-new-account";

export default function Home() {
  const { data: accounts, isLoading } = useGetAccounts();
  const { onOpen } = useNewAccount();

  return (
    <>
      {isLoading ? (
        <Loader2 className="size-8 aninamte-spin text-slate-400"></Loader2>
      ) : (
        <div>
          <Button onClick={onOpen}>Add an Account</Button>
        </div>
      )}
    </>
  );
}
