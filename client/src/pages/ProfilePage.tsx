import { useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../lib/api";
import type { ActivityLevel, Profile, Sex } from "../lib/types";

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sédentaire",
  light: "Légèrement actif",
  moderate: "Modérément actif",
  active: "Actif",
  very_active: "Très actif",
};

export function ProfilePage() {
  const { profile, refreshProfile, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Profile | null>(profile);

  if (!profile) return null;
  const current = form ?? profile;

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...(f ?? profile), [key]: value }) as Profile);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      await api.post("/profile", {
        name: form.name,
        sex: form.sex,
        age: form.age,
        heightCm: form.heightCm,
        currentWeightKg: form.currentWeightKg,
        goalWeightKg: form.goalWeightKg,
        activityLevel: form.activityLevel,
        weeklyRateKg: form.weeklyRateKg,
      });
      await refreshProfile();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Profil</h1>
        <button
          onClick={() => (editing ? save() : setEditing(true))}
          disabled={saving}
          className="text-sm font-medium text-brand-600"
        >
          {editing ? (saving ? "Enregistrement..." : "Enregistrer") : "Modifier"}
        </button>
      </div>

      <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
        {editing ? (
          <div className="flex flex-col gap-4">
            <LabeledInput label="Prénom" value={current.name} onChange={(v) => update("name", v)} />
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber label="Âge" value={current.age} onChange={(v) => update("age", v)} />
              <LabeledNumber label="Taille (cm)" value={current.heightCm} onChange={(v) => update("heightCm", v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber label="Poids actuel (kg)" value={current.currentWeightKg} step={0.1} onChange={(v) => update("currentWeightKg", v)} />
              <LabeledNumber label="Objectif (kg)" value={current.goalWeightKg} step={0.1} onChange={(v) => update("goalWeightKg", v)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Sexe</label>
              <div className="grid grid-cols-2 gap-2">
                {(["female", "male"] as Sex[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => update("sex", s)}
                    className={`rounded-xl border-2 py-2 text-sm font-medium ${
                      current.sex === s ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {s === "female" ? "Femme" : "Homme"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Niveau d'activité</label>
              <select
                className="input"
                value={current.activityLevel}
                onChange={(e) => update("activityLevel", e.target.value as ActivityLevel)}
              >
                {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Rythme de perte (kg/semaine)</label>
              <input
                type="number"
                step={0.25}
                className="input"
                value={current.weeklyRateKg}
                onChange={(e) => update("weeklyRateKg", Number(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Prénom" value={profile.name || "—"} />
            <Row label="Sexe" value={profile.sex === "female" ? "Femme" : "Homme"} />
            <Row label="Âge" value={`${profile.age} ans`} />
            <Row label="Taille" value={`${profile.heightCm} cm`} />
            <Row label="Poids actuel" value={`${profile.currentWeightKg} kg`} />
            <Row label="Objectif" value={`${profile.goalWeightKg} kg`} />
            <Row label="Activité" value={ACTIVITY_LABELS[profile.activityLevel]} />
            <Row label="Rythme" value={`${profile.weeklyRateKg} kg/semaine`} />
          </div>
        )}
      </div>

      <div className="mb-5 rounded-2xl bg-brand-50 p-5">
        <p className="mb-3 text-sm font-medium text-brand-700">Objectifs quotidiens calculés</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="font-bold text-brand-700">{profile.calorieGoal}</div>
            <div className="text-[10px] text-brand-500">kcal</div>
          </div>
          <div>
            <div className="font-bold text-brand-700">{profile.proteinGoalG}g</div>
            <div className="text-[10px] text-brand-500">Prot.</div>
          </div>
          <div>
            <div className="font-bold text-brand-700">{profile.carbsGoalG}g</div>
            <div className="text-[10px] text-brand-500">Gluc.</div>
          </div>
          <div>
            <div className="font-bold text-brand-700">{profile.fatGoalG}g</div>
            <div className="text-[10px] text-brand-500">Lip.</div>
          </div>
        </div>
      </div>

      <button onClick={logout} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-500">
        Se déconnecter
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label>
      <input type="number" step={step} className="input" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
