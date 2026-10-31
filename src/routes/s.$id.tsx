import { createFileRoute } from "@tanstack/react-router";
import { StudentPortal } from "@/components/student-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/s/$id")({ head: () => pageHead("Aprendizaje del alumno", "Diagnóstico, tutor socrático y validación del aprendizaje en CogniCheck."), component: Session });
function Session() { const { id } = Route.useParams(); return <StudentPortal key={id} sessionId={id} />; }