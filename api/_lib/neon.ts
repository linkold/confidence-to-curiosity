import { neon } from "@neondatabase/serverless";

export function getNeonClient() {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL en el entorno");
  }
  return neon(databaseUrl);
}
