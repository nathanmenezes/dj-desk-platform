"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Clock, CheckCircle2, CalendarDays, Copy, ExternalLink } from "lucide-react";
import { CreateEventModal } from "./create-event-modal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Event = {
  id: string;
  name: string;
  clientName: string;
  eventDate: string | null;
  status: "PENDING" | "SUBMITTED" | "EXPIRED";
  createdAt: string;
  _count: { sections: number };
};

type Props = {
  events: Event[];
  stats: { total: number; pending: number; submitted: number };
  djName: string;
};

const STATUS_CONFIG = {
  PENDING: { label: "Aguardando", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  SUBMITTED: { label: "Recebido", color: "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20" },
  EXPIRED: { label: "Expirado", color: "text-[var(--subtle)] bg-[var(--subtle)]/10 border-[var(--subtle)]/20" },
};

export function DashboardClient({ events, stats, djName }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useGSAP(
    () => {
      // Header entrance
      gsap.from(".dash-header", {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });

      // Stat cards stagger
      gsap.from(".stat-card", {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.2,
      });

      // Stat numbers count-up
      document.querySelectorAll<HTMLElement>(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.value || "0", 10);
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            duration: 1,
            delay: 0.4,
            ease: "power1.out",
            snap: { innerText: 1 },
          }
        );
      });

      // Event rows scroll reveal
      ScrollTrigger.batch(".event-row", {
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4 }),
        start: "top 90%",
      });
    },
    { scope: container }
  );

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}`);
  };

  return (
    <div ref={container} className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="dash-header flex items-center justify-between mb-8">
        <div>
          <p className="text-[var(--subtle)] text-sm mb-1">Bem-vindo de volta,</p>
          <h1 className="text-2xl font-display font-bold text-[var(--text)]">
            {djName} 👋
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--accent)] text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="stat-card bg-[var(--border)] rounded-xl p-5 border border-[var(--border)]">
          <CalendarDays size={20} className="text-[var(--accent)] mb-3" />
          <p className="text-[var(--subtle)] text-xs uppercase tracking-wider mb-1">Total de eventos</p>
          <p
            className="stat-number text-3xl font-display font-bold text-[var(--text)]"
            data-value={stats.total}
          >
            {stats.total}
          </p>
        </div>
        <div className="stat-card bg-[var(--border)] rounded-xl p-5 border border-[var(--border)]">
          <Clock size={20} className="text-yellow-400 mb-3" />
          <p className="text-[var(--subtle)] text-xs uppercase tracking-wider mb-1">Aguardando cliente</p>
          <p
            className="stat-number text-3xl font-display font-bold text-[var(--text)]"
            data-value={stats.pending}
          >
            {stats.pending}
          </p>
        </div>
        <div className="stat-card bg-[var(--border)] rounded-xl p-5 border border-[var(--border)]">
          <CheckCircle2 size={20} className="text-[var(--accent)] mb-3" />
          <p className="text-[var(--subtle)] text-xs uppercase tracking-wider mb-1">Playlists recebidas</p>
          <p
            className="stat-number text-3xl font-display font-bold text-[var(--text)]"
            data-value={stats.submitted}
          >
            {stats.submitted}
          </p>
        </div>
      </div>

      {/* Events table */}
      <div className="bg-[var(--border)]/30 rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-display font-semibold text-[var(--text)]">Eventos recentes</h2>
          <Link href="/events" className="text-xs text-[var(--accent)] hover:underline">
            Ver todos →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[var(--subtle)] text-sm">Nenhum evento ainda.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-[var(--accent)] text-sm hover:underline"
            >
              Criar primeiro evento
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[var(--subtle)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="text-left px-6 py-3">Evento</th>
                <th className="text-left px-6 py-3">Cliente</th>
                <th className="text-left px-6 py-3">Data</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const status = STATUS_CONFIG[event.status];
                const eventDate = event.eventDate
                  ? new Date(event.eventDate).toLocaleDateString("pt-BR")
                  : "—";
                return (
                  <tr
                    key={event.id}
                    className="event-row opacity-0 translate-y-2 border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--border)]/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-[var(--text)] font-medium text-sm">{event.name}</p>
                      <p className="text-[var(--subtle)] text-xs mt-0.5">
                        {event._count.sections} seções
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{event.clientName}</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{eventDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => copyLink(event.id)}
                          title="Copiar link do cliente"
                          className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                        <Link
                          href={`/events/${event.id}`}
                          title="Ver evento"
                          className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <CreateEventModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
