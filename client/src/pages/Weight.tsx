import { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import type { WeightEntry } from "../lib/types";

export function Weight() {
  const { profile, refreshProfile } = useApp();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await api.get<WeightEntry[]>("/weight");
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const weightKg = Number(value.replace(",", "."));
    if (!weightKg) return;
    setSaving(true);
    try {
      await api.post("/weight", { weightKg });
      setValue("");
      await load();
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  }

  const chartData = entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    weight: e.weightKg,
  }));

  const current = profile?.currentWeightKg ?? 0;
  const goal = profile?.goalWeightKg ?? 0;
  const start = profile?.startWeightKg ?? current;
  const totalToLose = start - goal;
  const lostSoFar = start - current;
  const progressPct = totalToLose > 0 ? Math.min(Math.max((lostSoFar / totalToLose) * 100, 0), 100) : 0;

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-6">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Suivi du poids</h1>

      {profile && (
        <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-900">{current} kg</div>
              <div className="text-xs text-slate-400">Poids actuel</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-brand-600">{goal} kg</div>
              <div className="text-xs text-slate-400">Objectif</div>
            </div>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {lostSoFar > 0 ? `${lostSoFar.toFixed(1)} kg perdus` : "En route vers ton objectif"} · {totalToLose > 0 ? `${(totalToLose - lostSoFar).toFixed(1)} kg restants` : ""}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mb-6 flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Ton poids aujourd'hui (kg)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input"
        />
        <button
          type="submit"
          disabled={saving || !value}
          className="whitespace-nowrap rounded-xl bg-brand-600 px-4 font-semibold text-white disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>

      {!loading && chartData.length > 1 && (
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-slate-600">Évolution</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} kg`, "Poids"]} />
              {goal > 0 && <ReferenceLine y={goal} stroke="#16a34a" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {[...entries].reverse().map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="text-sm text-slate-500">
              {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="font-semibold text-slate-800">{entry.weightKg} kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}
