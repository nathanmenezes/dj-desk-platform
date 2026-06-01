"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus, Trash2, GripVertical, Pencil, Check, X, ChevronDown } from "lucide-react";

interface TemplateSection {
  id: string;
  name: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  isDefault: boolean;
  sections: TemplateSection[];
}

interface Props {
  templates: Template[];
  djName: string;
}

export function TemplatesClient({ templates: initialTemplates, djName }: Props) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSections, setNewSections] = useState(["Entrada", "Festa", "Encerramento"]);
  const [sectionInput, setSectionInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<{ templateId: string; sectionId: string; value: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll(".template-card"), {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const addSection = () => {
    const trimmed = sectionInput.trim();
    if (!trimmed) return;
    setNewSections((prev) => [...prev, trimmed]);
    setSectionInput("");
  };

  const removeNewSection = (idx: number) => {
    setNewSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const createTemplate = async () => {
    if (!newName.trim() || newSections.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), sections: newSections }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTemplates((prev) => [...prev, created]);
      setCreating(false);
      setNewName("");
      setNewSections(["Entrada", "Festa", "Encerramento"]);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Excluir este template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-8 max-w-3xl mx-auto" ref={containerRef}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Templates</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie os templates de secoes para seus eventos</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8F135] text-black text-sm font-semibold rounded-lg hover:bg-[#d4f54d] transition-colors"
        >
          <Plus size={16} /> Novo Template
        </button>
      </div>

      {creating && (
        <div className="template-card bg-zinc-900 border border-[#C8F135]/40 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">Novo Template</h3>
          <input
            type="text"
            placeholder="Nome do template"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 mb-4 focus:outline-none focus:border-[#C8F135]/50"
          />
          <p className="text-xs text-zinc-400 mb-2">Secoes</p>
          <div className="flex flex-col gap-2 mb-3">
            {newSections.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                <GripVertical size={14} className="text-zinc-600" />
                <span className="text-sm text-zinc-300 flex-1">{s}</span>
                <button onClick={() => removeNewSection(i)} className="text-zinc-600 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Adicionar secao..."
              value={sectionInput}
              onChange={(e) => setSectionInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#C8F135]/50"
            />
            <button onClick={addSection} className="px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/15 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              onClick={createTemplate}
              disabled={saving}
              className="px-4 py-2 bg-[#C8F135] text-black text-sm font-semibold rounded-lg hover:bg-[#d4f54d] disabled:opacity-50 transition-colors"
            >
              {saving ? "Salvando..." : "Criar Template"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {templates.map((template) => (
          <div key={template.id} className="template-card bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  size={16}
                  className={`text-zinc-400 transition-transform ${expandedId === template.id ? "rotate-180" : ""}`}
                />
                <span className="text-sm font-medium text-white">{template.name}</span>
                {template.isDefault && (
                  <span className="text-xs bg-[#C8F135]/15 text-[#C8F135] px-2 py-0.5 rounded-full">Padrao</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-zinc-500 text-xs">
                <span>{template.sections.length} secoes</span>
                {!template.isDefault && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                    className="hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {expandedId === template.id && (
              <div className="px-5 pb-4 border-t border-white/5">
                <div className="flex flex-col gap-1.5 mt-3">
                  {template.sections.map((section) => (
                    <div key={section.id} className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
                      <GripVertical size={14} className="text-zinc-600" />
                      {editingSection?.templateId === template.id && editingSection?.sectionId === section.id ? (
                        <input
                          autoFocus
                          value={editingSection.value}
                          onChange={(e) => setEditingSection({ ...editingSection, value: e.target.value })}
                          className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                        />
                      ) : (
                        <span className="text-sm text-zinc-300 flex-1">{section.name}</span>
                      )}
                      {!template.isDefault && (
                        editingSection?.sectionId === section.id ? (
                          <button onClick={() => setEditingSection(null)} className="text-zinc-400 hover:text-white">
                            <Check size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingSection({ templateId: template.id, sectionId: section.id, value: section.name })}
                            className="text-zinc-600 hover:text-zinc-300 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
