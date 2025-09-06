"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const SkinVaultLogo = () => (
  <Link href="/" className="flex items-center" aria-label="Go to homepage">
    <div className="flex items-center gap-3">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF6B35" />
        <path d="M2 7V17L12 22V12L2 7Z" fill="#DC2626" />
        <path d="M22 7V17L12 22V12L22 7Z" fill="#F97316" />
      </svg>
      <span className="hidden sm:block text-white text-lg font-bold tracking-wider">SKINVAULT</span>
    </div>
  </Link>
);

const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <Link
    href={href}
    className={cn(
      "flex items-center justify-center gap-2 border border-orange-600/30 rounded-lg px-4 py-3 text-xs font-semibold text-orange-100 transition-all duration-300 hover:bg-orange-600/20 hover:border-orange-500/50",
      className
    )}
  >
    {children}
  </Link>
);

export default function HeaderNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerHeight = "68px";

  return (
    <>
      <header
        className={cn(
          "w-full flex justify-between items-center p-4 py-3 sm:px-12 sm:py-4 transition-all duration-300",
          isScrolled || isMenuOpen
            ? "bg-slate-900/90 backdrop-blur-sm border-b border-orange-600/20"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="flex items-center gap-6">
          <SkinVaultLogo />
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="#" className="sm:flex">
              <BarChart3 className="w-4 h-4" />
              Leaderboard
            </NavLink>
            <NavLink href="#" className="sm:flex">
              <Target className="w-5 h-5" />
              Jackpot
            </NavLink>
          </nav>
        </div>
        <div className="flex gap-2 md:gap-6 items-center">
          <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg text-xs font-semibold h-fit transition-all duration-300 hover:from-orange-500 hover:to-red-500 shadow-lg hover:shadow-orange-600/25">
            Sign In
          </button>
          <button
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={cn("w-6 h-[3px] rounded-lg bg-orange-400 transition-all duration-300", isMenuOpen ? "rotate-45 translate-y-[10.5px]" : "")} />
            <span className={cn("w-6 h-[3px] rounded-lg bg-orange-400 transition-all duration-300", isMenuOpen ? "opacity-0" : "")} />
            <span className={cn("w-6 h-[3px] rounded-lg bg-orange-400 transition-all duration-300", isMenuOpen ? "-rotate-45 -translate-y-[10.5px]" : "")} />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed left-0 w-full bg-slate-900/95 backdrop-blur-sm z-40 transition-all duration-500 ease-in-out md:hidden flex",
          isMenuOpen ? "opacity-100 pointer-events-auto shadow-lg" : "h-0 opacity-0 pointer-events-none"
        )}
        style={{ top: headerHeight }}
      >
        <nav
          className={cn(
            "flex w-full flex-col p-6 gap-4 transition-all duration-300 delay-100",
            isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          <NavLink href="#">
            <BarChart3 className="w-4 h-4" />
            Leaderboard
          </NavLink>
          <NavLink href="#">
            <Target className="w-5 h-5" />
            Jackpot
          </NavLink>
        </nav>
      </div>
      <div className="pt-[67px] sm:pt-[70.5px]" />
    </>
  );
}
