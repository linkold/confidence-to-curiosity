import { Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Hash,
  Lightbulb,
  ListTree,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createCourse,
  getCourseActivity,
  listCourses,
  type CourseActivityEvent,
  type CourseRecord,
} from "@/lib/backend";

const WIZARD_STEPS = ["Curso y temas", "Preguntas", "Tutor", "Publicar"];
const SAMPLE_CODE = "847291";

export function TeacherLayout() {
  return (
    <div className="mx-auto grid max-w-7xl md:min-h-[720px] md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="min-w-0 border-b border-border px-5 py-6 md:border-r md:border-b-0 md:py-9">
        <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Portal del Profesor
        </p>
        <nav aria-label="Profesor" className="flex flex-wrap gap-2 md:flex-col">
          {(
            [
              { to: "/teacher", label: "Cursos", icon: BookOpen },
              { to: "/teacher/new", label: "Nuevo curso", icon: Plus },
            ] as const
          ).map(({ to, label, icon: Icon }) => (
            <Button asChild variant="ghost" key={to} className="justify-start">
              <Link
                to={to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-accent text-primary" }}
              >
                <Icon />
                {label}
              </Link>
            </Button>
          ))}
          <Button asChild variant="ghost" className="justify-start">
            <Link
              to="/teacher/course/$id"
              params={{ id: SAMPLE_CODE }}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-accent text-primary" }}
            >
              <BarChart3 />
              Analítica del curso
            </Link>
          </Button>
        </nav>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-9">
        <Outlet />
      </main>
    </div>
  );
}

export function Classes() {
  const { courses, loading, error, reload } = useTeacherCourses();
  const demoCourse = {
    id: SAMPLE_CODE,
    name: "Fundamentos de programación",
    sessionCode: SAMPLE_CODE,
    studentCount: 24,
  };
  return (
    <section>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary">Espacio del profesor</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">Mis cursos</h1>
        </div>
        <Button asChild>
          <Link to="/teacher/new">
            <Plus />
            Crear curso
          </Link>
        </Button>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="mb-4 text-sm">
          Cargando cursos…
        </p>
      )}
      {[demoCourse, ...courses].map((course) => (
        <article key={course.id} className="mb-4 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <BookOpen className="mt-1 size-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{course.name}</h2>
                <p className="mt-2 text-sm">
                  {course.studentCount} plazas planificadas
                  {course.id === SAMPLE_CODE ? " · datos de demostración" : ""}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-success/10 px-3 py-1 text-sm text-success">
              {course.id === SAMPLE_CODE ? "Demo" : "Publicado"}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-foreground">
            <Hash className="size-4 text-primary" />
            Código de acceso: <strong>{course.sessionCode}</strong>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/teacher/course/$id" params={{ id: course.id }}>
                Ver curso <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/teacher/new">
                <Settings2 />
                Crear otro curso
              </Link>
            </Button>
          </div>
        </article>
      ))}
      {!loading && courses.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">
          Aún no hay cursos creados. El curso de programación es solo una demostración.
        </p>
      )}
      <Button type="button" variant="outline" className="mt-2" onClick={() => void reload()}>
        Actualizar cursos
      </Button>
    </section>
  );
}

function useTeacherCourses() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCourses(await listCourses());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar los cursos");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { courses, loading, error, reload };
}

type QuestionDraft = { prompt: string; subtopic: string; options: string[]; correct: number };

