import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../../api/health/neon";
import { invokeVercelHandler } from "../../../lib/vercel-handler-adapter";

export const Route = createFileRoute("/api/health/neon")({
  server: {
    handlers: {
      GET: ({ request }) => invokeVercelHandler(handler, request),
    },
  },
});
