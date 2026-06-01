"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  Music2,
  Download,
  ExternalLink,
  Calendar,
  User,
  Mail,
  Timer,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

type Song = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  source: "SPOTIFY" | "YOUTUBE";
  spotifyUrl: string | null;
  youtubeUrl: string | null;
};

type Section = {
  id: string;
  name: string;
  order: number;
  songs: Song[];
};

type Event = {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string | null;
  eventDate: string | null;
  deadline: string | null;
  status: "PENDING" | "SUBMITTED" | "EXPIRED";
  createdAt: string;
  sections: Section[];
};

const STATUS_MAP = {
  PENDING: {
    label: "Aguardando cliente",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  SUBMITTED: {
    label: "Playlist recebida",
    icon: CheckCircle2,
    color: "text-[var(--accent)]",
    bg: "bg-[var(--accent)]/10 border-[var(--accent)]/20",
  },
  EXPIRED: {
    label: "Expirado",
    icon: XCircle,
    color: "text-[var(--subtle)]",
    bg: "bg-[var(--subtle)]/10 border-[var(--subtle)]/20",
  },
};

export function EventDetailClient({ event }: { event: Event }) {
  const container = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const status = STATUS_MAP[event.status];
  const StatusIcon = status.icon;

  useGSAP(
    () => {
      gsap.from(".event-header", { y: -16, opacity: 0, duration: 0.5 });
      gsap.from(".event-meta", { y: 16, opacity: 0, duration: 0.5, delay: 0.1 });
      gsap.from(".section-card", {
        y: 24,
        opacity: 0,
        stagger: 0.08,
        duration: 0.4,
        delay: 0.2,
        ease: "power2.out",
      });
    },
    { scope: container }
  );

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/playlist/${event.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    window.open(`/api/events/${event.id}/export?format=csv`, "_blank");
  };

  const totalSongs = event.sections.reduce((acc, s) => acc + s.songs.length, 0);

  return (
    <div ref={container} className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="event-header mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--subtle)] hover:text-[var(--text)] mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--text)]">
              {event.name}
            </h1>
            <div className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
              <StatusIcon size={12} />
              {status.label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--subtle)] hover:text-[var(--text)] hover:border-[var(--muted)] transition-colors"
            >
              <Download size={14} />
              Exportar CSV
            </button>
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30"
                  : "bg-[var(--accent)] text-black hover:brightness-110"
              }`}
            >
              <Copy size={14} />
              {copied ? "Copiado!" : "Link do cliente"}
            </button>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="event-meta grid grid-cols-4 gap-3 mb-8">
        {[
          { icon: User, label: "Cliente", value: event.clientName },
          { icon: Mail, label: "E-mail", value: event.clientEmail || "—" },
          {
            icon: Calendar,
            label: "Data do evento",
            value: event.eventDate
              ? new Date(event.eventDate).toLocaleDateString("pt-BR")
              : "—",
          },
          {
            icon: Timer,
            label: "Prazo",
            value: event.deadline
              ? new Date(event.deadline).toLocaleDateString("pt-BR")
              : "—",
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-[var(--border)]/30 border border-[var(--border)] rounded-xl p-4"
          >
            <Icon size={14} className="text-[var(--subtle)] mb-2" />
            <p className="text-xs text-[var(--subtle)] mb-0.5">{label}</p>
            <p className="text-sm font-medium text-[var(--text)] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-[var(--text)]">
          Seções da playlist
          <span className="ml-2 text-sm font-normal text-[var(--subtle)]">
            ({totalSongs} músicas)
          </span>
        </h2>
        <Link
          href={`/playlist/${event.id}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
        >
          <ExternalLink size={12} />
          Abrir como cliente
        </Link>
      </div>

      {event.sections.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-[var(--border)]">
          <Music2 size={32} className="text-[var(--subtle)] mx-auto mb-3" />
          <p className="text-sm text-[var(--subtle)]">
            Nenhuma seção. O cliente ainda não preencheu a playlist.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {event.sections.map((section) => (
            <div
              key={section.id}
              className="section-card bg-[var(--border)]/30 border border-[var(--border)] rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]/50">
                <h3 className="font-medium text-sm text-[var(--text)]">
                  {section.name}
                </h3>
                <span className="text-xs text-[var(--subtle)]">
                  {section.songs.length} música{section.songs.length !== 1 ? "s" : ""}
                </span>
              </div>
              {section.songs.length === 0 ? (
                <p className="px-5 py-4 text-xs text-[var(--subtle)] italic">
                  Nenhuma música adicionada
                </p>
              ) : (
                <div className="divide-y divide-[var(--border)]/30">
                  {section.songs.map((song, i) => (
                    <div key={song.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-xs text-[var(--subtle)] w-5 text-right shrink-0">
                        {i + 1}
                      </span>
                      {song.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-9 h-9 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-[var(--border)] flex items-center justify-center shrink-0">
                          <Music2 size={14} className="text-[var(--subtle)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-[var(--subtle)] truncate">{song.artist}</p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          song.source === "SPOTIFY"
                            ? "text-green-400 bg-green-400/10"
                            : "text-red-400 bg-red-400/10"
                        }`}
                      >
                        {song.source === "SPOTIFY" ? "Spotify" : "YouTube"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
