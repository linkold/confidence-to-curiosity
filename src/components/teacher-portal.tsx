import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, BarChart3, BookOpen, CheckCircle2, FileQuestion, Lightbulb, ListTree, Plus, QrCode, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrototype } from "@/lib/prototype";
import { createCourse } from "@/lib/backend";

const WIZARD_STEPS = ["Curso y temas", "Material", "Preguntas", "Tutor", "Publicar"];

export function TeacherLayout() {
  return <div className="mx-auto grid max-w-7xl md:min-h-[720px] md:grid-cols-[240px_minmax(0,1fr)]">
    <aside className="min-w-0 border-b border-border px-5 py-6 md:border-r md:border-b-0 md:py-9">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portal del Profesor</p>
      <nav aria-label="Profesor" className="flex flex-wrap gap-2 md:flex-col">
        {([
          { to: "/teacher", label: "Cursos", icon: BookOpen },
          { to: "/teacher/new", label: "Nuevo curso", icon: Plus },
        ] as const).map(({ to, label, icon: Icon }) => <Button asChild variant="ghost" key={to} className="justify-start"><Link to={to} activeOptions={{ exact: true }} activeProps={{ className: "bg-accent text-primary" }}><Icon />{label}</Link></Button>)}
        <Button asChild variant="ghost" className="justify-start"><Link to="/teacher/course/$id" params={{ id: "847291" }} activeOptions={{ exact: true }} activeProps={{ className: "bg-accent text-primary" }}><BarChart3 />Analítica del curso</Link></Button>
      </nav>
    </aside>
    <main className="min-w-0 px-5 py-8 sm:px-9"><Outlet /></main>
  </div>;
}

export function Classes() {
  const { config, generated } = usePrototype();
  return <section>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-primary">Espacio del profesor</p><h1 className="mt-1 text-3xl font-bold text-foreground">Mis cursos</h1></div><Button asChild><Link to="/teacher/new"><Plus />Crear curso</Link></Button></div>
    <article className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-4"><BookOpen className="mt-1 size-8 text-primary" /><div><h2 className="text-xl font-semibold text-foreground">{config.topic}</h2><p className="mt-2 text-sm">Curso de estructuras de control · 4 subtemas</p></div></div><span className="rounded-full bg-success/10 px-3 py-1 text-sm text-success">{generated ? "Publicado" : "Borrador"}</span></div>
      <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/teacher/course/$id" params={{ id: "847291" }}>Ver curso <ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/teacher/new"><Settings2 />Editar configuración</Link></Button></div>
    </article>
  </section>;
}

