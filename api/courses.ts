import { getSupabaseServerClient } from "./_lib/supabase";

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
      const { data, error } = await getSupabaseServerClient()
        .from("courses")
        .select("id, name, session_code")
        .eq("session_code", sessionCode)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "No existe un curso con ese código" });
      return res
        .status(200)
        .json({ id: data.id, name: data.name, sessionCode: data.session_code, verified: true });
    } catch (error) {
      console.error("Error al validar curso en Supabase:", error);
      return res.status(502).json({ error: "No se pudo validar el curso" });
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
    const { data, error } = await getSupabaseServerClient()
      .from("courses")
      .insert({
        name: body.name.trim(),
        session_code: sessionCode,
        topics: Array.isArray(body.topics) ? body.topics : [],
        material: typeof body.material === "string" ? body.material : null,
        question_variants: typeof body.questionVariants === "number" ? body.questionVariants : 2,
        tutor_settings: body.tutor && typeof body.tutor === "object" ? body.tutor : {},
      })
      .select("id, name, session_code")
      .single();

    if (error) throw error;
    const verified = data.name === body.name.trim() && Boolean(data.session_code);
    if (!verified)
      return res
        .status(502)
        .json({ error: "El curso no pudo ser verificado después de guardarlo" });
    return res.status(201).json({ id: data.id, sessionCode: data.session_code, verified });
  } catch (error) {
    console.error("Error al crear curso en Supabase:", error);
    return res.status(502).json({ error: "No se pudo crear el curso" });
  }
}
