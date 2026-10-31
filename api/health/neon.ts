import { getNeonClient } from "../_lib/neon";

type VercelRequest = { method?: string };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  try {
    const sql = getNeonClient();
    await Promise.all([
      sql`SELECT id FROM courses LIMIT 1`,
      sql`SELECT id FROM learning_events LIMIT 1`,
    ]);
    return res.status(200).json({
      ok: true,
      service: "neon",
      checks: { courses: true, learningEvents: true },
    });
  } catch (error) {
    console.error("Error comprobando Neon:", error);
    const databaseError = error as { code?: string };
    return res.status(502).json({
      ok: false,
      service: "neon",
      error:
        databaseError.code === "42P01"
          ? "Faltan las tablas de Neon. Ejecuta neon/schema.sql en la base de datos correcta"
          : error instanceof Error
            ? error.message
            : "No se pudo conectar con Neon",
      code: databaseError.code ?? "NEON_ERROR",
    });
  }
}
