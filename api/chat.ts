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

const SYSTEM_PROMPT = `Eres un tutor socrático estricto de programación.
Nunca entregues la respuesta directa ni resuelvas el ejercicio por el estudiante.
Guía mediante preguntas, pistas breves y reformulaciones que le hagan razonar.
Si el estudiante pide la respuesta, rechaza amablemente y ofrece una pista.
Responde siempre en español y usa como máximo 60 palabras.`;

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

  const body = req.body as { historial?: unknown } | undefined;
  const historial = Array.isArray(body?.historial) ? body.historial.filter(isChatMessage) : [];

  if (historial.length === 0) {
    return res.status(400).json({ error: "El historial debe contener al menos un mensaje válido" });
  }

  try {
    const groq = new Groq({ apiKey: groqApiKey });
    const completion = await groq.chat.completions.create({
      model: process.env["GROQ_MODEL"] ?? "openai/gpt-oss-120b",
      temperature: 0.4,
      max_tokens: 120,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...historial.slice(-12)],
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
