import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { assessAnswer, FINAL_QUESTIONS, type Question } from "@/lib/assessment";
import {
  AlertTriangle, Bot, BrainCircuit, CheckCircle2, Lightbulb, LogIn, Quote, RotateCcw, Send, User, XCircle,
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

type Screen = "login" | "pre-test" | "chat" | "post-test" | "success";
type Msg = { role: "ai" | "user"; text: string };

const PRE_OPTIONS = [
  { k: "A", t: "El for se usa cuando conoces el número de iteraciones; el while cuando depende de una condición." },
  { k: "B", t: "No hay diferencia, ambos se usan exactamente para lo mismo" },
  { k: "C", t: "El while siempre se ejecuta al menos una vez, el for nunca." },
];
const AI_OPENING =
  "Modo Socrático Activado. Noté que fallaste en la pregunta. ¿Qué concepto exacto te está bloqueando?";
const AI_REPLIES = [
  "Esa es la parte que quiero que razones. Piensa en el límite de iteraciones: ¿qué bucle usas cuando no sabes cuántas veces se repetirá el código?",
  "Exacto. Ahora reformula con tus palabras cuándo es peligroso usar un while sin condición de salida clara.",
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [selected, setSelected] = useState("B");
  const [confidence, setConfidence] = useState(5);
  const [retry, setRetry] = useState<{ question: Question; selected: string } | null>(null);
  const steps: Screen[] = ["login", "pre-test", "chat", "post-test", "success"];

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
        {currentScreen === "login" && <Login onNext={() => setCurrentScreen("pre-test")} />}
        {currentScreen === "pre-test" && (
          <PreTest selected={selected} setSelected={setSelected} confidence={confidence} setConfidence={setConfidence} onNext={() => setCurrentScreen("chat")} />
        )}
        {currentScreen === "chat" && <Chat selected={selected} confidence={confidence} retry={retry} onNext={() => setCurrentScreen("post-test")} />}
        {currentScreen === "post-test" && <PostTest onNext={() => setCurrentScreen("success")} onRetry={(question, answer) => {
          setRetry({ question, selected: answer });
          setCurrentScreen("chat");
        }} />}
        {currentScreen === "success" && <Success onNext={() => {
          setRetry(null);
          setSelected("B");
          setConfidence(5);
          setCurrentScreen("login");
        }} />}
      </main>
    </div>
  );
}

function PrimaryBtn({ className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...p}
      className={`inline-flex h-auto whitespace-normal items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40 ${className}`}
    />
  );
}

function Login({ onNext }: { onNext: () => void }) {
  const [pin, setPin] = useState("");
  const [alias, setAlias] = useState("");
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 sm:p-10">
      <h1 className="text-center text-3xl font-bold text-foreground">Unirse a la Sesión</h1>
      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div>
          <label htmlFor="pin" className="text-sm">Código de Clase (PIN)</label>
          <input
            id="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="ej. 847291"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="alias" className="text-sm">Alias o Código UNI</label>
          <input
            id="alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="ej. 20244108J"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          />
        </div>
        <PrimaryBtn type="submit" className="w-full"><LogIn className="h-5 w-5" />Entrar</PrimaryBtn>
      </form>
    </div>
  );
}

function OptionCard({ option, on, onClick }: { option: { k: string; t: string }; on: boolean; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" aria-pressed={on} onClick={onClick}
      className={`flex h-auto w-full justify-start whitespace-normal items-start gap-4 rounded-xl border p-4 text-left text-base font-normal transition ${on ? "border-primary bg-accent shadow-glow" : "border-border hover:border-primary/50"}`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{option.k}</span>
      <span className={on ? "text-foreground" : ""}>{option.t}</span>
    </Button>
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
      <PrimaryBtn className="mt-8 w-full" onClick={onNext}>Enviar Respuesta</PrimaryBtn>
    </div>
  );
}

function Chat({ selected, confidence, retry, onNext }: { selected: string; confidence: number; retry: { question: Question; selected: string } | null; onNext: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: retry ? `Aún no está validado el aprendizaje. Volvamos a razonar: ${retry.question.prompt}` : AI_OPENING }]);
  const [input, setInput] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [msgs, typing]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing || userCount >= 2) return;
    const idx = userCount;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    timerRef.current = setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: (retry?.question.hints ?? AI_REPLIES)[idx] ?? "" }]);
      setTyping(false);
      setUserCount(idx + 1);
    }, 1500);
  };
  const answer = retry ? retry.question.options.find((o) => o.k === retry.selected) : PRE_OPTIONS.find((o) => o.k === selected);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-wider">Tu respuesta</p>
          {retry && <p role="alert" className="mt-3 text-sm text-destructive">Respuesta final incorrecta. Regresa al Tutor Socrático para intentarlo de nuevo.</p>}
          {retry && <p className="mt-3 text-foreground">{retry.question.prompt}</p>}
          <div className="mt-3 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            <XCircle className="h-5 w-5 shrink-0" /> <span>{answer?.k}. {answer?.t}</span>
          </div>
          {!retry && <><p className="mt-5 text-xs uppercase tracking-wider">Confianza declarada</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{confidence}<span className="text-base text-muted-foreground">/5</span></p></>}
        </div>
        <div className="flex gap-3 rounded-2xl border border-primary/40 bg-accent p-5 text-foreground">
          <AlertTriangle className="h-5 w-5 shrink-0 text-primary" />
          <p>Brecha conceptual detectada. Debes interactuar con el Tutor Socrático para desbloquear el examen final.</p>
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
          <input value={input} onChange={(e) => setInput(e.target.value)} disabled={userCount >= 2} aria-label="Tu razonamiento"
            placeholder="Escribe tu razonamiento..."
            className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" />
          <Button type="submit" disabled={typing || !input.trim() || userCount >= 2} aria-label="Enviar" title="Enviar"
            className="h-auto rounded-xl bg-primary px-4 text-primary-foreground transition hover:brightness-110 disabled:opacity-40">
            <Send className="h-5 w-5" />
          </Button>
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
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-foreground">Validación de Aprendizaje (Sin IA)</h1>
      <p className="mt-4 text-sm text-primary" aria-live="polite">Pregunta {index + 1} de {FINAL_QUESTIONS.length}</p>
      <p className="mt-6 text-lg text-foreground">{question.prompt}</p>
      <div className="mt-6 space-y-3">
        {question.options.map((o) => (
          <OptionCard key={o.k} option={o} on={selected === o.k} onClick={() => setSelected(o.k)} />
        ))}
      </div>
      <PrimaryBtn className="mt-8 w-full" disabled={!selected} onClick={submit}>{index === FINAL_QUESTIONS.length - 1 ? "Enviar Respuesta Final" : "Enviar Respuesta"}</PrimaryBtn>
    </div>
  );
}

function Success({ onNext }: { onNext: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-10 text-center">
      <CheckCircle2 className="h-24 w-24 text-success" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">¡Aprendizaje Validado!</h1>
      <p className="mt-3">Superaste el obstáculo cognitivo por tu cuenta.</p>
      <div className="mt-8 flex w-full gap-3 rounded-2xl border border-primary/40 bg-accent p-6 text-left">
        <Quote className="h-6 w-6 shrink-0 text-primary" />
        <p className="italic text-foreground">"El verdadero aprendizaje ocurre cuando la IA te hace pensar, no cuando piensa por ti."</p>
      </div>
      <PrimaryBtn className="mt-8" onClick={onNext}><RotateCcw className="h-5 w-5" />Volver al inicio</PrimaryBtn>
    </div>
  );
}
