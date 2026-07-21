import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import type { ActivityLevel, Profile, Sex } from "../lib/types";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sédentaire", desc: "Peu ou pas d'exercice, travail assis" },
  { value: "light", label: "Légèrement actif", desc: "Sport léger 1 à 3 fois / semaine" },
  { value: "moderate", label: "Modérément actif", desc: "Sport modéré 3 à 5 fois / semaine" },
  { value: "active", label: "Actif", desc: "Sport intense 6 à 7 fois / semaine" },
  { value: "very_active", label: "Très actif", desc: "Sport quotidien intense ou travail physique" },
];

const RATE_OPTIONS = [
  { value: 0.25, label: "Doucement", desc: "0.25 kg / semaine" },
  { value: 0.5, label: "Recommandé", desc: "0.5 kg / semaine" },
  { value: 0.75, label: "Rapide", desc: "0.75 kg / semaine" },
  { value: 1, label: "Ambitieux", desc: "1 kg / semaine" },
];

export function Onboarding() {
  const { refreshProfile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Profile | null>(null);

  const [form, setForm] = useState({
    name: "",
    sex: "female" as Sex,
    age: 25,
    heightCm: 165,
    currentWeightKg: 70,
    goalWeightKg: 60,
    activityLevel: "light" as ActivityLevel,
    weeklyRateKg: 0.5,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const steps = ["Toi", "Objectif", "Activité", "Résumé"];

  async function submit() {
    setSaving(true);
    setError("");
    try {
      const profile = await api.post<Profile>("/profile", form);
      setResult(profile);
      setStep(3);
    } catch {
      setError("Impossible d'enregistrer ton profil, réessaie.");
    } finally {
      setSaving(false);
    }
  }

  async function finish() {
    await refreshProfile();
    navigate("/");
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-white px-6 py-8">
      <div className="mb-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand-600" : "bg-slate-100"}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenue 👋</h1>
            <p className="mt-1 text-sm text-slate-500">Parle-nous un peu de toi pour calculer tes besoins.</p>
          </div>
          <Field label="Prénom">
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ton prénom"
            />
          </Field>
          <Field label="Sexe">
            <div className="grid grid-cols-2 gap-3">
              {(["female", "male"] as Sex[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("sex", s)}
                  className={`rounded-xl border-2 py-3 font-medium ${
                    form.sex === s ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {s === "female" ? "Femme" : "Homme"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Âge"><NumberInput value={form.age} onChange={(v) => update("age", v)} suffix="ans" /></Field>
          <Field label="Taille"><NumberInput value={form.heightCm} onChange={(v) => update("heightCm", v)} suffix="cm" /></Field>
          <Field label="Poids actuel"><NumberInput value={form.currentWeightKg} onChange={(v) => update("currentWeightKg", v)} suffix="kg" step={0.1} /></Field>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ton objectif 🎯</h1>
            <p className="mt-1 text-sm text-slate-500">Quel poids veux-tu atteindre, et à quel rythme ?</p>
          </div>
          <Field label="Poids objectif"><NumberInput value={form.goalWeightKg} onChange={(v) => update("goalWeightKg", v)} suffix="kg" step={0.1} /></Field>
          <Field label="Rythme de perte souhaité">
            <div className="flex flex-col gap-2">
              {RATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("weeklyRateKg", opt.value)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left ${
                    form.weeklyRateKg === opt.value ? "border-brand-600 bg-brand-50" : "border-slate-200"
                  }`}
                >
                  <span className="font-medium text-slate-800">{opt.label}</span>
                  <span className="text-sm text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ton activité 🏃</h1>
            <p className="mt-1 text-sm text-slate-500">Ça nous aide à calculer tes besoins caloriques précisément.</p>
          </div>
          <div className="flex flex-col gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("activityLevel", opt.value)}
                className={`rounded-xl border-2 px-4 py-3 text-left ${
                  form.activityLevel === opt.value ? "border-brand-600 bg-brand-50" : "border-slate-200"
                }`}
              >
                <div className="font-medium text-slate-800">{opt.label}</div>
                <div className="text-sm text-slate-500">{opt.desc}</div>
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {step === 3 && result && (
        <div className="flex flex-1 flex-col items-center gap-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">C'est prêt {form.name} ! 🎉</h1>
            <p className="mt-1 text-sm text-slate-500">Voici tes objectifs quotidiens personnalisés.</p>
          </div>
          <div className="w-full rounded-2xl bg-brand-50 p-6">
            <div className="text-4xl font-bold text-brand-700">{result.calorieGoal}</div>
            <div className="text-sm text-brand-600">kcal / jour</div>
          </div>
          <div className="grid w-full grid-cols-3 gap-3">
            <MacroChip label="Protéines" value={result.proteinGoalG} color="#3b82f6" />
            <MacroChip label="Glucides" value={result.carbsGoalG} color="#f59e0b" />
            <MacroChip label="Lipides" value={result.fatGoalG} color="#ec4899" />
          </div>
          <p className="text-xs text-slate-400">
            Objectif : {form.currentWeightKg}kg → {form.goalWeightKg}kg à {form.weeklyRateKg}kg/semaine
          </p>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && step < 3 && (
          <button onClick={() => setStep((s) => s - 1)} className="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600">
            Retour
          </button>
        )}
        {step < 2 && (
          <button onClick={() => setStep((s) => s + 1)} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white">
            Continuer
          </button>
        )}
        {step === 2 && (
          <button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white disabled:opacity-50">
            {saving ? "Calcul..." : "Calculer mes objectifs"}
          </button>
        )}
        {step === 3 && (
          <button onClick={finish} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white">
            Commencer
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full outline-none"
      />
      {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
    </div>
  );
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="text-lg font-bold" style={{ color }}>{value}g</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
