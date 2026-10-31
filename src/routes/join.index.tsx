import { createFileRoute } from "@tanstack/react-router";
import { StudentPortal } from "@/components/student-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/join/")({ head: () => pageHead("Unirse a la sesión", "Entra a tu sesión de aprendizaje socrático de CogniCheck."), component: StudentPortal });