import { Router } from "express";
import { prisma } from "../lib/prisma";
import { computeGoals, type ActivityLevel, type Sex } from "../lib/nutrition";

const router = Router();

router.get("/", async (_req, res) => {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  res.json(profile);
});

router.post("/", async (req, res) => {
  const body = req.body as {
    name: string;
    sex: Sex;
    age: number;
    heightCm: number;
    currentWeightKg: number;
    goalWeightKg: number;
    activityLevel: ActivityLevel;
    weeklyRateKg: number;
  };

  const goals = computeGoals({
    sex: body.sex,
    weightKg: body.currentWeightKg,
    heightCm: body.heightCm,
    age: body.age,
    activityLevel: body.activityLevel,
    weeklyRateKg: body.weeklyRateKg,
  });

  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      name: body.name,
      sex: body.sex,
      age: body.age,
      heightCm: body.heightCm,
      startWeightKg: body.currentWeightKg,
      currentWeightKg: body.currentWeightKg,
      goalWeightKg: body.goalWeightKg,
      activityLevel: body.activityLevel,
      weeklyRateKg: body.weeklyRateKg,
      calorieGoal: goals.calorieGoal,
      proteinGoalG: goals.proteinG,
      carbsGoalG: goals.carbsG,
      fatGoalG: goals.fatG,
    },
    update: {
      name: body.name,
      sex: body.sex,
      age: body.age,
      heightCm: body.heightCm,
      currentWeightKg: body.currentWeightKg,
      goalWeightKg: body.goalWeightKg,
      activityLevel: body.activityLevel,
      weeklyRateKg: body.weeklyRateKg,
      calorieGoal: goals.calorieGoal,
      proteinGoalG: goals.proteinG,
      carbsGoalG: goals.carbsG,
      fatGoalG: goals.fatG,
    },
  });

  await prisma.weightEntry.upsert({
    where: { id: `initial-${profile.id}` },
    create: {
      id: `initial-${profile.id}`,
      date: new Date().toISOString().slice(0, 10),
      weightKg: body.currentWeightKg,
    },
    update: {},
  });

  res.json(profile);
});

export default router;
