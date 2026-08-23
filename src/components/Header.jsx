"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";
import { Menu, X, LogIn, LogOut } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Problems", href: "/problems" },
    { name: "Topics", href: "/topics" },
    { name: "Stats", href: "/stats" },
    { name: "About", href: "/about" },
  ];

  if (session) {
    // Add private dashboard for authenticated users
    navigation.push({ name: "Dashboard", href: "/dashboard" });
  }

  const isActive = (href) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl tracking-tight">
            <Image
              src="/logo.jpg"
              alt="DSA-Vault Logo"
              width={26}
              height={26}
              className="rounded"
            />
            <span>DSA-Vault</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold transition-all duration-200 px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive(item.href)
                  ? "text-indigo-650 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 border-b-2 border-indigo-600 dark:border-indigo-450"
                  : "text-slate-600 dark:text-slate-350"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User avatar"}
                  width={34}
                  height={34}
                  unoptimized
                  className="w-8.5 h-8.5 rounded-full border-2 border-indigo-500/20"
                />
              ) : (
                <div className="w-8.5 h-8.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 flex items-center justify-center text-sm font-bold">
                  {session.user?.name?.[0] || "U"}
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 pt-2 pb-6 flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                  isActive(item.href)
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
            {session ? (
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold">{session.user?.name}</p>
                  <p className="text-xs text-slate-500">{session.user?.email}</p>
                </div>
              </div>
            ) : (
              <span className="text-sm text-slate-500">Sign in to track progress</span>
            )}

            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  signIn("google");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
