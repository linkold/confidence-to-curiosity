import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/monitor")({ head: () => pageHead("Monitor en Vivo", "Observa el avance de los estudiantes en una sesión simulada de CogniCheck."), component: Monitor });