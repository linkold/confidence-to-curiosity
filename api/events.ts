import { getNeonClient } from "./_lib/neon.js";

type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const body = req.body as
    { sessionCode?: unknown; eventType?: unknown; alias?: unknown; payload?: unknown } | undefined;
  if (typeof body?.sessionCode !== "string" || typeof body.eventType !== "string") {
    return res.status(400).json({ error: "sessionCode y eventType son obligatorios" });
  }

  try {
    const sql = getNeonClient();
    const rows = await sql`
      INSERT INTO public.learning_events (session_code, event_type, alias, payload)
      VALUES (
        ${body.sessionCode},
        ${body.eventType},
        ${typeof body.alias === "string" ? body.alias : null},
        ${JSON.stringify(body.payload && typeof body.payload === "object" ? body.payload : {})}::jsonb
      )
      RETURNING id
    `;
    const id = Number((rows[0] as { id?: string | number } | undefined)?.id);
    if (!Number.isFinite(id)) throw new Error("Neon no devolvió el id del evento");
    return res.status(201).json({ id });
  } catch (error) {
    console.error("Error al guardar evento en Neon:", error);
    const databaseError = error as { code?: string };
    return res.status(502).json({
      error:
        databaseError.code === "42P01"
          ? "Faltan las tablas de Neon. Ejecuta neon/schema.sql"
          : "No se pudo guardar el evento en Neon",
      code: databaseError.code ?? "NEON_ERROR",
    });
  }
}
