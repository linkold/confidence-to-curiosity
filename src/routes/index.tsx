import { createFileRoute } from "@tanstack/react-router";
import { StudentJoin } from "@/components/student-join";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({ head: () => pageHead("CogniCheck", "Únete a una experiencia de aprendizaje con tutor socrático."), component: StudentJoin });
