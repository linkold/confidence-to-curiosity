import Groq from "groq-sdk";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => VercelResponse;
};

const TONES = ["Cercano y exigente", "Formal y académico", "Motivador"] as const;

const groqApiKey = process.env["GROQ_API_KEY"] ?? process.env["GROQ_API"];

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message["role"] === "user" || message["role"] === "assistant") &&
    typeof message["content"] === "string" &&
    message["content"].trim().length > 0
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!groqApiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY (o GROQ_API) no está configurada" });
  }

  const body = req.body as { historial?: unknown; tone?: unknown; language?: unknown } | undefined;
  const historial = Array.isArray(body?.historial) ? body.historial.filter(isChatMessage) : [];

  if (historial.length === 0) {
    return res.status(400).json({ error: "El historial debe contener al menos un mensaje válido" });
  }

  try {
    const tone = TONES.find((option) => option === body?.tone) ?? TONES[0];
    const language = body?.language === "English" ? "English" : "Spanish";
    const systemPrompt = `You are a strict Socratic programming tutor. Never give the direct answer or solve the exercise. Guide the student with brief questions, hints, and reformulations that make them reason. If asked for the answer, politely refuse and offer a hint. Use a ${tone} tone. Respond in ${language} and use no more than 60 words.`;
    const groq = new Groq({ apiKey: groqApiKey });
    const completion = await groq.chat.completions.create({
      model: process.env["GROQ_MODEL"] ?? "openai/gpt-oss-120b",
      temperature: 0.4,
      max_tokens: 120,
      messages: [{ role: "system", content: systemPrompt }, ...historial.slice(-12)],
    });

    const respuesta = completion.choices[0]?.message?.content?.trim();
    if (!respuesta) {
      return res.status(502).json({ error: "Groq no devolvió una respuesta" });
    }

    return res.status(200).json({ respuesta });
  } catch (error) {
    console.error("Error al consultar Groq:", error);
    const message = error instanceof Error ? error.message : "";
    const modelUnavailable = /model|not.?found|access|permission/i.test(message);
    return res.status(modelUnavailable ? 503 : 502).json({
      error: modelUnavailable
        ? "El modelo del tutor socrático no está disponible por el momento"
        : "No se pudo consultar el tutor socrático",
    });
  }
}
