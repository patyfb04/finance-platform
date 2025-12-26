import { UserButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <UserButton afterSignOutUrl="/"></UserButton>
      <p>this is authenticate user</p>
    </>
  );
}
