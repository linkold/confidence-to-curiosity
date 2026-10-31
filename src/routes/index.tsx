import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, Bot, BrainCircuit, CheckCircle2, Lightbulb, Send, ShieldAlert, TrendingUp, User, XCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CogniCheck — Tutor Socrático" },
      { name: "description", content: "Evita la descarga cognitiva con un tutor socrático de IA." },
      { property: "og:title", content: "CogniCheck — Tutor Socrático" },
      { property: "og:description", content: "Evita la descarga cognitiva con un tutor socrático de IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Screen = "pre-test" | "chat" | "post-test" | "dashboard";
type Msg = { role: "ai" | "user"; text: string };

const OPTIONS = [
  { k: "A", t: "El for se usa cuando conoces el número de iteraciones; el while cuando depende de una condición." },
  { k: "B", t: "No hay diferencia, ambos se usan exactamente para lo mismo" },
  { k: "C", t: "El while siempre se ejecuta al menos una vez, el for nunca." },
];
const AI_REPLIES = [
  "Esa es la parte que quiero que razones. Piensa en el límite de iteraciones: ¿qué bucle usas cuando no sabes cuántas veces se repetirá el código?",
  "Exacto. Ahora reformula cuándo es peligroso usar un while sin condición de salida clara.",
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("pre-test");
  const [selected, setSelected] = useState("B");
  const [confidence, setConfidence] = useState(5);
  const steps: Screen[] = ["pre-test", "chat", "post-test", "dashboard"];

  return (
    <div className="min-h-screen bg-background text-muted-foreground">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <BrainCircuit className="h-6 w-6 text-primary" /> CogniCheck
          </div>
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <span key={s} className={`h-1.5 w-8 rounded-full transition-colors ${i <= steps.indexOf(currentScreen) ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>
      </header>
      <main key={currentScreen} className="mx-auto max-w-6xl animate-fade-up px-4 py-10">
        {currentScreen === "pre-test" && (
          <PreTest selected={selected} setSelected={setSelected} confidence={confidence} setConfidence={setConfidence} onNext={() => setCurrentScreen("chat")} />
        )}
        {currentScreen === "chat" && <Chat selected={selected} confidence={confidence} onNext={() => setCurrentScreen("post-test")} />}
        {currentScreen === "post-test" && (
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-10 text-center">
            <CheckCircle2 className="h-24 w-24 text-success" />
            <h1 className="mt-6 text-3xl font-bold text-foreground">¡Aprendizaje Validado!</h1>
            <p className="mt-3">Resolviste la variante B del problema sin asistencia de IA.</p>
            <PrimaryBtn className="mt-8" onClick={() => setCurrentScreen("dashboard")}>Ver Panel del Profesor (Simulación)</PrimaryBtn>
          </div>
        )}
        {currentScreen === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}

function PrimaryBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40 ${className}`}
    />
  );
}

function PreTest({ selected, setSelected, confidence, setConfidence, onNext }: {
  selected: string; setSelected: (s: string) => void; confidence: number; setConfidence: (n: number) => void; onNext: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-foreground">Diagnóstico Inicial</h1>
      <p className="mt-6 text-lg text-foreground">¿Cuál es la diferencia estructural principal entre un bucle while y un for?</p>
      <div className="mt-6 space-y-3">
        {OPTIONS.map((o) => {
          const on = selected === o.k;
          return (
            <button key={o.k} onClick={() => setSelected(o.k)}
              className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${on ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/50"}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{o.k}</span>
              <span className={on ? "text-foreground" : ""}>{o.t}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-8">
        <div className="flex justify-between text-sm">
          <label htmlFor="conf">Nivel de confianza en tu respuesta</label>
          <span className="font-semibold text-primary">{confidence}/5</span>
        </div>
        <input id="conf" type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(+e.target.value)} className="mt-3 w-full accent-primary" />
      </div>
      <PrimaryBtn className="mt-8 w-full" onClick={onNext}>Enviar Respuesta</PrimaryBtn>
    </div>
  );
}

function Chat({ selected, confidence, onNext }: { selected: string; confidence: number; onNext: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Modo Socrático Activado. Noté que fallaste en la pregunta sobre bucles. ¿Qué concepto te está bloqueando?" },
  ]);
  const [input, setInput] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [msgs, typing]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing || userCount >= 2) return;
    const idx = userCount;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: AI_REPLIES[idx] }]);
      setTyping(false);
      setUserCount(idx + 1);
    }, 1500);
  };
  const answer = OPTIONS.find((o) => o.k === selected)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-wider">Tu respuesta</p>
          <div className="mt-3 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <XCircle className="h-5 w-5 shrink-0" /> <span>{answer.k}. {answer.t}</span>
          </div>
          <p className="mt-5 text-xs uppercase tracking-wider">Confianza declarada</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{confidence}<span className="text-base text-muted-foreground">/5</span></p>
        </div>
        <div className="flex gap-3 rounded-2xl border border-primary/40 bg-accent p-5 text-foreground">
          <AlertTriangle className="h-5 w-5 shrink-0 text-primary" />
          <p>Brecha conceptual detectada. Debes interactuar con el Tutor Socrático para avanzar.</p>
        </div>
      </aside>
      <section className="flex flex-col rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold text-foreground">
          <Bot className="h-5 w-5 text-primary" /> Tutor Socrático
        </div>
        <div className="h-[420px] space-y-4 overflow-y-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex animate-fade-up gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "ai" ? "bg-accent text-primary" : "bg-primary text-primary-foreground"}`}>
                {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </span>
              <p className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>{m.text}</p>
            </div>
          ))}
          {typing && (
            <div className="flex gap-1 pl-11">
              {[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d * 0.15}s` }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-border p-4">
          <input value={input} onChange={(e) => setInput(e.target.value)} disabled={userCount >= 2}
            placeholder="Escribe tu razonamiento..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" />
          <button type="submit" disabled={typing || !input.trim() || userCount >= 2} aria-label="Send"
            className="rounded-xl bg-primary px-4 text-primary-foreground transition hover:brightness-110 disabled:opacity-40">
            <Send className="h-5 w-5" />
          </button>
        </form>
        {userCount >= 2 && !typing && (
          <div className="animate-fade-up p-4 pt-0">
            <PrimaryBtn className="w-full" onClick={onNext}><Lightbulb className="h-5 w-5" />Concepto Reformulado - Ir al Post-Test</PrimaryBtn>
          </div>
        )}
      </section>
    </div>
  );
}

function Dashboard() {
  const stats = [
    { v: "85%", l: "Fallo Pre-Test", icon: XCircle, c: "text-foreground" },
    { v: "2.4", l: "Pistas Promedio", icon: Lightbulb, c: "text-foreground" },
    { v: "92%", l: "Conversión Post-Test", icon: TrendingUp, c: "text-success" },
  ];
  const rows = [
    { n: "Lincoln Haziel Chagua Bustos (20244108J)", p: 2, i: 1, e: "Validado", ok: true },
    { n: "Alumno Prueba B", p: 4, i: 3, e: "Requiere Humano", ok: false },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Panel Analítico del Docente</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.l} className={`rounded-2xl border bg-card p-6 ${s.c === "text-success" ? "border-success/50" : "border-border"}`}>
            <s.icon className={`h-5 w-5 ${s.c === "text-success" ? "text-success" : "text-primary"}`} />
            <p className={`mt-4 text-4xl font-bold ${s.c}`}>{s.v}</p>
            <p className="mt-1">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[600px] text-left">
          <thead className="border-b border-border text-xs uppercase tracking-wider">
            <tr>{["Estudiante", "Pistas Usadas", "Intentos de Copiar", "Estado"].map((h) => <th key={h} className="px-6 py-4 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-6 py-4 text-foreground">{r.n}</td>
                <td className="px-6 py-4">{r.p}</td>
                <td className="px-6 py-4">{r.i}</td>
                <td className={`px-6 py-4 font-semibold ${r.ok ? "text-success" : "text-destructive"}`}>
                  <span className="inline-flex items-center gap-1.5">
                    {r.ok ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}{r.e}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
