import { getNeonClient } from "./_lib/neon.js";

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
    if (sessionCode === "847291") {
      return res.status(200).json({
        id: "demo-847291",
        sessionCode,
        name: "Fundamentos de programación",
        tutorSettings: {
          tone: "Cercano y exigente",
          language: "Español",
          maxHints: 2,
          model: "openai/gpt-oss-120b",
        },
        verified: true,
        demo: true,
      });
    }
    try {
      const sql = getNeonClient();
      if (!sessionCode) {
        const courses = await sql`
          SELECT c.id::text, c.name, c.session_code AS "sessionCode", c.topics,
            (SELECT COALESCE(jsonb_agg(item.value - 'correct'), '[]'::jsonb)
             FROM jsonb_array_elements(c.questions) AS item(value)) AS questions,
            COALESCE(NULLIF(c.tutor_settings->>'students', '')::int, 0) AS "studentCount",
            c.created_at AS "createdAt"
          FROM courses AS c
          ORDER BY c.created_at DESC
        `;
        return res.status(200).json({ courses });
      }
      const rows = await sql`
        SELECT id::text, name, session_code AS "sessionCode", tutor_settings AS "tutorSettings"
        FROM courses
        WHERE session_code = ${sessionCode}
        LIMIT 1
      `;
      const course = rows[0] as
        | {
            id?: string;
            name?: string;
            sessionCode?: string;
            tutorSettings?: unknown;
          }
        | undefined;
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
        questions?: unknown;
        tutor?: unknown;
      }
    | undefined;
  if (typeof body?.name !== "string" || !body.name.trim())
    return res.status(400).json({ error: "El nombre del curso es obligatorio" });
  if (
    !Array.isArray(body?.topics) ||
    body.topics.length < 3 ||
    body.topics.some((topic) => typeof topic !== "string" || !topic.trim()) ||
    new Set((body.topics as string[]).map((topic) => topic.trim().toLowerCase())).size !==
      body.topics.length
  )
    return res
      .status(400)
      .json({ error: "El curso debe tener un tema central y al menos 2 subtemas" });
  const tutor =
    body.tutor && typeof body.tutor === "object" ? (body.tutor as Record<string, unknown>) : {};
  if (
    typeof tutor["students"] !== "number" ||
    !Number.isInteger(tutor["students"]) ||
    tutor["students"] < 1
  )
    return res.status(400).json({ error: "La cantidad de alumnos debe ser mayor que cero" });
  if (
    typeof body.questionVariants !== "number" ||
    !Number.isInteger(body.questionVariants) ||
    body.questionVariants < 2
  )
    return res
      .status(400)
      .json({ error: "Cada subtema debe tener al menos dos variantes de pregunta" });
  const questions = body.questions;
  if (!Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ error: "Agrega al menos una pregunta antes de publicar" });
  const invalidQuestion = questions.some((item) => {
    if (!item || typeof item !== "object") return true;
    const question = item as Record<string, unknown>;
    const options = question["options"];
    return (
      typeof question["prompt"] !== "string" ||
      !question["prompt"].trim() ||
      typeof question["subtopic"] !== "string" ||
      !(body.topics as unknown[]).slice(1).includes(question["subtopic"]) ||
      !Array.isArray(options) ||
      options.length < 2 ||
      options.some((option) => typeof option !== "string" || !option.trim()) ||
      typeof question["correct"] !== "number" ||
      !Number.isInteger(question["correct"]) ||
      question["correct"] < 0 ||
      question["correct"] >= options.length
    );
  });
  if (invalidQuestion)
    return res
      .status(400)
      .json({ error: "Completa cada pregunta y marca una alternativa correcta" });
  const subtopics = (body.topics as unknown[]).slice(1);
  if (
    subtopics.some(
      (topic) =>
        questions.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            (item as Record<string, unknown>)["subtopic"] === topic,
        ).length < 2,
    )
  ) {
    return res
      .status(400)
      .json({ error: "Cada subtema requiere al menos dos preguntas equivalentes" });
  }
  const minimumVariants = Math.min(
    ...subtopics.map(
      (topic) =>
        questions.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            (item as Record<string, unknown>)["subtopic"] === topic,
        ).length,
    ),
  );
  if (body.questionVariants !== minimumVariants)
    return res
      .status(400)
      .json({ error: "El número de variantes no coincide con el banco de preguntas" });

  try {
    const sessionCode = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
    const sql = getNeonClient();
    const rows = await sql`
      INSERT INTO courses (
        name, session_code, topics, questions, material, question_variants, tutor_settings
      ) VALUES (
        ${body.name.trim()},
        ${sessionCode},
        ${JSON.stringify(body.topics)}::jsonb,
        ${JSON.stringify(questions)}::jsonb,
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
