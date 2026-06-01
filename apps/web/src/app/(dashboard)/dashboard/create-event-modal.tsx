"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

type Template = { id: string; name: string; isDefault: boolean };

type Props = { onClose: () => void };

export function CreateEventModal({ onClose }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    eventDate: "",
    deadline: "",
    templateId: "",
  });

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  useGSAP(
    () => {
      gsap.from(overlay.current, { opacity: 0, duration: 0.2 });
      gsap.from(".modal-card", {
        y: 30,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
      });
    },
    { scope: container }
  );

  const close = () => {
    gsap.to(".modal-card", {
      y: 20,
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao criar evento");
      const event = await res.json();
      router.push(`/events/${event.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = false
  ) => (
    <div>
      <label className="block text-xs text-[var(--subtle)] uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-[var(--accent)]">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--subtle)] focus:border-[var(--accent)] focus:outline-none transition-colors"
      />
    </div>
  );

  return (
    <div ref={container} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlay}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="modal-card relative bg-[#1a1a22] border border-[var(--border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg text-[var(--text)]">
            Novo Evento
          </h2>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-[var(--subtle)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Nome do evento", "name", "text", true)}
          {field("Nome do cliente", "clientName", "text", true)}
          {field("E-mail do cliente", "clientEmail", "email")}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                Data do evento
              </label>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--subtle)] uppercase tracking-wider mb-1.5">
                Prazo de resposta
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Template picker */}
          <div>
            <label className="block text-xs text-[var(--subtle)] uppercase tracking-wider mb-1.5">
              Template de seções
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, templateId: "" }))}
                className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                  form.templateId === ""
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] text-[var(--subtle)] hover:border-[var(--muted)]"
                }`}
              >
                Sem template
              </button>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, templateId: t.id }))}
                  className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                    form.templateId === t.id
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] text-[var(--subtle)] hover:border-[var(--muted)]"
                  }`}
                >
                  {t.name}
                  {t.isDefault && (
                    <span className="ml-1 text-[10px] text-[var(--subtle)]">•</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-black font-semibold py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Criando..." : "Criar Evento"}
          </button>
        </form>
      </div>
    </div>
  );
}
