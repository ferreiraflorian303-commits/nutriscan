import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { DashboardData } from "../lib/types";
import { CalorieRing } from "../components/CalorieRing";
import { MacroBar } from "../components/MacroBar";
import { MealCard } from "../components/MealCard";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Encas",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const d = await api.get<DashboardData>(`/dashboard/today?date=${todayStr()}`);
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    await api.del(`/meals/${id}`);
    load();
  }

  if (loading || !data) {
    return <div className="flex h-full items-center justify-center text-slate-400">Chargement...</div>;
  }

  const profile = data.profile;
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm capitalize text-slate-400">{today}</p>
          <h1 className="text-xl font-bold text-slate-900">
            Salut{profile?.name ? `, ${profile.name}` : ""} 👋
          </h1>
        </div>
        {profile && (
          <div className="text-right text-xs text-slate-400">
            <div className="font-semibold text-slate-600">{profile.currentWeightKg} kg</div>
            <div>objectif {profile.goalWeightKg} kg</div>
          </div>
        )}
      </div>

      {profile && (
        <>
          <div className="mb-6 flex justify-center rounded-2xl bg-white p-6 shadow-sm">
            <CalorieRing consumed={data.totals.calories} goal={profile.calorieGoal} />
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <MacroBar label="Protéines" consumed={data.totals.protein} goal={profile.proteinGoalG} color="#3b82f6" />
            <MacroBar label="Glucides" consumed={data.totals.carbs} goal={profile.carbsGoalG} color="#f59e0b" />
            <MacroBar label="Lipides" consumed={data.totals.fat} goal={profile.fatGoalG} color="#ec4899" />
          </div>
        </>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Repas d'aujourd'hui</h2>
        <Link to="/scan" className="text-sm font-medium text-brand-600">+ Ajouter</Link>
      </div>

      {data.meals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-400">Aucun repas enregistré aujourd'hui.</p>
          <Link to="/scan" className="mt-3 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Scanner mon premier plat
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} label={MEAL_LABELS[meal.mealType] ?? meal.mealType} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
