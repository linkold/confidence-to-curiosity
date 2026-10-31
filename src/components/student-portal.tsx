import { useEffect, useRef, useState } from "react";
import { usePrototype } from "@/lib/prototype";
import { Button } from "@/components/ui/button";
import { assessAnswer, FINAL_QUESTIONS, type Question } from "@/lib/assessment";
import {
  AlertTriangle, Bot, CheckCircle2, Lightbulb, LogIn, Quote, RotateCcw, Send, User, XCircle,
} from "lucide-react";

type Screen = "welcome" | "pre-test" | "chat" | "post-test" | "progress";
type Msg = { role: "ai" | "user"; text: string };

const PRE_OPTIONS = [
  { k: "A", t: "El for se usa cuando conoces el número de iteraciones; el while cuando depende de una condición." },
  { k: "B", t: "No hay diferencia, ambos se usan exactamente para lo mismo" },
  { k: "C", t: "El while siempre se ejecuta al menos una vez, el for nunca." },
];
const AI_OPENING =
  "Modo Socrático: ¿Qué concepto te bloquea?";

export function StudentPortal({ sessionId = "847291" }: { sessionId?: string }) {
  const { setStatus, setStudent, student } = usePrototype();
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const transition = (status: string, screen: Screen) => {
    setStatus(status); setBusy(true);
    timer.current = setTimeout(() => { setCurrentScreen(screen); setBusy(false); }, 900);
  };
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selected, setSelected] = useState("B");
  const [confidence, setConfidence] = useState(5);
  const [retry, setRetry] = useState<{ question: Question; selected: string } | null>(null);
  const steps: Screen[] = ["welcome", "pre-test", "chat", "post-test", "progress"];

  return (
    <div className="bg-background text-muted-foreground">
      <div className="mx-auto flex max-w-6xl justify-end gap-1.5 px-4 pt-6" aria-label="Progreso del alumno">
        {steps.map((s, i) => <span key={s} className={`h-1.5 w-8 rounded-full transition-colors ${i <= steps.indexOf(currentScreen) ? "bg-primary" : "bg-border"}`} />)}
      </div>
      <main key={currentScreen} className="mx-auto max-w-6xl animate-fade-up px-4 py-10">
        {currentScreen === "welcome" && <Welcome sessionId={sessionId} busy={busy} onNext={(alias) => { setStudent({alias: alias.trim() || "Alumno anónimo", validated:false}); transition("Sesión iniciada.", "pre-test"); }} />}
        {currentScreen === "pre-test" && (
          <PreTest selected={selected} setSelected={setSelected} confidence={confidence} setConfidence={setConfidence} busy={busy} onNext={() => transition("Backend: Corrector de Máquina de Estados evaluando...", "chat")} />
        )}
        {currentScreen === "chat" && <Chat selected={selected} confidence={confidence} retry={retry} onNext={() => setCurrentScreen("post-test")} />}
        {currentScreen === "post-test" && <PostTest onNext={() => { setStudent({alias: student?.alias ?? "Alumno anónimo", validated:true}); setStatus("Aprendizaje validado."); setCurrentScreen("progress"); }} onRetry={(question, answer) => {
          setStatus("Backend: Brecha conceptual detectada. Reiniciando ciclo socrático...");
          setRetry({ question, selected: answer });
          setCurrentScreen("chat");
        }} />}
        {currentScreen === "progress" && <Progress onNext={() => {
          setStatus("Backend: En espera.");
          setRetry(null);
          setSelected("B");
          setConfidence(5);
          setCurrentScreen("welcome");
        }} />}
      </main>
    </div>
  );
}

function PrimaryBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...p}
      className={`inline-flex h-auto whitespace-normal items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40 ${className}`}
    />
  );
}

