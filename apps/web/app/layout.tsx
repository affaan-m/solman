import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm fixed inset-x-0 top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/branding/solman.gg.logo.faceonly.jpg" alt="Solman" width={28} height={28} className="rounded" />
              <span className="font-extrabold text-xl">SOLMAN.GG</span>
            </Link>
            <div className="flex items-center gap-4 text-sm ml-auto">
              <Link href="/packs">Packs</Link>
              <Link href="/marketplace">Marketplace</Link>
              <Link href="/referrals">Referrals</Link>
              <Link href="/profile">Profile</Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 pt-20 pb-8">{children}</main>
      </body>
    </html>
  );
}
