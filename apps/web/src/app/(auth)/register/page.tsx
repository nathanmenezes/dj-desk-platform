"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar conta.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="font-display font-extrabold text-lg tracking-tight">DJ Desk</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl tracking-tight mb-1">
        Criar conta
      </h1>
      <p className="text-sm text-[var(--subtle)] mb-8">
        Já tem conta?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Entrar
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium tracking-widest uppercase text-[var(--subtle)] mb-2">
            Nome
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-xs font-medium tracking-widest uppercase text-[var(--subtle)] mb-2">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium tracking-widest uppercase text-[var(--subtle)] mb-2">
            Senha
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && (
          <p className="text-[var(--danger)] text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-[var(--accent)] text-[var(--bg)] font-display font-bold text-xs tracking-widest uppercase py-4 hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Criando conta..." : "Criar conta →"}
        </button>
      </form>
    </div>
  );
}
