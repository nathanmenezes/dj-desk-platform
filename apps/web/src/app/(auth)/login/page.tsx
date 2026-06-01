"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="font-display font-extrabold text-lg tracking-tight">DJ Desk</span>
      </div>

      <h1 className="font-display font-extrabold text-3xl tracking-tight mb-1">
        Entrar
      </h1>
      <p className="text-sm text-[var(--subtle)] mb-8">
        Não tem conta?{" "}
        <Link href="/register" className="text-[var(--accent)] hover:underline">
          Criar conta
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium tracking-widest uppercase text-[var(--subtle)] mb-2">
            E-mail
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
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
            autoComplete="current-password"
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="••••••••"
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
          {loading ? "Entrando..." : "Entrar →"}
        </button>
      </form>
    </div>
  );
}
