export type Sex = "female" | "male";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Mifflin-St Jeor
export function computeBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function computeTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

// 1 kg de graisse ~= 7700 kcal
export function computeCalorieGoal(tdee: number, weeklyRateKg: number): number {
  const dailyDeficit = (weeklyRateKg * 7700) / 7;
  const goal = tdee - dailyDeficit;
  // Plancher de sécurité pour ne jamais descendre sous un seuil dangereux
  return Math.round(Math.max(goal, 1200));
}

export function computeMacroGoals(calorieGoal: number, weightKg: number) {
  // Protéines: 1.8g/kg (préservation masse musculaire en déficit)
  const proteinG = Math.round(weightKg * 1.8);
  const proteinCal = proteinG * 4;

  // Lipides: 25% des calories totales
  const fatCal = calorieGoal * 0.25;
  const fatG = Math.round(fatCal / 9);

  // Glucides: le reste
  const carbsCal = Math.max(calorieGoal - proteinCal - fatCal, 0);
  const carbsG = Math.round(carbsCal / 4);

  return { proteinG, carbsG, fatG };
}

export function computeGoals(input: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  weeklyRateKg: number;
}) {
  const bmr = computeBMR(input.sex, input.weightKg, input.heightCm, input.age);
  const tdee = computeTDEE(bmr, input.activityLevel);
  const calorieGoal = computeCalorieGoal(tdee, input.weeklyRateKg);
  const macros = computeMacroGoals(calorieGoal, input.weightKg);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calorieGoal, ...macros };
}
