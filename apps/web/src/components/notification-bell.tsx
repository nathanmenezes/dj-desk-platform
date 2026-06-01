"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Bell, X, Check } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevUnread = useRef(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (unreadCount > 0 && unreadCount !== prevUnread.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  useGSAP(() => {
    if (!panelRef.current) return;
    if (open) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -8, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min atr\u00e1s`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atr\u00e1s`;
    return `${Math.floor(hours / 24)}d atr\u00e1s`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Notificacoes"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            ref={badgeRef}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-[#C8F135] text-black text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            className="absolute right-0 top-10 z-50 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">Notificacoes</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#C8F135] hover:underline flex items-center gap-1"
                  >
                    <Check size={12} /> Marcar todas
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                  Nenhuma notificacao ainda
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-white/5 last:border-0 ${
                      !n.readAt ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.readAt && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C8F135] shrink-0" />
                      )}
                      <div className={!n.readAt ? "" : "pl-3.5"}>
                        <p className="text-sm text-zinc-200 leading-snug">{n.message}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


