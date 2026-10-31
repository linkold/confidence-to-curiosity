import { Link, Outlet } from "@tanstack/react-router";
import { Activity, ArrowRight, BookOpen, CheckCircle2, Copy, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrototype } from "@/lib/prototype";

export function TeacherLayout() {
  return <div className="mx-auto grid max-w-7xl md:min-h-[720px] md:grid-cols-[220px_1fr]">
    <aside className="border-b border-border px-5 py-6 md:border-r md:border-b-0 md:py-9">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portal del Profesor</p>
      <nav aria-label="Profesor" className="flex gap-2 overflow-x-auto md:flex-col">
        {([{ to: "/teacher", label: "Mis Clases", icon: BookOpen }, { to: "/teacher/setup", label: "Configurar Clase", icon: SlidersHorizontal }, { to: "/teacher/monitor", label: "Monitor en Vivo", icon: Activity }] as const).map(({to, label, icon: Icon}) => <Button asChild variant="ghost" key={to} className="justify-start"><Link to={to} activeOptions={{exact:true}} activeProps={{className:"bg-accent text-primary"}}><Icon />{label}</Link></Button>)}
      </nav>
    </aside>
    <main className="min-w-0 px-5 py-8 sm:px-9"><Outlet /></main>
  </div>;
}

export function Classes() {
  const { config, generated } = usePrototype();
  return <section>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold text-foreground">Mis Clases</h1><Button asChild><Link to="/teacher/setup"><SlidersHorizontal />Configurar Clase</Link></Button></div>
    <article className="max-w-xl rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between"><BookOpen className="size-8 text-primary" /><span className="text-sm text-success">{generated ? "Clase generada" : "Clase de prueba"}</span></div>
      <h2 className="mt-6 text-xl font-semibold text-foreground">{config.topic}</h2>
      <p className="mt-2 text-sm">Sesión 847291</p>
      <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/teacher/monitor"><Activity />Monitor en Vivo</Link></Button><Button asChild variant="ghost"><Link to="/join/$id" params={{id:"847291"}}>Unirse<ArrowRight /></Link></Button></div>
    </article>
  </section>;
}

export function Setup() {
  const { config, setConfig, generated, setGenerated, setStatus } = usePrototype();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const generate = () => { setGenerated(true); setSaved(true); setStatus("Backend: Clase guardada en Supabase DB (simulado)."); };
  return <section className="max-w-2xl">
    <h1 className="text-3xl font-bold text-foreground">Configurar Clase</h1>
    <form className="mt-8 space-y-8" onSubmit={(e) => {e.preventDefault(); generate();}}>
      <div><label htmlFor="topic" className="text-sm font-medium text-foreground">Tema</label><input id="topic" required value={config.topic} onChange={(e) => {setConfig({...config, topic:e.target.value}); setSaved(false);}} className="mt-3 w-full rounded-lg border border-input bg-card px-4 py-3 text-foreground outline-none focus:border-primary" /></div>
      <div className="border-t border-border pt-6"><h2 className="mb-6 flex items-center gap-2 font-semibold text-foreground"><Sparkles className="size-4 text-primary" />Configuración IA</h2>
        {([{key:"rigor",label:"Rigurosidad Socrática"},{key:"friction",label:"Fricción permitida"}] as const).map(({key,label}) => <div key={key} className="mb-6"><div className="flex justify-between gap-3"><label htmlFor={key}>{label}</label><output className="text-primary">{config[key]}/5</output></div><input id={key} type="range" min={1} max={5} value={config[key]} onChange={(e) => {setConfig({...config,[key]:Number(e.target.value)});setSaved(false);}} className="mt-3 w-full accent-primary" /></div>)}
      </div>
      <Button type="submit" className="h-auto px-6 py-3"><Sparkles />Generar Clase</Button>
    </form>
    {saved && <div role="status" className="mt-6 flex items-center gap-2 text-success"><CheckCircle2 className="size-5" />Guardado en Supabase DB</div>}
    {generated && <div className="mt-6 border-t border-border pt-6"><p className="mb-3 text-sm">Enlace de la sesión</p><div className="flex items-center gap-3"><Link to="/join/$id" params={{id:"847291"}} className="min-w-0 break-all text-primary underline underline-offset-4">cognicheck.app/join/847291</Link><Button variant="outline" size="icon" aria-label="Copiar enlace" title="Copiar enlace" onClick={async () => {try {await navigator.clipboard.writeText(`${window.location.origin}/join/847291`);setCopied(true);setCopyError(false);} catch {setCopyError(true);}}}>{copied ? <CheckCircle2 /> : <Copy />}</Button></div>{copied && <p role="status" className="mt-2 text-sm text-success">Enlace copiado</p>}{copyError && <p role="alert" className="mt-2 text-sm text-destructive">No se pudo copiar el enlace.</p>}</div>}
  </section>;
}

export function Monitor() {
  const { config, student } = usePrototype();
  return <section>
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold text-foreground">Monitor en Vivo</h1><span className="flex items-center gap-2 text-sm text-success"><span className="size-2 rounded-full bg-success motion-safe:animate-pulse" />Supabase Realtime Activo<span className="text-muted-foreground">· Simulación</span></span></div>
    <p className="mt-3">{config.topic} · Sesión 847291</p>
    <div className="my-8 grid gap-4 sm:grid-cols-3">{[{value:"85%",label:"Fallo Pre-Test",icon:Users},{value:"2.4",label:"Pistas Promedio",icon:Sparkles},{value:"92%",label:"Conversión",icon:CheckCircle2}].map(({value,label,icon:Icon}) => <article key={label} className="rounded-lg border border-border bg-card p-5"><Icon className="mb-4 size-5 text-primary" /><p className={`text-3xl font-bold ${label === "Conversión" ? "text-success" : "text-foreground"}`}>{value}</p><p className="mt-2 text-sm">{label}</p></article>)}</div>
    <h2 className="mb-4 text-lg font-semibold text-foreground">Estudiantes en la sesión</h2>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-border text-muted-foreground"><tr><th className="py-4 pr-4 font-medium">Estudiante</th><th className="py-4 font-medium">Estado</th></tr></thead><tbody>
      <tr className="border-b border-border"><td className="py-5 pr-4 text-foreground">Alumno anónimo</td><td className="text-success">Validado</td></tr>
      <tr className="border-b border-border"><td className="py-5 pr-4 text-foreground">Alumno B</td><td className="text-destructive">Atascado</td></tr>
      {student && <tr className="border-b border-border"><td className="py-5 pr-4 text-foreground">{student.alias}</td><td className={student.validated ? "text-success" : "text-primary"}>{student.validated ? "Validado" : "En proceso"}</td></tr>}
    </tbody></table></div>
  </section>;
}