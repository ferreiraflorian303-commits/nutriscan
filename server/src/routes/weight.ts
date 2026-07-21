import { Router } from "express";
import { v4 as uuid } from "uuid";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const entries = await prisma.weightEntry.findMany({ orderBy: { date: "asc" } });
  res.json(entries);
});

router.post("/", async (req, res) => {
  const { weightKg, date, note } = req.body as { weightKg: number; date?: string; note?: string };
  const day = date ?? new Date().toISOString().slice(0, 10);

  const existing = await prisma.weightEntry.findFirst({ where: { date: day } });
  const entry = existing
    ? await prisma.weightEntry.update({ where: { id: existing.id }, data: { weightKg, note } })
    : await prisma.weightEntry.create({ data: { id: uuid(), date: day, weightKg, note } });

  await prisma.profile.update({ where: { id: 1 }, data: { currentWeightKg: weightKg } });

  res.json(entry);
});

router.delete("/:id", async (req, res) => {
  await prisma.weightEntry.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
