"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Copy, ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import { CreateEventModal } from "../dashboard/create-event-modal";

gsap.registerPlugin(useGSAP);

type Event = {
  id: string;
  name: string;
  clientName: string;
  eventDate: string | null;
  status: "PENDING" | "SUBMITTED" | "EXPIRED";
  createdAt: string;
  _count: { sections: number };
};

const STATUS_CONFIG = {
  PENDING: { label: "Aguardando", icon: Clock, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  SUBMITTED: { label: "Recebido", icon: CheckCircle2, color: "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20" },
  EXPIRED: { label: "Expirado", icon: XCircle, color: "text-[var(--subtle)] bg-[var(--subtle)]/10 border-[var(--subtle)]/20" },
};

export function EventsClient({ events }: { events: Event[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "SUBMITTED" | "EXPIRED">("ALL");
  const router = useRouter();

  useGSAP(
    () => {
      gsap.from(".page-title", { y: -16, opacity: 0, duration: 0.5 });
      gsap.from(".event-card", {
        y: 20,
        opacity: 0,
        stagger: 0.06,
        duration: 0.4,
        delay: 0.1,
        ease: "power2.out",
      });
    },
    { scope: container, dependencies: [filter] }
  );

  const filtered = filter === "ALL" ? events : events.filter((e) => e.status === filter);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${id}`);
  };

  return (
    <div ref={container} className="p-8 max-w-6xl mx-auto">
      <div className="page-title flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text)]">Eventos</h1>
          <p className="text-sm text-[var(--subtle)] mt-1">{events.length} eventos no total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--accent)] text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Novo Evento
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["ALL", "PENDING", "SUBMITTED", "EXPIRED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? "bg-[var(--accent)] text-black"
                : "text-[var(--subtle)] hover:text-[var(--text)] bg-[var(--border)]"
            }`}
          >
            {s === "ALL" ? "Todos" : STATUS_CONFIG[s].label}
            <span className="ml-1.5 text-xs opacity-70">
              {s === "ALL" ? events.length : events.filter((e) => e.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Events grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-[var(--border)]">
          <p className="text-[var(--subtle)] text-sm">Nenhum evento encontrado.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-[var(--accent)] text-sm hover:underline"
          >
            Criar evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((event) => {
            const s = STATUS_CONFIG[event.status];
            const StatusIcon = s.icon;
            return (
              <div
                key={event.id}
                className="event-card flex items-center gap-4 bg-[var(--border)]/30 border border-[var(--border)] rounded-xl px-5 py-4 hover:border-[var(--muted)] transition-colors cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text)] truncate">{event.name}</p>
                  <p className="text-xs text-[var(--subtle)] mt-0.5">
                    {event.clientName}
                    {event.eventDate && (
                      <> · {new Date(event.eventDate).toLocaleDateString("pt-BR")}</>
                    )}
                    <> · {event._count.sections} seções</>
                  </p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.color} shrink-0`}>
                  <StatusIcon size={11} />
                  {s.label}
                </span>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => copyLink(event.id)}
                    title="Copiar link"
                    className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <Link
                    href={`/events/${event.id}`}
                    className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateEventModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
