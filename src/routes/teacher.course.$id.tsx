import { createFileRoute } from "@tanstack/react-router";
import { CourseDashboard } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/course/$id")({ head: () => pageHead("Analítica del curso", "Observa la participación y la ganancia de aprendizaje."), component: CourseDashboard });
