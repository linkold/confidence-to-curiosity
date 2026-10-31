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
  const data = (await response.json()) as { id?: string; sessionCode?: string; error?: string };
  if (!response.ok || !data.id) throw new Error(data.error ?? "No se pudo crear el curso");
  return data as { id: string; sessionCode: string };
}
