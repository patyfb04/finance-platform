import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useNewAccount } from "../hooks/use-new-account";

export const NewAccountSheet = () => {
  const { isOpen, onOpen, onClose } = useNewAccount();
  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>Create a new account here.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
