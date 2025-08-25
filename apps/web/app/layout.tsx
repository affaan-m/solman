import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import Providers from "./providers";
import { AuthButton } from "../components/AuthButton";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <nav className="border-b border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
              <Link href="/" className="font-extrabold text-2xl">SOLMAN.GG</Link>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/packs">Packs</Link>
                <Link href="/marketplace">Marketplace</Link>
                <Link href="/referrals">Referrals</Link>
                <Link href="/profile">Profile</Link>
                <div className="ml-auto">
                  <AuthButton />
                </div>
              </div>
            </div>
          </nav>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
