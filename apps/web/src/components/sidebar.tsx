"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  LayoutTemplate, 
  Settings, 
  LogOut,
  Music2
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/events", icon: CalendarDays, label: "Eventos" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[var(--bg)] border-r border-[var(--border)] px-4 py-6">
      {/* Logo + Bell */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <Music2 size={16} className="text-black" />
        </div>
        <span className="font-display font-bold text-lg text-[var(--text)] tracking-tight flex-1">
          DJ Desk
        </span>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--accent)] text-black"
                  : "text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--border)]"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors mt-4"
      >
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}
