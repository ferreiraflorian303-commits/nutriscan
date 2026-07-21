import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";

import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import mealsRoutes from "./routes/meals";
import weightRoutes from "./routes/weight";
import dashboardRoutes from "./routes/dashboard";
import { requireAuth } from "./lib/auth";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 90, // 90 jours
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", requireAuth, profileRoutes);
app.use("/api/meals", requireAuth, mealsRoutes);
app.use("/api/weight", requireAuth, weightRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`NutriScan API sur http://localhost:${PORT}`);
});
