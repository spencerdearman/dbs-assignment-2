"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Typing Arena", href: "/" },
  { label: "Shortcut Quiz", href: "/decks" },
  { label: "The Builder", href: "/builder" },
  { label: "Cheatsheet", href: "/reference" },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2">
        <span className="mr-6 font-mono text-sm font-bold tracking-tight text-white">
          KeyPro<span className="text-blue-500">_</span>
        </span>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive(tab.href)
                ? "text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
            {isActive(tab.href) && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-blue-500" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
