import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ApiError } from "../lib/api";

export function Login() {
  const { login } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(pin);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-brand-600 to-brand-800 px-6 py-12 text-white">
      <div className="mb-8 flex flex-col items-center gap-3">
        <img src="/icon.svg" alt="NutriScan" className="h-20 w-20 rounded-2xl shadow-lg" />
        <h1 className="text-2xl font-bold">NutriScan</h1>
        <p className="text-center text-sm text-brand-100">
          Scanne tes plats, atteins ton objectif
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
        <label className="mb-2 block text-sm font-medium text-slate-600">Code d'accès</label>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          placeholder="••••"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pin}
          className="mt-4 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Entrer"}
        </button>
      </form>
    </div>
  );
}
