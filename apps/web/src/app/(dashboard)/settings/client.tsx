"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Save, Palette, User, Link } from "lucide-react";

interface Props {
  profile: {
    brandName: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
  };
  userEmail: string;
}

const PRESET_COLORS = [
  "#C8F135", "#00E5FF", "#FF3D71", "#FF9500", "#A855F7", "#22D3EE", "#F59E0B", "#10B981",
];

export function SettingsClient({ profile, userEmail }: Props) {
  const [brandName, setBrandName] = useState(profile.brandName ?? "");
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(profile.primaryColor ?? "#C8F135");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll(".settings-section"), {
      opacity: 0,
      y: 16,
      stagger: 0.08,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, logoUrl, primaryColor }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      if (saveRef.current) {
        gsap.fromTo(saveRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
      }
      setTimeout(() => setSaved(false), 2500);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto" ref={containerRef}>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white">Configuracoes</h1>
        <p className="text-zinc-400 text-sm mt-1">Personalize sua marca e aparencia para os clientes</p>
      </div>

      {/* Account */}
      <div className="settings-section bg-zinc-900 border border-white/10 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-[#C8F135]" />
          <h2 className="text-sm font-semibold text-white">Conta</h2>
        </div>
        <p className="text-sm text-zinc-400">Email: <span className="text-white">{userEmail}</span></p>
      </div>

      {/* Brand identity */}
      <div className="settings-section bg-zinc-900 border border-white/10 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={15} className="text-[#C8F135]" />
          <h2 className="text-sm font-semibold text-white">Identidade da Marca</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Nome da marca (exibido ao cliente)</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ex: DJ Marquinhos"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#C8F135]/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">Cor principal</label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-all ${
                    primaryColor === color ? "ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110" : "hover:scale-105"
                  }`}
                />
              ))}
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                title="Cor personalizada"
              />
            </div>
            <div
              className="mt-3 h-2 rounded-full w-full"
              style={{ background: `linear-gradient(90deg, ${primaryColor}33, ${primaryColor})` }}
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="settings-section bg-zinc-900 border border-white/10 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link size={15} className="text-[#C8F135]" />
          <h2 className="text-sm font-semibold text-white">Logo</h2>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block">URL da logo (PNG/SVG recomendado)</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://exemplo.com/logo.png"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#C8F135]/50 transition-colors"
          />
        </div>
        {logoUrl && (
          <div className="mt-3 flex items-center gap-3">
            <img src={logoUrl} alt="Preview" className="h-10 object-contain rounded" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            <span className="text-xs text-zinc-500">Preview</span>
          </div>
        )}
      </div>

      {/* Preview badge */}
      <div className="settings-section mb-6 p-4 bg-black/40 border border-white/5 rounded-xl">
        <p className="text-xs text-zinc-500 mb-2">Preview do badge no link do cliente</p>
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="h-6 object-contain" />
          ) : (
            <div className="w-6 h-6 rounded" style={{ backgroundColor: primaryColor }} />
          )}
          <span className="text-sm font-semibold text-white">{brandName || "Seu Nome"}</span>
        </div>
      </div>

      <button
        ref={saveRef}
        onClick={save}
        disabled={saving}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-[#C8F135] text-black hover:bg-[#d4f54d]"
        } disabled:opacity-50`}
      >
        <Save size={15} />
        {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar Alteracoes"}
      </button>
    </div>
  );
}
