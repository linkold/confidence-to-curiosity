import { getSupabaseServerClient } from "./_lib/supabase";

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
    const { data, error } = await getSupabaseServerClient()
      .from("learning_events")
      .insert({
        session_code: body.sessionCode,
        event_type: body.eventType,
        alias: typeof body.alias === "string" ? body.alias : null,
        payload: body.payload && typeof body.payload === "object" ? body.payload : {},
      })
      .select("id")
      .single();

    if (error) throw error;
    return res.status(201).json({ id: data.id });
  } catch (error) {
    console.error("Error al guardar evento en Supabase:", error);
    return res.status(502).json({ error: "No se pudo guardar el evento" });
  }
}
