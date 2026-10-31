import { createFileRoute } from "@tanstack/react-router";
import { TeacherLayout } from "@/components/teacher-portal";
export const Route = createFileRoute("/teacher")({ component: TeacherLayout });