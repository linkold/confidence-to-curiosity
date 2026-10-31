import { createFileRoute } from "@tanstack/react-router";
import { StudentPortal } from "@/components/student-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/join/$id")({ head: () => pageHead("Sesión de clase", "Participa en una clase de CogniCheck y valida tu aprendizaje."), component: Session });
function Session() { const { id } = Route.useParams(); return <StudentPortal key={id} sessionId={id} />; }