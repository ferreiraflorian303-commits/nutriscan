import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { MealAnalysis, MealType } from "../lib/types";

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Petit-déj" },
  { value: "lunch", label: "Déjeuner" },
  { value: "dinner", label: "Dîner" },
  { value: "snack", label: "Encas" },
];

function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 22) return "dinner";
  return "snack";
}

export function Scan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [mealType, setMealType] = useState<MealType>(guessMealType());

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setError("");
  }

  async function analyze() {
    if (!photoFile) return;
    setAnalyzing(true);
    setError("");
    try {
      const form = new FormData();
      form.append("photo", photoFile);
      const res = await api.post<{ analysis: MealAnalysis; photoData: string }>("/meals/analyze", form);
      setAnalysis(res.analysis);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "L'analyse a échoué, réessaie.");
    } finally {
      setAnalyzing(false);
    }
  }

  function updateField<K extends keyof MealAnalysis>(key: K, value: MealAnalysis[K]) {
    if (!analysis) return;
    setAnalysis({ ...analysis, [key]: value });
  }

  async function save() {
    if (!analysis || !photoPreview) return;
    setSaving(true);
    try {
      await api.post("/meals", {
        date: new Date().toISOString().slice(0, 10),
        mealType,
        name: analysis.name,
        photoData: photoPreview.startsWith("data:") ? photoPreview : await toBase64(photoFile!),
        items: analysis.items,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        fiber: analysis.fiber,
        confidence: analysis.confidence,
      });
      navigate("/");
    } catch {
      setError("Impossible d'enregistrer ce repas.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setAnalysis(null);
    setError("");
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-6">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Scanner un plat</h1>
      <p className="mb-6 text-sm text-slate-500">Prends en photo ton repas, l'IA calcule tout pour toi.</p>

      {!photoPreview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 py-16"
        >
          <CameraIcon className="h-10 w-10 text-brand-600" />
          <span className="font-medium text-brand-700">Prendre une photo</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {photoPreview && (
        <div className="mb-4 overflow-hidden rounded-2xl">
          <img src={photoPreview} alt="Ton plat" className="max-h-80 w-full object-cover" />
        </div>
      )}

      {photoPreview && !analysis && !analyzing && (
        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 rounded-xl border border-slate-200 py-3 font-medium text-slate-600">
            Reprendre
          </button>
          <button onClick={analyze} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold text-white">
            Analyser
          </button>
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-500">Analyse en cours par l'IA...</p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {analysis && (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Nom du plat</label>
            <input className="input" value={analysis.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Repas</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMealType(t.value)}
                  className={`rounded-lg py-2 text-xs font-medium ${
                    mealType === t.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {analysis.confidence === "low" && (
            <div className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700">
              Estimation incertaine — ajuste les valeurs si besoin.
            </div>
          )}

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 grid grid-cols-4 gap-2 text-center">
              <MacroInput label="kcal" value={analysis.calories} onChange={(v) => updateField("calories", v)} />
              <MacroInput label="Prot." value={analysis.protein} onChange={(v) => updateField("protein", v)} suffix="g" />
              <MacroInput label="Gluc." value={analysis.carbs} onChange={(v) => updateField("carbs", v)} suffix="g" />
              <MacroInput label="Lip." value={analysis.fat} onChange={(v) => updateField("fat", v)} suffix="g" />
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-medium text-slate-400">Détail des aliments détectés</p>
              <ul className="flex flex-col gap-1 text-sm text-slate-600">
                {analysis.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.name} · {item.quantity}{item.unit}</span>
                    <span className="text-slate-400">{Math.round(item.calories)} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Ajouter à mon journal"}
          </button>
        </div>
      )}
    </div>
  );
}

function MacroInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-slate-200 py-2 text-center font-semibold outline-none focus:border-brand-500"
      />
      <div className="mt-1 text-[10px] text-slate-400">{label}{suffix ? ` (${suffix})` : ""}</div>
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 8a2 2 0 0 1 2-2h1.5l1-2h7l1 2H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
