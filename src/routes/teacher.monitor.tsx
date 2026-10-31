import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/monitor")({ head: () => pageHead("Analítica del curso", "Observa la participación y la ganancia de aprendizaje."), component: Monitor });
