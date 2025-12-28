import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import HeaderLogo from "./header-logo";
import Navigation from "./navigation";
import { Loader2 } from "lucide-react";
import WelcomeMessage from "./welcome-msg";

const Header = () => {
  return (
    <header className="bg-linear-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo></HeaderLogo>
            <Navigation></Navigation>
          </div>
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/"></UserButton>
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="size-8 aninamte-spin text-slate-400"></Loader2>
          </ClerkLoading>
        </div>
        <WelcomeMessage></WelcomeMessage>
      </div>
    </header>
  );
};
export default Header;
