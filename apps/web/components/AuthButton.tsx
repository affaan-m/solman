"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export function AuthButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) return null;

  if (!authenticated) {
    return (
      <button onClick={login} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs opacity-80">
        {user?.wallet?.address
          ? `${user.wallet.address.slice(0, 4)}…${user.wallet.address.slice(-4)}`
          : "Signed in"}
      </span>
      <button onClick={logout} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">
        Sign out
      </button>
    </div>
  );
}
