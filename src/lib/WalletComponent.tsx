"use client";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import React, { useMemo } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletComponent = ({
  children,
  showButtons = false, // Add a prop to control button visibility
}: {
  children?: React.ReactNode;
  showButtons?: boolean;
}) => {
  const endpoint = useMemo(() => "https://api.devnet.solana.com", []);

  const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter()], []);

  return (
    <div suppressHydrationWarning>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
            {showButtons && ( // Conditionally render the wallet buttons
              <div className="flex flex-row items-center justify-between space-x-2 m-2">
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
            )}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};