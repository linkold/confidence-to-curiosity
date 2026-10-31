import { getSupabaseServerClient } from "./_lib/supabase";

type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      .select("id, session_code")
      .single();

    if (error) throw error;
    return res.status(201).json({ id: data.id, sessionCode: data.session_code });
  } catch (error) {
    console.error("Error al crear curso en Supabase:", error);
    return res.status(502).json({ error: "No se pudo crear el curso" });
  }
}
