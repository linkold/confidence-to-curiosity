type EventInput = {
  sessionCode: string;
  eventType: string;
  alias?: string;
  payload?: Record<string, unknown>;
};

export type CourseQuestion = {
  prompt: string;
  subtopic: string;
  options: string[];
  correct: number;
};
export type CourseRecord = {
  id: string;
  name: string;
  sessionCode: string;
  topics: string[];
  questions: Omit<CourseQuestion, "correct">[];
  studentCount: number;
  createdAt?: string;
};
export type TutorSettings = {
  tone: string;
  language: string;
  maxHints: number;
  model: string;
};

async function readJson<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  if (!contentType.includes("application/json")) {
    if (
      response.status === 401 ||
      response.status === 403 ||
      body.includes("Protected by Vercel Authentication")
    ) {
      throw new Error(
        "La API está protegida por Vercel Authentication. Desactiva Deployment Protection para este deployment o usa el dominio de producción autorizado.",
      );
    }
    if (response.status >= 500) {
      throw new Error(
        `La función /api respondió ${response.status}. Revisa los logs de Vercel y verifica DATABASE_URL (o POSTGRES_URL) y GROQ_API_KEY.`,
      );
    }
    throw new Error(
      "La API no está disponible. Ejecuta el proyecto con `vercel dev` para activar las funciones /api.",
    );
  }
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error("La API devolvió una respuesta inválida. Revisa la configuración del backend.");
  }
}

export async function recordLearningEvent(event: EventInput) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error("No se pudo registrar el evento");
  return readJson<{ id: number }>(response);
}

export async function createCourse(course: {
  name: string;
  topics: string[];
  material: string;
  questionVariants: number;
  questions: CourseQuestion[];
  tutor: Record<string, unknown>;
}) {
  const response = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
  const data = await readJson<{
    id?: string;
    sessionCode?: string;
    verified?: boolean;
    error?: string;
  }>(response);
  if (!response.ok || !data.id || !data.sessionCode || data.verified !== true) {
    throw new Error(data.error ?? "No se pudo verificar el curso creado");
  }
  return data as { id: string; sessionCode: string; verified: true };
}

export async function listCourses() {
  const response = await fetch("/api/courses");
  const data = await readJson<{ courses?: CourseRecord[]; error?: string }>(response);
  if (!response.ok || !Array.isArray(data.courses)) {
    throw new Error(data.error ?? "No se pudieron cargar los cursos");
  }
  return data.courses;
}

export async function verifyCourseSession(sessionCode: string) {
  const response = await fetch(
    `/api/courses?sessionCode=${encodeURIComponent(sessionCode.trim())}`,
  );
  const data = await readJson<{
    id?: string;
    name?: string;
    sessionCode?: string;
    verified?: boolean;
    tutorSettings?: TutorSettings;
    error?: string;
  }>(response);
  if (!response.ok || !data.id || !data.name || data.verified !== true) {
    throw new Error(data.error ?? "No se pudo verificar el código del curso");
  }
  return data as {
    id: string;
    name: string;
    sessionCode: string;
    verified: true;
    demo?: boolean;
    tutorSettings?: TutorSettings;
  };
}
