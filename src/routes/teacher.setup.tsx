import { createFileRoute } from "@tanstack/react-router";
import { Setup } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/setup")({ head: () => pageHead("Nuevo curso", "Crea una experiencia de aprendizaje con tutor socrático."), component: Setup });
