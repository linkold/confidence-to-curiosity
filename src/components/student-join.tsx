import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentJoin() {
  const navigate = useNavigate();
  const [session, setSession] = useState("");
  const [name, setName] = useState("");
  return (
    <section className="mx-auto max-w-xl px-5 py-12">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-10">
        <p className="text-sm text-primary">Acceso del alumno</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Únete a tu sesión</h1>
        <p className="mt-3">Ingresa el código que te compartió tu profesor.</p>
        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (session.trim() && name.trim()) {
              if (typeof window !== "undefined")
                sessionStorage.setItem("cognicheck:student-name", name.trim());
              navigate({ to: "/s/$id", params: { id: session.trim() } });
            }
          }}
        >
          <div>
            <label htmlFor="session-code" className="text-sm font-medium text-foreground">
              Código de sesión
            </label>
            <input
              id="session-code"
              required
              value={session}
              onChange={(event) => setSession(event.target.value)}
              placeholder="Ej. 847291"
              className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="student-name" className="text-sm font-medium text-foreground">
              Nombre
            </label>
            <input
              id="student-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 rounded-lg border border-primary/30 bg-accent p-4 text-sm">
            <LockKeyhole className="size-5 shrink-0 text-primary" />
            <p>Antes de comenzar te explicaremos qué datos de aprendizaje se registran.</p>
          </div>
          <Button type="submit" className="w-full">
            Continuar <ArrowRight />
          </Button>
        </form>
      </div>
    </section>
  );
}
