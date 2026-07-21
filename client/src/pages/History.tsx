import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DashboardData } from "../lib/types";
import { MealCard } from "../components/MealCard";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Encas",
};

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function History() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d: Date) => {
    setLoading(true);
    const res = await api.get<DashboardData>(`/dashboard/today?date=${toDateStr(d)}`);
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  async function handleDelete(id: string) {
    await api.del(`/meals/${id}`);
    load(date);
  }

  const isToday = toDateStr(date) === toDateStr(new Date());
  const label = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  function shiftDay(delta: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    if (d > new Date()) return;
    setDate(d);
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-6">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Journal</h1>

      <div className="mb-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <button onClick={() => shiftDay(-1)} className="p-2 text-slate-400">
          <ChevronLeft />
        </button>
        <span className="text-sm font-medium capitalize text-slate-700">{isToday ? "Aujourd'hui" : label}</span>
        <button onClick={() => shiftDay(1)} disabled={isToday} className="p-2 text-slate-400 disabled:opacity-20">
          <ChevronRight />
        </button>
      </div>

      {loading || !data ? (
        <div className="py-12 text-center text-slate-400">Chargement...</div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-4 gap-2">
            <StatChip label="kcal" value={Math.round(data.totals.calories)} />
            <StatChip label="Prot." value={`${Math.round(data.totals.protein)}g`} />
            <StatChip label="Gluc." value={`${Math.round(data.totals.carbs)}g`} />
            <StatChip label="Lip." value={`${Math.round(data.totals.fat)}g`} />
          </div>

          {data.meals.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Aucun repas ce jour-là.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} label={MEAL_LABELS[meal.mealType] ?? meal.mealType} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <div className="font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
