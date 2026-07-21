import { useState } from "react";
import type { Meal } from "../lib/types";

export function MealCard({ meal, label, onDelete }: { meal: Meal; label: string; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const time = new Date(meal.eatenAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex cursor-pointer items-center gap-3 p-3" onClick={() => setOpen((o) => !o)}>
        {meal.photoData ? (
          <img src={meal.photoData} alt={meal.name} className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-brand-50" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{label}</span>
            <span>·</span>
            <span>{time}</span>
          </div>
          <div className="truncate font-medium text-slate-800">{meal.name}</div>
          <div className="text-xs text-slate-400">
            P {Math.round(meal.protein)}g · G {Math.round(meal.carbs)}g · L {Math.round(meal.fat)}g
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="font-bold text-slate-900">{Math.round(meal.calories)}</div>
          <div className="text-[10px] text-slate-400">kcal</div>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3">
          <ul className="mb-3 flex flex-col gap-1 text-sm text-slate-600">
            {meal.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.name} ({item.quantity}{item.unit})</span>
                <span className="text-slate-400">{Math.round(item.calories)} kcal</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onDelete(meal.id)}
            className="text-sm font-medium text-red-500"
          >
            Supprimer ce repas
          </button>
        </div>
      )}
    </div>
  );
}
