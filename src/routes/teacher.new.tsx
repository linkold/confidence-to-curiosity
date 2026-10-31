import { createFileRoute } from "@tanstack/react-router";
import { NewCourseWizard } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/new")({ head: () => pageHead("Nuevo curso", "Crea una experiencia de aprendizaje con tutor socrático."), component: NewCourseWizard });
