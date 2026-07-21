import { Router } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { prisma } from "../lib/prisma";
import { analyzeMealPhoto } from "../lib/vision";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/analyze", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune photo fournie" });
    }
    const base64 = req.file.buffer.toString("base64");
    const analysis = await analyzeMealPhoto(base64, req.file.mimetype);
    const photoData = `data:${req.file.mimetype};base64,${base64}`;
    res.json({ analysis, photoData });
  } catch (err) {
    console.error("Erreur analyse IA:", err);
    res.status(500).json({ error: "L'analyse du plat a échoué. Réessaie avec une photo plus nette." });
  }
});

router.get("/", async (req, res) => {
  const { date } = req.query as { date?: string };
  const meals = await prisma.meal.findMany({
    where: date ? { date } : undefined,
    orderBy: { eatenAt: "asc" },
  });
  res.json(meals.map((m) => ({ ...m, items: JSON.parse(m.items) })));
});

router.post("/", async (req, res) => {
  const body = req.body as {
    date: string;
    mealType: string;
    name: string;
    photoData?: string;
    items: unknown;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    confidence: string;
  };

  const meal = await prisma.meal.create({
    data: {
      id: uuid(),
      date: body.date,
      mealType: body.mealType,
      name: body.name,
      photoData: body.photoData,
      items: JSON.stringify(body.items),
      calories: body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
      fiber: body.fiber ?? 0,
      confidence: body.confidence ?? "medium",
    },
  });

  res.json({ ...meal, items: JSON.parse(meal.items) });
});

router.delete("/:id", async (req, res) => {
  await prisma.meal.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
