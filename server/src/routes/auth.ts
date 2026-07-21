import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  const { pin } = req.body as { pin?: string };
  if (!pin || pin !== process.env.APP_PIN) {
    return res.status(401).json({ error: "Code incorrect" });
  }
  req.session.authenticated = true;
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

export default router;
