"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Arena", href: "/" },
  { label: "Shortcuts", href: "/decks" },
  { label: "Builder", href: "/builder" },
  { label: "Reference", href: "/reference" },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08080c]/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl items-center gap-0.5 px-4 py-3">
        <Link href="/" className="mr-8 flex items-baseline gap-0.5">
          <span className="font-mono text-base font-bold tracking-tight text-white">
            KeyPro
          </span>
          <span className="font-mono text-base font-bold text-blue-500 animate-pulse">_</span>
        </Link>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative rounded-2xl px-3.5 py-2 text-[13px] font-medium tracking-wide transition-all duration-200 ${
              isActive(tab.href)
                ? "text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            }`}
          >
            {tab.label}
            {isActive(tab.href) && (
              <span className="absolute -bottom-3 left-1/2 h-[2px] w-3/5 -translate-x-1/2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
