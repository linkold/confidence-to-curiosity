import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/home")({ head: () => pageHead("Inicio", "Selecciona tu acceso a CogniCheck."), component: HomePage });
