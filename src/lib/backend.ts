type EventInput = {
  sessionCode: string;
  eventType: string;
  alias?: string;
  payload?: Record<string, unknown>;
};

export async function recordLearningEvent(event: EventInput) {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!response.ok) throw new Error("No se pudo registrar el evento");
  return response.json() as Promise<{ id: number }>;
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
  const data = (await response.json()) as {
    id?: string;
    sessionCode?: string;
    verified?: boolean;
    error?: string;
  };
  if (!response.ok || !data.id || !data.sessionCode || data.verified !== true) {
    throw new Error(data.error ?? "No se pudo verificar el curso creado");
  }
  return data as { id: string; sessionCode: string; verified: true };
}

export async function verifyCourseSession(sessionCode: string) {
  const response = await fetch(
    `/api/courses?sessionCode=${encodeURIComponent(sessionCode.trim())}`,
  );
  const data = (await response.json()) as {
    id?: string;
    name?: string;
    sessionCode?: string;
    verified?: boolean;
    error?: string;
  };
  if (!response.ok || !data.id || !data.name || data.verified !== true) {
    throw new Error(data.error ?? "No se pudo verificar el código del curso");
  }
  return data as { id: string; name: string; sessionCode: string; verified: true; demo?: boolean };
}
