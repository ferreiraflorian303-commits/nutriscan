interface Props {
  consumed: number;
  goal: number;
}

export function CalorieRing({ consumed, goal }: Props) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const over = consumed > goal;
  const remaining = goal - consumed;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={over ? "#f97316" : "#16a34a"}
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-900">
          {Math.abs(Math.round(remaining))}
        </span>
        <span className="text-xs text-slate-500">
          {over ? "kcal dépassées" : "kcal restantes"}
        </span>
        <span className="mt-1 text-[11px] text-slate-400">
          {Math.round(consumed)} / {goal} kcal
        </span>
      </div>
    </div>
  );
}
