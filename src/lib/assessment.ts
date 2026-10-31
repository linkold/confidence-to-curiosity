export type Question = {
  prompt: string;
  options: { k: string; t: string }[];
  correct: string;
  hints: [string, string];
};

export const FINAL_QUESTIONS: Question[] = [
  {
    prompt: "Si necesitas leer un archivo de texto hasta encontrar una línea vacía, ¿qué bucle es estructuralmente más seguro?",
    options: [
      { k: "A", t: "Un bucle for, porque siempre recorre un número fijo de líneas." },
      { k: "B", t: "Un bucle while, porque la salida depende de una condición (encontrar la línea vacía) y no de un conteo conocido." },
      { k: "C", t: "Da igual; cualquier bucle produce el mismo resultado." },
    ],
    correct: "B",
    hints: [
      "Antes de leer el archivo, ¿sabes cuántas líneas habrá hasta la primera línea vacía? ¿Qué debería decidir si continúas leyendo?",
      "Reformula con tus palabras cómo una condición de salida puede detener la lectura sin conocer el número de líneas.",
    ],
  },
  {
    prompt: "Necesitas mostrar los números del 1 al 10. ¿Qué bucle expresa mejor este recorrido conocido?",
    options: [
      { k: "A", t: "Un for con un contador que avanza del 1 al 10." },
      { k: "B", t: "Un while cuya condición nunca cambia." },
      { k: "C", t: "Un bucle sin condición de salida." },
    ],
    correct: "A",
    hints: [
      "¿Cuántas repeticiones necesitas? ¿Cómo representarías el inicio, el límite y el avance del contador?",
      "Explica con tus palabras por qué un contador con un límite conocido encaja con este recorrido.",
    ],
  },
  {
    prompt: "En un while, la condición sigue siendo verdadera y ninguna instrucción la modifica. ¿Qué puede ocurrir?",
    options: [
      { k: "A", t: "El bucle termina automáticamente después de diez repeticiones." },
      { k: "B", t: "El bucle se ejecuta solo una vez." },
      { k: "C", t: "El bucle puede repetirse indefinidamente." },
    ],
    correct: "C",
    hints: [
      "Si la condición sigue siendo verdadera después de cada vuelta, ¿qué haría que el bucle se detuviera?",
      "Propón una actualización o una condición de salida que impida repetir el código indefinidamente.",
    ],
  },
  {
    prompt: "La condición de un while es falsa antes de empezar. ¿Cuántas veces se ejecuta su cuerpo?",
    options: [
      { k: "A", t: "Una vez, porque todo bucle debe ejecutarse al menos una vez." },
      { k: "B", t: "Ninguna, porque la condición se comprueba antes de entrar." },
      { k: "C", t: "Infinitas veces, porque no puede comprobar la condición." },
    ],
    correct: "B",
    hints: [
      "¿En qué momento comprueba un while su condición: antes o después de ejecutar el cuerpo?",
      "Reformula qué sucede cuando la primera comprobación de la condición ya es falsa.",
    ],
  },
];

export function assessAnswer(index: number, selected: string): "retry" | "next" | "success" {
  const question = FINAL_QUESTIONS[index];
  if (!question || selected !== question.correct) return "retry";
  return index === FINAL_QUESTIONS.length - 1 ? "success" : "next";
}