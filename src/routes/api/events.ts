import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../api/events";
import { invokeVercelHandler } from "../../lib/vercel-handler-adapter";

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: ({ request }) => invokeVercelHandler(handler, request),
      POST: ({ request }) => invokeVercelHandler(handler, request),
    },
  },
});
