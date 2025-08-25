"use client";

import React, { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: ReactNode }) {
  const appId =
    (process.env.NEXT_PUBLIC_PRIVY_APP_ID as string | undefined) ||
    (process.env.PRIVY_APP_ID as string | undefined);

  if (!appId) {
    return <>{children}</>;
  }

  return <PrivyProvider appId={appId}>{children}</PrivyProvider>;
}
