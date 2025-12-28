import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useNewAccount } from "../hooks/use-new-account";
import { AccountForm } from "./account-form";
import { insertAccountSchema } from "@/app/database/schema";
import z from "zod";
import { useCreateAccount } from "../api/use-create-account";

const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewAccountSheet = () => {
  const { isOpen, onOpen, onClose } = useNewAccount();
  const mutation = useCreateAccount();

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>Create a new account here.</SheetDescription>
        </SheetHeader>
        <AccountForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{ name: "" }}
        />
      </SheetContent>
    </Sheet>
  );
};