export function NewCourseWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [courseName, setCourseName] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [centralTopic, setCentralTopic] = useState("");
  const [newSubtopic, setNewSubtopic] = useState("");
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [tone, setTone] = useState("Cercano y exigente");
  const [language, setLanguage] = useState("Español");
  const [maxHints, setMaxHints] = useState(3);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const addSubtopic = () => {
    const value = newSubtopic.trim();
    const normalized = value.toLocaleLowerCase();
    const alreadyExists = [centralTopic, ...subtopics].some(
      (topic) => topic.trim().toLocaleLowerCase() === normalized,
    );
    if (value && !alreadyExists) {
      setSubtopics((current) => [...current, value]);
      setNewSubtopic("");
    }
  };
  const addQuestion = () =>
    setQuestions((current) => [
      ...current,
      { prompt: "", subtopic: subtopics[0] ?? "", options: ["", "", "", ""], correct: -1 },
    ]);
  const questionsValid =
    questions.length > 0 &&
    questions.every(
      (question) =>
        question.prompt.trim() &&
        subtopics.includes(question.subtopic) &&
        question.options.length >= 2 &&
        question.options.every((option) => option.trim()) &&
        Number.isInteger(question.correct) &&
        question.correct >= 0 &&
        question.correct < question.options.length,
    ) &&
    subtopics.every(
      (topic) => questions.filter((question) => question.subtopic === topic).length >= 2,
    );
  const canContinue =
    step === 0
      ? Boolean(
          courseName.trim() &&
          centralTopic.trim() &&
          subtopics.length >= 2 &&
          Number.isInteger(Number(studentCount)) &&
          Number(studentCount) > 0,
        )
      : step === 1
        ? questionsValid
        : true;
  const next = async () => {
    if (!canContinue) return;
    if (step < WIZARD_STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    setPublishing(true);
    setPublishError("");
    try {
      const course = await createCourse({
        name: courseName.trim(),
        topics: [centralTopic.trim(), ...subtopics],
        material: "",
        questionVariants: Math.min(
          ...subtopics.map(
            (topic) => questions.filter((question) => question.subtopic === topic).length,
          ),
        ),
        questions,
        tutor: {
          tone,
          language,
          maxHints,
          model: "openai/gpt-oss-120b",
          students: Number(studentCount),
        },
      });
      navigate({ to: "/teacher/course/$id", params: { id: course.id } });
    } catch (error) {
      console.error("No se pudo publicar el curso:", error);
      setPublishError(
        error instanceof Error ? error.message : "No se pudo verificar el curso creado",
      );
    } finally {
      setPublishing(false);
    }
  };
  const updateQuestion = (questionIndex: number, update: Partial<QuestionDraft>) =>
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? { ...question, ...update } : question,
      ),
    );

  return (
    <section className="max-w-3xl">
      <p className="text-sm text-primary">Nuevo curso</p>
      <h1 className="mt-1 text-3xl font-bold text-foreground">Crear experiencia de aprendizaje</h1>
      <div className="mt-8 grid grid-cols-4 gap-2" aria-label="Pasos del asistente">
        {WIZARD_STEPS.map((label, index) => (
          <div key={label} className="space-y-2">
            <div className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`} />
            <span
              className={`text-xs ${index === step ? "text-foreground" : "text-muted-foreground"}`}
            >
              {index + 1}. {label}
            </span>
          </div>
        ))}
      </div>
      {publishError && (
        <div
          role="alert"
          className="mt-6 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="size-5 shrink-0" />
          <p>{publishError}</p>
        </div>
      )}
      <div className="mt-10 rounded-lg border border-border bg-card p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="course-name" className="text-sm font-medium text-foreground">
                Nombre del curso
              </label>
              <input
                id="course-name"
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                placeholder="Ej. Fundamentos de programación"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="student-count" className="text-sm font-medium text-foreground">
                ¿Cuántos alumnos participarán?
              </label>
              <input
                id="student-count"
                type="number"
                min={1}
                step={1}
                value={studentCount}
                onChange={(event) => setStudentCount(event.target.value)}
                placeholder="Ej. 30"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="central-topic" className="text-sm font-medium text-foreground">
                Tema central
              </label>
              <input
                id="central-topic"
                value={centralTopic}
                onChange={(event) => setCentralTopic(event.target.value)}
                placeholder="Ej. Estructuras de control"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="subtopic" className="text-sm font-medium text-foreground">
                Subtemas (mínimo 2)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="subtopic"
                  value={newSubtopic}
                  onChange={(event) => setNewSubtopic(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSubtopic();
                    }
                  }}
                  placeholder="Escribe un subtema"
                  className="min-w-0 flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
                />
                <Button type="button" variant="outline" onClick={addSubtopic}>
                  <Plus />
                  Agregar
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {subtopics.map((subtopic, index) => (
                  <div
                    key={subtopic}
                    className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground"
                  >
                    <ListTree className="size-4 text-primary" />
                    {index + 1}. {subtopic}
                  </div>
                ))}
                {subtopics.length < 2 && (
                  <p className="text-sm text-muted-foreground">
                    Agrega al menos dos subtemas para continuar.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Preguntas de alternativa múltiple
              </h2>
              <p className="mt-2 text-sm">
                Escribe al menos dos preguntas equivalentes por subtema. Marca la alternativa
                correcta en cada pregunta.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={addQuestion}>
                <Plus />
                Agregar pregunta
              </Button>
            </div>
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-start gap-2">
                  <FileQuestion className="mt-1 size-4 shrink-0 text-primary" />
                  <input
                    value={question.prompt}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { prompt: event.target.value })
                    }
                    aria-label={`Enunciado de pregunta ${questionIndex + 1}`}
                    placeholder="Escribe el enunciado de la pregunta"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Eliminar pregunta ${questionIndex + 1}`}
                    onClick={() =>
                      setQuestions((current) =>
                        current.filter((_, index) => index !== questionIndex),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
                <label className="block text-sm">
                  Subtema que evalúa
                  <select
                    value={question.subtopic}
                    onChange={(event) =>
                      updateQuestion(questionIndex, { subtopic: event.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                  >
                    <option value="">Selecciona un subtema</option>
                    {subtopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </label>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correct === optionIndex}
                      onChange={() => updateQuestion(questionIndex, { correct: optionIndex })}
                    />{" "}
                    <input
                      value={option}
                      onChange={(event) => {
                        const options = [...question.options];
                        options[optionIndex] = event.target.value;
                        updateQuestion(questionIndex, { options });
                      }}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                    />
                  </label>
                ))}
              </div>
            ))}
            {!questionsValid && (
              <p className="text-sm text-muted-foreground">
                Para continuar, completa cada pregunta y agrega al menos dos por cada subtema.
              </p>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Ajustes del tutor socrático</h2>
              <p className="mt-2 text-sm">
                El tutor nunca dará respuestas directas y guiará con preguntas.
              </p>
            </div>
            <div>
              <label htmlFor="tone" className="text-sm font-medium text-foreground">
                Tono
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              >
                <option>Cercano y exigente</option>
                <option>Formal y académico</option>
                <option>Motivador</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="text-sm font-medium text-foreground">
                Idioma
              </label>
              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              >
                <option>Español</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between">
                <label htmlFor="hints" className="text-sm font-medium text-foreground">
                  Número máximo de pistas
                </label>
                <output className="text-primary">{maxHints}</output>
              </div>
              <input
                id="hints"
                type="range"
                min={1}
                max={5}
                value={maxHints}
                onChange={(event) => setMaxHints(Number(event.target.value))}
                className="mt-3 w-full accent-primary"
              />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-accent p-4">
              <Sparkles className="size-5 text-primary" />
              <p className="text-sm text-foreground">
                Modelo predeterminado del backend: <strong>openai/gpt-oss-120b</strong> vía Groq
              </p>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Revisión y publicación</h2>
              <p className="mt-2 text-sm">
                Confirma los temas, subtemas y preguntas antes de crear el curso.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Temas y subtemas</h3>
              <div className="mt-3 rounded-lg border border-border bg-background p-4">
                <p className="font-medium text-foreground">{centralTopic}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {subtopics.map((subtopic) => (
                    <li key={subtopic}>{subtopic}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Preguntas propuestas</h3>
              <div className="mt-3 space-y-2">
                {questions.length ? (
                  questions.map((question, questionIndex) => (
                    <div
                      key={`${questionIndex}-${question.prompt}`}
                      className="rounded-lg border border-border bg-background p-4 text-sm"
                    >
                      <p className="text-xs text-primary">{question.subtopic}</p>
                      <p className="font-medium text-foreground">{question.prompt}</p>
                      <p className="mt-2">{question.options.join(" · ")}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm">
                    No se han propuesto preguntas todavía.
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm">
              Participantes: <strong className="text-foreground">{studentCount}</strong> · Tutor:{" "}
              <strong className="text-foreground">openai/gpt-oss-120b</strong>
            </p>
          </div>
        )}
        <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || publishing}
            onClick={() => setStep((current) => current - 1)}
          >
            Atrás
          </Button>
          <Button type="button" disabled={publishing || !canContinue} onClick={next}>
            {publishing
              ? "Publicando..."
              : step === WIZARD_STEPS.length - 1
                ? "Publicar curso"
                : "Continuar"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
}

const TABS = ["Resumen", "Mapa de calor", "Alumnos", "Preguntas", "Recomendaciones"] as const;
export function CourseDashboard() {
  const { courses: savedCourses, loading, error } = useTeacherCourses();
  const { id: selectedId } = useParams({ from: "/teacher/course/$id" });
  const demoCourse = {
    id: SAMPLE_CODE,
    name: "Fundamentos de programación",
    sessionCode: SAMPLE_CODE,
    studentCount: 24,
    topics: ["Estructuras de control", "Condiciones", "Bucle for", "Bucle while"],
    questions: [] as CourseRecord["questions"],
  };
  const courses: CourseRecord[] = [
    demoCourse,
    ...savedCourses.filter((course) => course.id !== SAMPLE_CODE),
  ];
  const course = courses.find((item) => item.id === selectedId) ?? courses[0]!;
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");
  return (
    <section>
      <div>
        <p className="text-sm text-primary">Espacio del profesor</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Analítica de cursos</h1>
        <p className="mt-2">Selecciona un curso para revisar sus resultados.</p>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="mt-4 text-sm">
          Cargando cursos…
        </p>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {courses.map((item) => (
          <Link
            key={item.id}
            to="/teacher/course/$id"
            params={{ id: item.id }}
            className={`rounded-lg border bg-card p-5 transition hover:border-primary/60 hover:shadow-glow ${item.id === course.id ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <BarChart3 className="mt-1 size-5 text-primary" />
                <div>
                  <h2 className="font-semibold text-foreground">{item.name}</h2>
                  <p className="mt-1 text-sm">Código {item.sessionCode}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.id === SAMPLE_CODE
                  ? `${item.studentCount} demo`
                  : `${item.studentCount} plazas`}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-primary">Curso · {course.sessionCode}</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">{course.name}</h1>
          <p className="mt-2">Analítica de aprendizaje y configuración de la sesión</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground">
          <Hash className="size-4 text-primary" />
          Código: <strong>{course.sessionCode}</strong>
        </div>
      </div>
      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${tab === item ? "border-primary text-primary" : "border-transparent hover:text-foreground"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {course.id === SAMPLE_CODE ? (
          <>
            {tab === "Resumen" && <Summary />}
            {tab === "Mapa de calor" && <Heatmap />}
            {tab === "Alumnos" && <Students />}
            {tab === "Preguntas" && <Questions />}
            {tab === "Recomendaciones" && <Recommendations />}
          </>
        ) : (
          <RealCourseTab tab={tab} course={course} />
        )}
      </div>
    </section>
  );
}

function RealCourseTab({ tab, course }: { tab: (typeof TABS)[number]; course: CourseRecord }) {
  const activity = useCourseActivity(course.sessionCode);
  if (tab === "Mapa de calor")
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Temas del curso</h2>
        <p className="mt-1 text-sm">
          Los resultados aparecerán cuando haya respuestas registradas.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {course.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </div>
    );
  if (tab === "Preguntas")
    return (
      <div className="space-y-4">
        <QuestionTiming events={activity.events} loading={activity.loading} />
        {course.questions.map((question, index) => (
          <article
            key={`${index}-${question.prompt}`}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="text-xs text-primary">{question.subtopic}</p>
            <h3 className="mt-1 font-medium text-foreground">{question.prompt}</h3>
            <p className="mt-2 text-sm">
              {question.options
                .map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`)
                .join(" · ")}
            </p>
          </article>
        ))}
      </div>
    );
  if (tab === "Alumnos")
    return (
      <StudentStateTracker
        events={activity.events}
        loading={activity.loading}
        error={activity.error}
      />
    );
  const title =
    tab === "Resumen"
      ? "Todavía no hay resultados"
      : "Aún no hay datos suficientes para recomendar acciones";
  const description =
    tab === "Resumen"
      ? "La participación, la ganancia pre/post y la conversión se calcularán a partir de las sesiones reales."
      : "Las recomendaciones se presentarán como hipótesis cuando haya respuestas registradas.";
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-6">
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}

function useCourseActivity(sessionCode: string) {
  const [events, setEvents] = useState<CourseActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getCourseActivity(sessionCode);
        if (mounted) {
          setEvents(data);
          setError("");
        }
      } catch (cause) {
        if (mounted)
          setError(cause instanceof Error ? cause.message : "No se pudo cargar actividad");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 15_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [sessionCode]);
  return { events, loading, error };
}

function StudentStateTracker({
  events,
  loading,
  error,
}: {
  events: CourseActivityEvent[];
  loading: boolean;
  error: string;
}) {
  const latestByStudent = new Map<string, CourseActivityEvent>();
  for (const event of events) {
    if (event.eventType !== "student_state") continue;
    const key = event.payload.studentId ?? event.alias ?? `student-${event.id}`;
    latestByStudent.set(key, event);
  }
  const students = [...latestByStudent.values()].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-semibold text-foreground">Estado de los alumnos</h2>
        <p className="mt-1 text-sm">
          Actualización automática cada 15 segundos; activo significa actividad en el último minuto.
        </p>
      </div>
      {loading && (
        <p role="status" className="text-sm">
          Cargando actividad…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!loading && students.length === 0 && (
        <p className="text-sm">Aún no hay alumnos que hayan aceptado el consentimiento.</p>
      )}
      {students.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 pr-4">Alumno</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {students.map((event) => {
                const ageMs = Date.now() - Date.parse(event.createdAt);
                const state = event.payload.state ?? "unknown";
                const label =
                  state === "completed"
                    ? "Completó"
                    : state === "needs_support"
                      ? "Finalizó · requiere refuerzo"
                      : state === "pre-test"
                        ? "Diagnóstico"
                        : state === "chat"
                          ? "Tutor socrático"
                          : state === "post-test"
                            ? "Post-test"
                            : state;
                const active = ageMs <= 60_000 && !["completed", "needs_support"].includes(state);
                return (
                  <tr
                    key={event.payload.studentId ?? event.id}
                    className="border-b border-border/60"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {event.alias || "Alumno"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}`}
                      >
                        {active ? `${label} · activo` : label}
                      </span>
                    </td>
                    <td className="py-3">{new Date(event.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuestionTiming({ events, loading }: { events: CourseActivityEvent[]; loading: boolean }) {
  const grouped = new Map<
    string,
    {
      prompt: string;
      phase: string;
      totalMs: number;
      count: number;
      correct: number;
      graded: number;
    }
  >();
  for (const event of events) {
    if (!["pre_test_submitted", "post_test_answer"].includes(event.eventType)) continue;
    const elapsedMs = event.payload.elapsedMs;
    if (typeof elapsedMs !== "number" || !Number.isFinite(elapsedMs)) continue;
    const phase =
      event.payload.phase ?? (event.eventType === "pre_test_submitted" ? "pre" : "post");
    const prompt =
      event.payload.questionPrompt ?? `Pregunta ${Number(event.payload.questionIndex ?? 0) + 1}`;
    const key = `${phase}:${prompt}`;
    const item = grouped.get(key) ?? { prompt, phase, totalMs: 0, count: 0, correct: 0, graded: 0 };
    item.totalMs += elapsedMs;
    item.count += 1;
    if (typeof event.payload.correct === "boolean") {
      item.graded += 1;
      if (event.payload.correct) item.correct += 1;
    }
    grouped.set(key, item);
  }
  const rows = [...grouped.values()].sort(
    (a, b) => a.phase.localeCompare(b.phase) || a.prompt.localeCompare(b.prompt),
  );
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-semibold text-foreground">Tiempo promedio de respuesta</h2>
      <p className="mt-1 text-sm">
        Tiempo desde que aparece cada pregunta hasta que el alumno la envía.
      </p>
      {loading && (
        <p role="status" className="mt-3 text-sm">
          Cargando mediciones…
        </p>
      )}
      {!loading && rows.length === 0 && (
        <p className="mt-3 text-sm">Aún no hay respuestas con tiempos registrados.</p>
      )}
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <article
            key={`${row.phase}-${row.prompt}`}
            className="rounded-md border border-border p-4"
          >
            <p className="text-xs text-primary">
              {row.phase === "pre" ? "Diagnóstico" : "Post-test"} · {row.count} respuesta
              {row.count === 1 ? "" : "s"}
            </p>
            <p className="mt-1 font-medium text-foreground">{row.prompt}</p>
            <p className="mt-2 text-sm">
              Promedio:{" "}
              <strong className="text-foreground">{formatDuration(row.totalMs / row.count)}</strong>
              {row.graded > 0 && ` · ${Math.round((row.correct / row.graded) * 100)}% correctas`}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatDuration(milliseconds: number) {
  const seconds = Math.round(milliseconds / 1000);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}
function Summary() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { value: "24", label: "Participantes" },
          { value: "+31%", label: "Ganancia media pre/post" },
          { value: "76%", label: "Conversión al post-test" },
        ].map((item) => (
          <article key={item.label} className="rounded-lg border border-border bg-card p-5">
            <Activity className="mb-4 size-5 text-primary" />
            <p className="text-3xl font-bold text-foreground">{item.value}</p>
            <p className="mt-2 text-sm">{item.label}</p>
          </article>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-semibold text-foreground">Participación</h2>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span>18 completaron el ciclo</span>
          <span>75%</span>
        </div>
      </div>
    </div>
  );
}
function Heatmap() {
  const rows = [
    ["Condiciones", "82%", "90%", "76%"],
    ["Bucle for", "64%", "88%", "71%"],
    ["Bucle while", "41%", "79%", "58%"],
    ["Control de salida", "55%", "81%", "63%"],
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Rendimiento por subtema</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="py-3">Subtema</th>
              <th>Pre-test</th>
              <th>Post-test</th>
              <th>Conversión</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-border">
                <td className="py-4 text-foreground">{row[0]}</td>
                {row.slice(1).map((value, index) => (
                  <td
                    key={value}
                    className={`rounded px-2 py-4 ${index === 0 && Number.parseInt(value) < 60 ? "bg-destructive/15 text-destructive" : "bg-success/10 text-success"}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Students() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Estado agregado de alumnos</h2>
      <div className="mt-5 space-y-3">
        {[
          ["Dominan", "9 alumnos", "bg-success"],
          ["En progreso", "11 alumnos", "bg-primary"],
          ["Requieren apoyo", "4 alumnos", "bg-destructive"],
        ].map(([label, count, color]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-4"
          >
            <span className="flex items-center gap-3 text-foreground">
              <span className={`size-3 rounded-full ${color}`} />
              {label}
            </span>
            <span className="text-sm">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Questions() {
  return (
    <div className="space-y-4">
      {[
        "¿Cuándo conviene usar un bucle while?",
        "¿Qué garantiza la condición de salida?",
        "¿Qué diferencia hay entre for y while?",
      ].map((question, index) => (
        <article
          key={question}
          className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-5"
        >
          <div className="flex gap-3">
            <FileQuestion className="mt-1 size-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{question}</p>
              <p className="mt-1 text-sm">
                {["42%", "38%", "29%"][index]} de fallos · error común: confundir condición con
                número de iteraciones
              </p>
            </div>
          </div>
          <span className="text-sm text-destructive">Más fallos</span>
        </article>
      ))}
    </div>
  );
}
function Recommendations() {
  return (
    <div className="space-y-4">
      {[
        "Reforzar la condición de salida antes del post-test.",
        "Añadir una variante contextual sobre bucles indefinidos.",
        "Revisar el material del subtema Bucle while.",
      ].map((recommendation) => (
        <article
          key={recommendation}
          className="flex gap-3 rounded-lg border border-border bg-card p-5"
        >
          <Lightbulb className="size-5 shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground">Hipótesis de mejora</p>
            <p className="mt-1 text-sm">{recommendation}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export const Setup = NewCourseWizard;
export const Monitor = CourseDashboard;
