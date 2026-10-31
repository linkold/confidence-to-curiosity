import { Link, useLocation } from "@tanstack/react-router";
import { BrainCircuit, GraduationCap, User, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrototype } from "@/lib/prototype";
import type { ReactNode } from "react";

export function PortalShell({ children }: { children: ReactNode }) {
  const teacher = useLocation().pathname.startsWith("/teacher");
  const { status } = usePrototype();
  return <div className="flex min-h-screen flex-col bg-background text-muted-foreground">
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-foreground"><BrainCircuit className="size-7 text-primary" />CogniCheck</Link>
        <nav aria-label="Vista del portal" className="flex gap-1 rounded-lg border border-border p-1">
          <Button asChild variant={teacher ? "default" : "ghost"} className="h-auto whitespace-normal px-3 py-2"><Link to="/teacher" aria-current={teacher ? "page" : undefined}><GraduationCap />Vista Profesor</Link></Button>
          <Button asChild variant={!teacher ? "default" : "ghost"} className="h-auto whitespace-normal px-3 py-2"><Link to="/join" aria-current={!teacher ? "page" : undefined}><User />Vista Alumno</Link></Button>
        </nav>
      </div>
    </header>
    <div className="flex-1">{children}</div>
    <footer className="border-t border-border bg-card px-5 py-3 text-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2"><span className="flex items-center gap-2 text-primary"><Terminal className="size-3.5" />Simulación</span><span role="status" aria-live="polite">{status}</span></div>
    </footer>
  </div>;
}