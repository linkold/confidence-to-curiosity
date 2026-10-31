import { createFileRoute } from "@tanstack/react-router";
import { Setup } from "@/components/teacher-portal";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/teacher/setup")({ head: () => pageHead("Configurar Clase", "Ajusta el tema, la rigurosidad socrática y la fricción de tu clase."), component: Setup });