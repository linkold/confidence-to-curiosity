type EventInput = {
  sessionCode: string;
  eventType: string;
  alias?: string;
  payload?: Record<string, unknown>;
};

export type CourseActivityEvent = {
  id: string;
  eventType: "student_state" | "pre_test_submitted" | "post_test_answer";
  alias: string | null;
  payload: {
    studentId?: string;
    state?: string;
    elapsedMs?: number;
    phase?: string;
    questionIndex?: number;
    questionPrompt?: string;
    correct?: boolean | null;
  };
  createdAt: string;
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
        `La API respondió ${response.status} sin JSON. Revisa los logs de Vercel; al cargar cursos, comprueba DATABASE_URL/POSTGRES_URL y el esquema de Neon.`,
      );
    }
    throw new Error(
      "La API no está disponible. Ejecuta el proyecto con `vercel dev` para activar las funciones /api.",
    );
  }
  let data: T & { error?: unknown };
  try {
    data = JSON.parse(body) as T & { error?: unknown };
  } catch {
    if (!response.ok) {
      throw new Error(
        `La API respondió ${response.status}. Revisa la configuración de Neon y los logs de Vercel.`,
      );
    }
    throw new Error("La API devolvió una respuesta inválida. Revisa la configuración del backend.");
  }
  if (!response.ok && typeof data.error === "string") throw new Error(data.error);
  return data;
}

export async function recordLearningEvent(event: EventInput) {
  let studentId: string | null = null;
  if (typeof window !== "undefined") {
    studentId = window.sessionStorage.getItem("cognicheck:student-id");
  }
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...event,
      payload: { ...event.payload, ...(studentId ? { studentId } : {}) },
    }),
  });
  if (!response.ok) throw new Error("No se pudo registrar el evento");
  return readJson<{ id: number }>(response);
}

export async function getCourseActivity(sessionCode: string) {
  const response = await fetch(`/api/events?sessionCode=${encodeURIComponent(sessionCode.trim())}`);
  const data = await readJson<{ events?: CourseActivityEvent[]; error?: string }>(response);
  if (!response.ok || !Array.isArray(data.events)) {
    throw new Error(data.error ?? "No se pudo cargar la actividad del curso");
  }
  return data.events;
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