export function NewCourseWizard() {
  const { config, setConfig, setGenerated } = usePrototype();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [material, setMaterial] = useState("");
  const [topics, setTopics] = useState(["Condiciones", "Bucle for", "Bucle while", "Control de salida"]);
  const [questionCount, setQuestionCount] = useState(2);
  const [language, setLanguage] = useState("Español");
  const [tone, setTone] = useState("Cercano y exigente");
  const [publishing, setPublishing] = useState(false);

  const next = async () => {
    if (step === WIZARD_STEPS.length - 1) {
      setPublishing(true);
      try {
        const course = await createCourse({ name: config.topic, topics, material, questionVariants: questionCount, tutor: { tone, language, maxHints: config.friction } });
        setGenerated(true);
        navigate({ to: "/teacher/course/$id", params: { id: course.id } });
      } catch (error) {
        console.error("No se pudo publicar el curso:", error);
      } finally {
        setPublishing(false);
      }
      return;
    }
    setStep((current) => current + 1);
  };
  const suggestTopics = () => setTopics(["Variables y condiciones", "Bucle for", "Bucle while", "Patrones de salida"]);

  return <section className="max-w-3xl">
    <p className="text-sm text-primary">Nuevo curso</p><h1 className="mt-1 text-3xl font-bold text-foreground">Crear experiencia de aprendizaje</h1>
    <div className="mt-8 grid grid-cols-5 gap-2" aria-label="Pasos del asistente">{WIZARD_STEPS.map((label, index) => <div key={label} className="space-y-2"><div className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`} /><span className={`text-xs ${index === step ? "text-foreground" : "text-muted-foreground"}`}>{index + 1}. {label}</span></div>)}</div>
    <div className="mt-10 rounded-lg border border-border bg-card p-6 sm:p-8">
      {step === 0 && <div className="space-y-6"><div><label htmlFor="course-topic" className="text-sm font-medium text-foreground">Nombre del curso</label><input id="course-topic" value={config.topic} onChange={(e) => setConfig({ ...config, topic: e.target.value })} className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" /></div><div><div className="flex items-center justify-between gap-4"><label className="text-sm font-medium text-foreground">Temas y subtemas</label><Button type="button" variant="outline" onClick={suggestTopics}><Sparkles />Proponer árbol con IA</Button></div><div className="mt-3 space-y-2">{topics.map((topic, index) => <div key={topic} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground"><ListTree className="size-4 text-primary" />{index + 1}. {topic}</div>)}</div></div></div>}
      {step === 1 && <div className="space-y-6"><div><h2 className="text-xl font-semibold text-foreground">Material de referencia</h2><p className="mt-2 text-sm">Sube un PDF o pega el programa para que las preguntas se basen en tu contenido.</p></div><label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-accent/40 p-8 text-center"><BookOpen className="size-8 text-primary" /><span className="mt-3 font-medium text-foreground">Seleccionar PDF</span><span className="mt-1 text-xs">PDF hasta 10 MB</span><input type="file" accept="application/pdf" className="sr-only" /></label><textarea value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="O pega aquí el material de referencia..." className="min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" /></div>}
      {step === 2 && <div className="space-y-6"><div><h2 className="text-xl font-semibold text-foreground">Banco de preguntas</h2><p className="mt-2 text-sm">Genera variantes equivalentes por subtema y aprueba o edita cada una antes de publicar.</p></div><div className="flex items-center justify-between rounded-lg border border-border p-4"><div><p className="font-medium text-foreground">Variantes por subtema</p><p className="text-sm">Mínimo recomendado: 2</p></div><input type="number" min={2} max={5} value={questionCount} onChange={(e) => setQuestionCount(Math.max(2, Number(e.target.value)))} className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-center text-foreground" /></div><Button type="button" variant="outline"><Sparkles />Generar banco de preguntas</Button><div className="space-y-3">{topics.slice(0, 3).map((topic) => <div key={topic} className="flex items-center justify-between rounded-lg border border-border p-4"><span className="text-foreground">{topic}</span><span className="flex items-center gap-1 text-sm text-success"><CheckCircle2 className="size-4" />{questionCount} variantes</span></div>)}</div></div>}
      {step === 3 && <div className="space-y-6"><div><h2 className="text-xl font-semibold text-foreground">Ajustes del tutor socrático</h2><p className="mt-2 text-sm">Define cómo acompañará la IA a tus alumnos.</p></div><div><label htmlFor="tone" className="text-sm font-medium text-foreground">Tono</label><select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"><option>Cercano y exigente</option><option>Formal y académico</option><option>Motivador</option></select></div><div><label htmlFor="language" className="text-sm font-medium text-foreground">Idioma</label><select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"><option>Español</option><option>English</option></select></div><div><div className="flex justify-between"><label htmlFor="hints" className="text-sm font-medium text-foreground">Número máximo de pistas</label><output className="text-primary">{config.friction}</output></div><input id="hints" type="range" min={1} max={5} value={config.friction} onChange={(e) => setConfig({ ...config, friction: Number(e.target.value) })} className="mt-3 w-full accent-primary" /></div></div>}
      {step === 4 && <div className="space-y-6"><div><h2 className="text-xl font-semibold text-foreground">Publicar curso</h2><p className="mt-2 text-sm">Revisa la configuración y comparte el acceso con tus alumnos.</p></div><div className="rounded-lg border border-border bg-background p-5"><p className="text-sm text-muted-foreground">Curso</p><p className="mt-1 text-xl font-semibold text-foreground">{config.topic}</p><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><span>{topics.length} subtemas</span><span>{questionCount} variantes por subtema</span><span>{tone} · {language}</span></div></div><div className="flex gap-3 rounded-lg border border-primary/30 bg-accent p-4"><QrCode className="size-5 shrink-0 text-primary" /><p className="text-sm text-foreground">Al publicar se generará un código de acceso y un QR para la sesión.</p></div></div>}
      <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6"><Button type="button" variant="ghost" disabled={step === 0 || publishing} onClick={() => setStep((current) => current - 1)}>Atrás</Button><Button type="button" disabled={publishing} onClick={next}>{publishing ? "Publicando..." : step === WIZARD_STEPS.length - 1 ? "Publicar curso" : "Continuar"}<ArrowRight /></Button></div>
    </div>
  </section>;
}

const TABS = ["Resumen", "Mapa de calor", "Alumnos", "Preguntas", "Recomendaciones"] as const;
export function CourseDashboard() {
  const { config } = usePrototype();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");
  return <section><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-primary">Curso · 847291</p><h1 className="mt-1 text-3xl font-bold text-foreground">{config.topic}</h1><p className="mt-2">Analítica de aprendizaje y configuración de la sesión</p></div><Button asChild variant="outline"><Link to="/join/$id" params={{ id: "847291" }}><QrCode />Código y QR</Link></Button></div><div className="mt-8 flex gap-1 overflow-x-auto border-b border-border" role="tablist">{TABS.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${tab === item ? "border-primary text-primary" : "border-transparent hover:text-foreground"}`}>{item}</button>)}</div><div className="mt-8">{tab === "Resumen" && <Summary />}{tab === "Mapa de calor" && <Heatmap />}{tab === "Alumnos" && <Students />}{tab === "Preguntas" && <Questions />}{tab === "Recomendaciones" && <Recommendations />}</div></section>;
}

