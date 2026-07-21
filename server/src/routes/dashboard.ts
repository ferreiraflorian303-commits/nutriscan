import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/today", async (req, res) => {
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);

  const [profile, meals] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.meal.findMany({ where: { date }, orderBy: { eatenAt: "asc" } }),
  ]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      fiber: acc.fiber + m.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  res.json({
    date,
    profile,
    meals: meals.map((m) => ({ ...m, items: JSON.parse(m.items) })),
    totals,
    remaining: profile
      ? {
          calories: Math.round(profile.calorieGoal - totals.calories),
          protein: Math.round(profile.proteinGoalG - totals.protein),
          carbs: Math.round(profile.carbsGoalG - totals.carbs),
          fat: Math.round(profile.fatGoalG - totals.fat),
        }
      : null,
  });
});

export default router;