function Welcome({ sessionId, busy, onNext }: { sessionId: string; busy: boolean; onNext: (alias: string) => void }) {
  const [alias, setAlias] = useState("");
  const [consent, setConsent] = useState(false);
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 sm:p-10">
      <p className="text-sm text-primary">Paso 0 de 4</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">Bienvenido a la sesión ({sessionId})</h1>
      <p className="mt-4 text-sm">Resolverás un diagnóstico, conversarás con el tutor socrático y completarás un post-test equivalente.</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onNext(alias);
        }}
      >
        <div>
          <label htmlFor="alias" className="text-sm">Alias</label>
          <input
            id="alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="ej. 20244108J"
            className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          />
        </div>
        <label className="flex gap-3 text-sm"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-primary" />Acepto participar y entiendo que se registrarán mis respuestas, confianza, pistas y resultados para medir mi aprendizaje.</label>
        <PrimaryBtn type="submit" disabled={busy || !consent} className="w-full"><LogIn className="h-5 w-5" />Comenzar</PrimaryBtn>
      </form>
    </div>
  );
}

function OptionCard({ option, on, onClick }: { option: { k: string; t: string }; on: boolean; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" aria-pressed={on} onClick={onClick}
      className={`flex h-auto w-full justify-start whitespace-normal items-start gap-4 rounded-lg border p-4 text-left text-base font-normal transition ${on ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/50"}`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{option.k}</span>
      <span className={on ? "text-foreground" : ""}>{option.t}</span>
    </Button>
  );
}

function PreTest({ selected, setSelected, confidence, setConfidence, busy, onNext }: {
  selected: string; setSelected: (s: string) => void; confidence: number; setConfidence: (n: number) => void; busy: boolean; onNext: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-foreground">Diagnóstico Inicial</h1>
      <p className="mt-6 text-lg text-foreground">¿Cuál es la diferencia estructural principal entre un bucle while y un for?</p>
      <div className="mt-6 space-y-3">
        {PRE_OPTIONS.map((o) => (
          <OptionCard key={o.k} option={o} on={selected === o.k} onClick={() => setSelected(o.k)} />
        ))}
      </div>
      <div className="mt-8">
        <div className="flex justify-between text-sm">
          <label htmlFor="conf">Nivel de confianza en tu respuesta (1=Bajo, 5=Alto)</label>
          <span className="font-semibold text-primary">{confidence}/5</span>
        </div>
        <input id="conf" type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(+e.target.value)} className="mt-3 w-full accent-primary" />
      </div>
      <PrimaryBtn className="mt-8 w-full" disabled={busy} onClick={onNext}>Enviar</PrimaryBtn>
    </div>
  );
}

function Chat({ selected, confidence, retry, onNext }: { selected: string; confidence: number; retry: { question: Question; selected: string } | null; onNext: () => void }) {
  const { setStatus } = usePrototype();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: retry ? `Aún no está validado el aprendizaje. Volvamos a razonar: ${retry.question.prompt}` : AI_OPENING }]);
  const [input, setInput] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [msgs, typing]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing || userCount >= 2) return;
    const idx = userCount;
    const nextMsgs = [...msgs, { role: "user" as const, text }];
    setMsgs(nextMsgs);
    setInput("");
    setTyping(true);
    setStatus("Backend: Consultando tutor socrático de Groq...");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historial: nextMsgs.map((message) => ({
            role: message.role === "ai" ? "assistant" : "user",
            content: message.text,
          })),
        }),
      });
      const data = (await response.json()) as { respuesta?: string; error?: string };
      if (!response.ok || !data.respuesta) throw new Error(data.error ?? "Respuesta inválida");
      setMsgs((m) => [...m, { role: "ai", text: data.respuesta! }]);
      setStatus("Backend: Respuesta socrática recibida de Groq.");
      setTyping(false);
      setUserCount(idx + 1);
    } catch (error) {
      console.error("Error al consultar el tutor socrático:", error);
      setStatus("Backend: No se pudo consultar el tutor socrático.");
      setTyping(false);
    }
  };
  const answer = retry ? retry.question.options.find((o) => o.k === retry.selected) : PRE_OPTIONS.find((o) => o.k === selected);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-wider">Tu respuesta</p>
          {retry && <p role="alert" className="mt-3 text-sm text-destructive">Respuesta final incorrecta. Regresa al Tutor Socrático para intentarlo de nuevo.</p>}
          {retry && <p className="mt-3 text-foreground">{retry.question.prompt}</p>}
          <div className="mt-3 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <XCircle className="h-5 w-5 shrink-0" /> <span>{answer?.k}. {answer?.t}</span>
          </div>
          {!retry && <><p className="mt-5 text-xs uppercase tracking-wider">Confianza declarada</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{confidence}<span className="text-base text-muted-foreground">/5</span></p></>}
        </div>
        <div className="flex gap-3 rounded-lg border border-primary/40 bg-accent p-5 text-foreground">
          <AlertTriangle className="h-5 w-5 shrink-0 text-primary" />
          <p>Brecha conceptual detectada. Debes interactuar con el Tutor Socrático para desbloquear el examen final.</p>
        </div>
      </aside>
      <section className="flex flex-col rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold text-foreground">
          <Bot className="h-5 w-5 text-primary" /> Tutor Socrático
        </div>
        <div className="h-[420px] space-y-4 overflow-y-auto p-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex animate-fade-up gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "ai" ? "bg-accent text-primary" : "bg-primary text-primary-foreground"}`}>
                {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </span>
              <p className={`max-w-[80%] rounded-lg px-4 py-3 ${m.role === "ai" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"}`}>{m.text}</p>
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
          <input value={input} onChange={(e) => setInput(e.target.value)} disabled={userCount >= 2} aria-label="Tu razonamiento"
            placeholder="Escribe tu razonamiento..."
            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" />
          <Button type="submit" disabled={typing || !input.trim() || userCount >= 2} aria-label="Enviar" title="Enviar"
            className="h-auto rounded-lg bg-primary px-4 text-primary-foreground transition hover:brightness-110 disabled:opacity-40">
            <Send className="h-5 w-5" />
          </Button>
        </form>
        {userCount >= 2 && !typing && (
          <div className="animate-fade-up p-4 pt-0">
            <PrimaryBtn className="w-full" onClick={onNext}><Lightbulb className="h-5 w-5" />Ir al Post-Test</PrimaryBtn>
          </div>
        )}
      </section>
    </div>
  );
}

