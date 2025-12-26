import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen grid  grid-cols-1 lg:grid-cols-2">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="text-4xl font-bold">Welcome back!</h1>
          <p className="text-lg text-gray-600">
            Log In or Create and account to get back to your Dashboard.
          </p>
          <div className="flex items-center justify-center pt-8">
            <ClerkLoaded>
              <SignUp path="/sign-up" />
            </ClerkLoaded>
            <ClerkLoading>
              <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
            </ClerkLoading>
          </div>
        </div>
      </div>
      <div className="h-full bg-blue-600 hidden lg:flex items-center justify-center">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
      </div>
    </div>
  );
}
