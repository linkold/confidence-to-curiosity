import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../api/courses";
import { invokeVercelHandler } from "../../lib/vercel-handler-adapter";

export const Route = createFileRoute("/api/courses")({
  server: {
    handlers: {
      GET: ({ request }) => invokeVercelHandler(handler, request),
      POST: ({ request }) => invokeVercelHandler(handler, request),
    },
  },
});