function Summary() { return <div className="space-y-8"><div className="grid gap-4 sm:grid-cols-3">{[{ value: "24", label: "Participantes" }, { value: "+31%", label: "Ganancia media pre/post" }, { value: "76%", label: "Conversión al post-test" }].map((item) => <article key={item.label} className="rounded-lg border border-border bg-card p-5"><Activity className="mb-4 size-5 text-primary" /><p className="text-3xl font-bold text-foreground">{item.value}</p><p className="mt-2 text-sm">{item.label}</p></article>)}</div><div className="rounded-lg border border-border bg-card p-6"><h2 className="font-semibold text-foreground">Participación</h2><div className="mt-6 h-4 overflow-hidden rounded-full bg-secondary"><div className="h-full w-3/4 rounded-full bg-primary" /></div><div className="mt-3 flex justify-between text-sm"><span>18 completaron el ciclo</span><span>75%</span></div></div></div>; }
function Heatmap() { const rows = [["Condiciones", "82%", "90%", "76%"], ["Bucle for", "64%", "88%", "71%"], ["Bucle while", "41%", "79%", "58%"], ["Control de salida", "55%", "81%", "63%"]]; return <div className="rounded-lg border border-border bg-card p-6"><h2 className="text-lg font-semibold text-foreground">Rendimiento por subtema</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-border"><tr><th className="py-3">Subtema</th><th>Pre-test</th><th>Post-test</th><th>Conversión</th></tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="border-b border-border"><td className="py-4 text-foreground">{row[0]}</td>{row.slice(1).map((value, index) => <td key={value} className={`rounded px-2 py-4 ${index === 0 && Number.parseInt(value) < 60 ? "bg-destructive/15 text-destructive" : "bg-success/10 text-success"}`}>{value}</td>)}</tr>)}</tbody></table></div></div>; }
function Students() { return <div className="rounded-lg border border-border bg-card p-6"><h2 className="text-lg font-semibold text-foreground">Estado agregado de alumnos</h2><div className="mt-5 space-y-3">{[["Dominan", "9 alumnos", "bg-success"], ["En progreso", "11 alumnos", "bg-primary"], ["Requieren apoyo", "4 alumnos", "bg-destructive"]].map(([label, count, color]) => <div key={label} className="flex items-center justify-between rounded-lg border border-border px-4 py-4"><span className="flex items-center gap-3 text-foreground"><span className={`size-3 rounded-full ${color}`} />{label}</span><span className="text-sm">{count}</span></div>)}</div></div>; }
function Questions() { return <div className="space-y-4">{["¿Cuándo conviene usar un bucle while?", "¿Qué garantiza la condición de salida?", "¿Qué diferencia hay entre for y while?"].map((question, index) => <article key={question} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-5"><div className="flex gap-3"><FileQuestion className="mt-1 size-5 text-primary" /><div><p className="font-medium text-foreground">{question}</p><p className="mt-1 text-sm">{["42%", "38%", "29%"][index]} de fallos · error común: confundir condición con número de iteraciones</p></div></div><span className="text-sm text-destructive">Más fallos</span></article>)}</div>; }
function Recommendations() { return <div className="space-y-4">{["Reforzar la condición de salida antes del post-test.", "Añadir una variante contextual sobre bucles indefinidos.", "Revisar el material del subtema Bucle while."].map((recommendation) => <article key={recommendation} className="flex gap-3 rounded-lg border border-border bg-card p-5"><Lightbulb className="size-5 shrink-0 text-primary" /><div><p className="font-medium text-foreground">Hipótesis de mejora</p><p className="mt-1 text-sm">{recommendation}</p></div></article>)}</div>; }

export const Setup = NewCourseWizard;
export const Monitor = CourseDashboard;
