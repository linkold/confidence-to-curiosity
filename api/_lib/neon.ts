import { neon } from "@neondatabase/serverless";

export function getNeonClient() {
  const databaseUrl =
    process.env["DATABASE_URL"] ?? process.env["POSTGRES_URL"] ?? process.env["NEON_DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL, POSTGRES_URL o NEON_DATABASE_URL en el entorno");
  }
  return neon(databaseUrl);
}