function PostTest({ onNext, onRetry }: { onNext: () => void; onRetry: (question: Question, selected: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const question = FINAL_QUESTIONS[index];
  if (!question) return null;
  const submit = () => {
    if (!selected) return;
    const result = assessAnswer(index, selected);
    if (result === "retry") { onRetry(question, selected); return; }
    if (result === "success") { onNext(); return; }
    setIndex(index + 1);
    setSelected(null);
  };
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-foreground">Validación de Aprendizaje (Sin IA)</h1>
      <p className="mt-4 text-sm text-primary" aria-live="polite">Pregunta {index + 1} de {FINAL_QUESTIONS.length}</p>
      <p className="mt-6 text-lg text-foreground">{question.prompt}</p>
      <div className="mt-6 space-y-3">
        {question.options.map((o) => (
          <OptionCard key={o.k} option={o} on={selected === o.k} onClick={() => setSelected(o.k)} />
        ))}
      </div>
      <PrimaryBtn className="mt-8 w-full" disabled={!selected} onClick={submit}>{index === FINAL_QUESTIONS.length - 1 ? "Enviar Final" : "Enviar"}</PrimaryBtn>
    </div>
  );
}

function Progress({ onNext }: { onNext: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-border bg-card p-10 text-center">
      <CheckCircle2 className="h-24 w-24 text-success" />
      <p className="mt-6 text-sm text-primary">Paso 4 de 4</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">Mi progreso</h1>
      <p className="mt-3">Así cambió tu desempeño después de trabajar con el tutor.</p>
      <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-3"><div className="rounded-lg bg-secondary p-4"><p className="text-sm">Antes</p><p className="mt-1 text-2xl font-bold text-foreground">25%</p></div><div className="rounded-lg bg-accent p-4"><p className="text-sm">Después</p><p className="mt-1 text-2xl font-bold text-primary">88%</p></div><div className="rounded-lg bg-success/10 p-4"><p className="text-sm">Calibración</p><p className="mt-1 text-2xl font-bold text-success">+2</p></div></div>
      <div className="mt-8 flex w-full gap-3 rounded-lg border border-primary/40 bg-accent p-6 text-left">
        <Quote className="h-6 w-6 shrink-0 text-primary" />
        <p className="italic text-foreground">"El verdadero aprendizaje ocurre cuando la IA te hace pensar, no cuando piensa por ti."</p>
      </div>
      <PrimaryBtn className="mt-8" onClick={onNext}><RotateCcw className="h-5 w-5" />Volver al inicio</PrimaryBtn>
    </div>
  );
}
