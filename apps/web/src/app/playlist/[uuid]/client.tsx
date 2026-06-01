"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Search, Plus, X, Music2, CheckCircle2, Loader2, Send } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

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
  eventDate: string | null;
  status: "PENDING" | "SUBMITTED" | "EXPIRED";
  sections: Section[];
};

type Brand = { name: string; color: string; logoUrl: string | null };

type SearchResult = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  source: "SPOTIFY" | "YOUTUBE";
  spotifyUrl: string | null;
  youtubeUrl: string | null;
};

export function PlaylistClient({
  event: initialEvent,
  brand,
}: {
  event: Event;
  brand: Brand;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [event, setEvent] = useState<Event>(initialEvent);
  const [activeSection, setActiveSection] = useState<string | null>(
    initialEvent.sections[0]?.id || null
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(initialEvent.status === "SUBMITTED");
  const debouncedQuery = useDebounce(query, 400);

  // Inject brand color as CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--brand", brand.color);
  }, [brand.color]);

  useGSAP(
    () => {
      gsap.from(".playlist-header", { y: -20, opacity: 0, duration: 0.6 });
      gsap.from(".section-tab", {
        y: 10,
        opacity: 0,
        stagger: 0.06,
        duration: 0.4,
        delay: 0.2,
      });
      gsap.from(".search-area", { y: 16, opacity: 0, duration: 0.4, delay: 0.3 });
    },
    { scope: container }
  );

  // Music search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || []))
      .catch(console.error)
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const addSong = useCallback(
    async (song: SearchResult) => {
      if (!activeSection) return;
      const section = event.sections.find((s) => s.id === activeSection);
      if (!section) return;

      const res = await fetch(
        `/api/playlist/${event.id}/sections/${activeSection}/songs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(song),
        }
      );
      if (!res.ok) return;
      const newSong: Song = await res.json();

      setEvent((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === activeSection ? { ...s, songs: [...s.songs, newSong] } : s
        ),
      }));

      // Animate new song in
      setTimeout(() => {
        const els = document.querySelectorAll(".song-item");
        const last = els[els.length - 1];
        if (last) gsap.from(last, { x: 20, opacity: 0, duration: 0.3 });
      }, 50);
    },
    [activeSection, event.id, event.sections]
  );

  const removeSong = async (sectionId: string, songId: string) => {
    await fetch(`/api/playlist/${event.id}/sections/${sectionId}/songs/${songId}`, {
      method: "DELETE",
    });
    setEvent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, songs: s.songs.filter((song) => song.id !== songId) } : s
      ),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/playlist/${event.id}/finalize`, { method: "POST" });
    if (res.ok) {
      setSubmitted(true);
      gsap.to(".submit-section", { opacity: 0, y: -10, duration: 0.3 });
      gsap.from(".submitted-banner", { y: 20, opacity: 0, duration: 0.5, delay: 0.2 });
    }
    setSubmitting(false);
  };

  const currentSection = event.sections.find((s) => s.id === activeSection);
  const totalSongs = event.sections.reduce((acc, s) => acc + s.songs.length, 0);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <div className="submitted-banner text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: brand.color + "20" }}
          >
            <CheckCircle2 size={32} style={{ color: brand.color }} />
          </div>
          <h1 className="font-display font-bold text-xl text-[var(--text)] mb-2">
            Playlist enviada! 🎉
          </h1>
          <p className="text-[var(--subtle)] text-sm">
            O DJ foi notificado e já tem acesso às suas escolhas.
          </p>
          <p className="text-xs text-[var(--subtle)] mt-4">
            {totalSongs} músicas em {event.sections.length} seções
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={container}
      className="min-h-screen bg-[var(--bg)]"
      style={{ "--brand": brand.color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="playlist-header border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoUrl} alt={brand.name} className="h-8 object-contain" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: brand.color }}
              >
                <Music2 size={16} className="text-black" />
              </div>
            )}
            <span className="font-display font-bold text-[var(--text)]">{brand.name}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--subtle)]">Playlist para</p>
            <p className="text-sm font-medium text-[var(--text)]">{event.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-1">
            Olá, {event.clientName}! 👋
          </h1>
          <p className="text-[var(--subtle)] text-sm">
            Escolha as músicas para cada momento do seu evento. Pesquise e adicione suas favoritas abaixo.
          </p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {event.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="section-tab flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={
                activeSection === section.id
                  ? { backgroundColor: brand.color, color: "#000" }
                  : undefined
              }
              data-inactive={activeSection !== section.id ? "true" : undefined}
            >
              {section.name}
              {section.songs.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">{section.songs.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Style inactive tabs */}
        <style>{`
          button[data-inactive="true"] {
            color: var(--subtle);
            background: var(--border);
          }
          button[data-inactive="true"]:hover {
            color: var(--text);
          }
        `}</style>

        {/* Search area */}
        <div className="search-area mb-6">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar música ou artista..."
              className="w-full bg-[var(--border)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--subtle)] focus:border-[var(--muted)] focus:outline-none transition-colors"
            />
            {searching && (
              <Loader2
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--subtle)] animate-spin"
              />
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-2 bg-[#1a1a22] border border-[var(--border)] rounded-xl overflow-hidden shadow-xl">
              {results.slice(0, 6).map((result) => (
                <button
                  key={`${result.source}-${result.id}`}
                  onClick={() => addSong(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--border)] transition-colors text-left border-b border-[var(--border)]/50 last:border-0"
                >
                  {result.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.coverUrl}
                      alt={result.title}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-[var(--border)] flex items-center justify-center shrink-0">
                      <Music2 size={14} className="text-[var(--subtle)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{result.title}</p>
                    <p className="text-xs text-[var(--subtle)] truncate">{result.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                        result.source === "SPOTIFY"
                          ? "text-green-400 bg-green-400/10"
                          : "text-red-400 bg-red-400/10"
                      }`}
                    >
                      {result.source === "SPOTIFY" ? "SP" : "YT"}
                    </span>
                    <Plus size={14} className="text-[var(--subtle)]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current section songs */}
        {currentSection && (
          <div>
            <h2 className="font-display font-semibold text-[var(--text)] mb-3">
              {currentSection.name}
              <span className="ml-2 text-sm font-normal text-[var(--subtle)]">
                {currentSection.songs.length} música{currentSection.songs.length !== 1 ? "s" : ""}
              </span>
            </h2>
            {currentSection.songs.length === 0 ? (
              <div className="text-center py-10 rounded-xl border border-dashed border-[var(--border)]">
                <Music2 size={24} className="text-[var(--subtle)] mx-auto mb-2" />
                <p className="text-sm text-[var(--subtle)]">
                  Busque músicas acima para adicionar aqui
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentSection.songs.map((song, i) => (
                  <div
                    key={song.id}
                    className="song-item flex items-center gap-3 bg-[var(--border)]/30 border border-[var(--border)] rounded-xl px-4 py-3"
                  >
                    <span className="text-xs text-[var(--subtle)] w-5 text-right shrink-0">
                      {i + 1}
                    </span>
                    {song.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[var(--border)] flex items-center justify-center shrink-0">
                        <Music2 size={14} className="text-[var(--subtle)]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">{song.title}</p>
                      <p className="text-xs text-[var(--subtle)] truncate">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => removeSong(currentSection.id, song.id)}
                      className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        {totalSongs > 0 && (
          <div className="submit-section mt-10 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text)] text-sm">
                  {totalSongs} músicas selecionadas
                </p>
                <p className="text-xs text-[var(--subtle)] mt-0.5">
                  Você pode revisar antes de enviar
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-all hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: brand.color }}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {submitting ? "Enviando..." : "Enviar playlist"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
