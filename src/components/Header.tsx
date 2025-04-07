'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "./ui/button";
import { WalletComponent } from "@/lib/WalletComponent";

const Header = () => {
  return (
    <header className="w-full h-20 sticky top-0 z-50 shadow-md  px-4 md:px-8" suppressHydrationWarning>
      <nav className="flex justify-between items-center max-w-7xl mx-auto mt-5">
        {/* Logo Section */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="logo"
            height={40}
            width={200}
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Wallet or Sign-In Section */}
        <div className="flex items-center sapce-x-4 justify-between">
          <SignedIn>
            <WalletComponent>
              {/* Add any valid children here */}
              <div></div>
            </WalletComponent>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant={"default"}>Sign In</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
