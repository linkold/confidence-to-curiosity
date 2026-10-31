import { Link } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import type { ReactNode } from "react";

export function PortalShell({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-background text-muted-foreground">
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-foreground"><BrainCircuit className="size-7 text-primary" />CogniCheck</Link>
      </div>
    </header>
    <div className="flex-1">{children}</div>
  </div>;
}
