import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AnalyzedItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AnalyzedMeal {
  name: string;
  items: AnalyzedItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: "low" | "medium" | "high";
}

const SYSTEM_PROMPT = `Tu es un nutritionniste expert. On te donne la photo d'un plat.
Identifie chaque aliment visible, estime sa quantité (grammes ou unité), et calcule les valeurs nutritionnelles.
Réponds UNIQUEMENT avec un JSON valide, sans texte autour, au format exact suivant:
{
  "name": "nom court du plat en français",
  "items": [
    { "name": "aliment", "quantity": 150, "unit": "g", "calories": 250, "protein": 20, "carbs": 10, "fat": 12 }
  ],
  "calories": 250,
  "protein": 20,
  "carbs": 10,
  "fat": 12,
  "fiber": 3,
  "confidence": "medium"
}
Les totaux (calories, protein, carbs, fat) doivent être la somme des items.
"confidence" reflète ta certitude sur l'estimation des portions ("low", "medium" ou "high").
Sois réaliste et précis, base-toi sur des portions plausibles pour un repas normal.`;

export async function analyzeMealPhoto(base64Image: string, mimeType: string): Promise<AnalyzedMeal> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "Analyse ce plat et renvoie le JSON demandé.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse IA invalide");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Impossible d'extraire le JSON de la réponse IA");
  }

  const parsed = JSON.parse(jsonMatch[0]) as AnalyzedMeal;
  return parsed;
}
