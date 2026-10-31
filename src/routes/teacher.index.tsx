import { createFileRoute } from "@tanstack/react-router";
import { Classes } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/")({ head: () => pageHead("Mis Clases", "Gestiona tus sesiones y clases de CogniCheck."), component: Classes });