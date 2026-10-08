"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/arms-race", label: "Arms Race", icon: "🏆" },
  { href: "/vs-day", label: "VS Day", icon: "⚔️" },
  { href: "/training", label: "Training", icon: "🪖" },
  { href: "/buildings", label: "Buildings", icon: "🏗️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

function UTCClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toUTCString().split(" ")[4] + " UTC");
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono flex-shrink-0"
      style={{
        background: "var(--surface-2)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--text-dim)" }}>🕐</span>
      <span>{time || "--:--:-- UTC"}</span>
    </div>
  );
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(13, 15, 20, 0.92)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--gold)", color: "#000" }}
          >
            LW
          </div>
          <span
            className="font-semibold text-sm tracking-wide hidden sm:block"
            style={{ color: "var(--text-primary)" }}
          >
            LastWar<span style={{ color: "var(--gold)" }}>Companion</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 min-w-0">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: active ? "var(--gold)" : "var(--text-secondary)",
                  background: active ? "var(--gold-glow)" : "transparent",
                }}
              >
                <span className="hidden sm:inline">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <UTCClock />
      </div>
    </header>
  );
}
