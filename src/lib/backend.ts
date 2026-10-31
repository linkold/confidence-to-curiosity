type EventInput = {
  sessionCode: string;
  eventType: string;
  alias?: string;
  payload?: Record<string, unknown>;
};

async function readJson<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  if (!contentType.includes("application/json")) {
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

export async function verifyCourseSession(sessionCode: string) {
  const response = await fetch(
    `/api/courses?sessionCode=${encodeURIComponent(sessionCode.trim())}`,
  );
  const data = await readJson<{
    id?: string;
    name?: string;
    sessionCode?: string;
    verified?: boolean;
    error?: string;
  }>(response);
  if (!response.ok || !data.id || !data.name || data.verified !== true) {
    throw new Error(data.error ?? "No se pudo verificar el código del curso");
  }
  return data as { id: string; name: string; sessionCode: string; verified: true; demo?: boolean };
}
