import { getNeonClient } from "./_lib/neon";

type VercelRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const rawCode = req.query?.["sessionCode"];
    const sessionCode = (Array.isArray(rawCode) ? rawCode[0] : rawCode)?.trim().toUpperCase();
    if (!sessionCode) return res.status(400).json({ error: "El código de sesión es obligatorio" });
    if (sessionCode === "847291") {
      return res.status(200).json({
        id: "demo-847291",
        sessionCode,
        name: "Fundamentos de programación",
        verified: true,
        demo: true,
      });
    }
    try {
      const sql = getNeonClient();
      const rows = await sql`
        SELECT id::text, name, session_code AS "sessionCode"
        FROM courses
        WHERE session_code = ${sessionCode}
        LIMIT 1
      `;
      const course = rows[0] as { id?: string; name?: string; sessionCode?: string } | undefined;
      if (!course) return res.status(404).json({ error: "No existe un curso con ese código" });
      return res.status(200).json({ ...course, verified: true });
    } catch (error) {
      console.error("Error al validar curso en Neon:", error);
      const databaseError = error as { code?: string };
      return res.status(502).json({
        error:
          databaseError.code === "42P01"
            ? "Faltan las tablas de Neon. Ejecuta neon/schema.sql"
            : "No se pudo validar el curso en Neon",
        code: databaseError.code ?? "NEON_ERROR",
      });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const body = req.body as
    | {
        name?: unknown;
        topics?: unknown;
        material?: unknown;
        questionVariants?: unknown;
        tutor?: unknown;
      }
    | undefined;
  if (typeof body?.name !== "string" || !body.name.trim())
    return res.status(400).json({ error: "El nombre del curso es obligatorio" });
  if (!Array.isArray(body?.topics) || body.topics.length < 3)
    return res
      .status(400)
      .json({ error: "El curso debe tener un tema central y al menos 2 subtemas" });
  const tutor =
    body.tutor && typeof body.tutor === "object" ? (body.tutor as Record<string, unknown>) : {};
  if (typeof tutor["students"] !== "number" || tutor["students"] < 1)
    return res.status(400).json({ error: "La cantidad de alumnos debe ser mayor que cero" });

  try {
    const sessionCode = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
    const sql = getNeonClient();
    const rows = await sql`
      INSERT INTO courses (
        name, session_code, topics, material, question_variants, tutor_settings
      ) VALUES (
        ${body.name.trim()},
        ${sessionCode},
        ${JSON.stringify(body.topics)}::jsonb,
        ${typeof body.material === "string" ? body.material : null},
        ${typeof body.questionVariants === "number" ? body.questionVariants : 2},
        ${JSON.stringify(body.tutor && typeof body.tutor === "object" ? body.tutor : {})}::jsonb
      )
      RETURNING id::text, name, session_code AS "sessionCode"
    `;
    const data = rows[0] as { id?: string; name?: string; sessionCode?: string } | undefined;
    const verified = data?.name === body.name.trim() && Boolean(data?.id && data?.sessionCode);
    if (!verified)
      return res
        .status(502)
        .json({ error: "El curso no pudo ser verificado después de guardarlo" });
    return res.status(201).json({ id: data?.id, sessionCode: data?.sessionCode, verified });
  } catch (error) {
    console.error("Error al crear curso en Neon:", error);
    const databaseError = error as { code?: string };
    return res.status(502).json({
      error:
        databaseError.code === "42P01"
          ? "Faltan las tablas de Neon. Ejecuta neon/schema.sql"
          : "No se pudo crear el curso en Neon",
      code: databaseError.code ?? "NEON_ERROR",
    });
  }
}
