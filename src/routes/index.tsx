import { createFileRoute } from "@tanstack/react-router";
import { StudentPortal } from "@/components/student-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({ head: () => pageHead("Tutor Socrático", "Aprende estructuras de control con el ciclo socrático de CogniCheck."), component: StudentPortal });