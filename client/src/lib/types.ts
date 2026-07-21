export type Sex = "female" | "male";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Confidence = "low" | "medium" | "high";

export interface Profile {
  id: number;
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  weeklyRateKg: number;
  calorieGoal: number;
  proteinGoalG: number;
  carbsGoalG: number;
  fatGoalG: number;
}

export interface MealItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  date: string;
  eatenAt: string;
  mealType: MealType;
  name: string;
  photoData?: string | null;
  items: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: Confidence;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  note?: string | null;
}

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DashboardData {
  date: string;
  profile: Profile | null;
  meals: Meal[];
  totals: Totals;
  remaining: { calories: number; protein: number; carbs: number; fat: number } | null;
}

export interface MealAnalysis {
  name: string;
  items: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: Confidence;
}
