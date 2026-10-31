import { createFileRoute } from "@tanstack/react-router";
import handler from "../../../api/chat";
import { invokeVercelHandler } from "../../lib/vercel-handler-adapter";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }) => invokeVercelHandler(handler, request),
    },
  },
});
