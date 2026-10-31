type HandlerRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

type HandlerResponse = {
  status: (code: number) => HandlerResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => HandlerResponse;
};

/** Adapts the Vercel-style handlers in /api to TanStack Start's server routes. */
export async function invokeVercelHandler(handler: unknown, request: Request) {
  const method = request.method.toUpperCase();
  let body: unknown;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "El cuerpo de la solicitud debe ser JSON válido" },
        { status: 400 },
      );
    }
  }

  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const vercelRequest: HandlerRequest = { method, body, query };
  let statusCode = 200;
  let responseBody: unknown;
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  const vercelResponse: HandlerResponse = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(value) {
      responseBody = value;
    },
    setHeader(name, value) {
      headers.set(name, value);
      return this;
    },
  };

  await (handler as (req: HandlerRequest, res: HandlerResponse) => Promise<unknown>)(
    vercelRequest,
    vercelResponse,
  );
  return new Response(JSON.stringify(responseBody ?? {}), { status: statusCode, headers });
}
