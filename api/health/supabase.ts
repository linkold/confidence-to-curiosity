import { getSupabaseServerClient } from "../_lib/supabase";

type VercelRequest = { method?: string };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { error } = await getSupabaseServerClient().from("learning_events").select("id").limit(1);
    if (error) throw error;
    return res.status(200).json({ ok: true, service: "supabase" });
  } catch (error) {
    console.error("Error comprobando Supabase:", error);
    return res.status(502).json({ ok: false, service: "supabase" });
  }
}
