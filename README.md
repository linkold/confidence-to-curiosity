# Confidence To Curiosity

Build a complete, interactive, single-page React application for an EdTech platform called "CogniCheck". The app prevents "cognitive offloading" by using a socratic AI tutor.

Visual Theme:

- Strict Dark Mode. Main background: #0c0a15. Surface/Card backgrounds: #13111c. Primary accent color: #b388ff. Text: mostly gray-300 and white. 

- Use Tailwind CSS and Lucide React icons. 

State Management: 

Create a main state `currentScreen` starting at 'pre-test', moving to 'chat', then 'post-test', and finally 'dashboard'.

Screen 1: Pre-Test (currentScreen === 'pre-test')

- Title: "Diagnóstico Inicial"

- Question: "¿Cuál es la diferencia estructural principal entre un bucle while y un for?"

- 3 clickable option cards (A, B, C). Option B ("No hay diferencia, ambos se usan exactamente para lo mismo") should be highlighted as selected.

- A range slider (1 to 5) labeled "Nivel de confianza en tu respuesta".

- A primary button "Enviar Respuesta" that sets currentScreen to 'chat'.

Screen 2: Socratic Chat (currentScreen === 'chat')

- Split screen layout. 

- LEFT SIDE: Shows the user's wrong answer in red, their high confidence score, and a warning: "Brecha conceptual detectada. Debes interactuar con el Tutor Socrático para avanzar."

- RIGHT SIDE: A functional chat UI. 

- CHAT LOGIC (CRITICAL): The chat calls the same-origin Vercel Serverless Function at `/api/chat`. Start with an AI message: "Modo Socrático Activado. Noté que fallaste en la pregunta sobre bucles. ¿Qué concepto te está bloqueando?".

- When the user types in the input and hits Send, render their message instantly. Then, trigger a setTimeout for 1.5 seconds and render this AI response: "Esa es la parte que quiero que razones. Piensa en el límite de iteraciones: ¿qué bucle usas cuando no sabes cuántas veces se repetirá el código?". 

- If the user sends a second message, wait 1.5 seconds and render: "Exacto. Ahora reformula cuándo es peligroso usar un while sin condición de salida clara."

- After 2 user messages, display a button below the chat: "Concepto Reformulado - Ir al Post-Test", which sets currentScreen to 'post-test'.

Screen 3: Post-Test Success (currentScreen === 'post-test')

- A large green check icon. Title: "¡Aprendizaje Validado!". 

- Subtitle: "Resolviste la variante B del problema sin asistencia de IA."

- Button: "Ver Panel del Profesor" which sets currentScreen to 'dashboard'.

Screen 4: Teacher Dashboard (currentScreen === 'dashboard')

- Title: "Panel Analítico del Docente"

- 3 stat cards: "85% Fallo Pre-Test", "2.4 Pistas Promedio", "92% Conversión Post-Test" (highlight this in green).

- A table of students. Columns: Estudiante, Pistas Usadas, Intentos de Copiar, Estado.

- Row 1: "Lincoln Haziel Chagua Bustos (20244108J)", Pistas: 2, Intentos: 1, Estado: "Validado" (Green text).

- Row 2: "Alumno Prueba B", Pistas: 4, Intentos: 3, Estado: "Requiere Humano" (Red text).

Ensure the UI is polished, responsive, and transitions smoothly between states. All UI text must be exactly in Spanish as provided.

## Vercel and Groq

The backend lives in [`api/chat.ts`](./api/chat.ts) and is deployed automatically as `/api/chat` by Vercel. It accepts `POST` requests with a `historial` array, calls Groq with a strict Spanish Socratic system prompt, and returns `{ respuesta }`.

Copy [`.env.example`](./.env.example) to `.env.local` for local development. The API accepts either `GROQ_API_KEY` (recommended) or `GROQ_API`. Set the selected variable in Vercel under Settings → Environment Variables. Keep Groq and the Neon `DATABASE_URL` server-side; do not prefix them with `VITE_`. Run `neon/schema.sql` in Neon before using persistence.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/23f6f6ea-e1f3-43ee-99cf-899680ecd840).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
