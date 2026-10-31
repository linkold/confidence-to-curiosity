# Confidence To Curiosity

Build a complete, interactive, single-page React application for an EdTech platform called "CogniCheck". The app prevents "cognitive offloading" by using a socratic AI tutor. I need a functional prototype using React state to navigate between 4 screens without a backend.

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

- CHAT LOGIC (CRITICAL): Do not connect to an API. Start with an AI message: "Modo Socrático Activado. Noté que fallaste en la pregunta sobre bucles. ¿Qué concepto te está bloqueando?". 

- When the user types in the input and hits Send, render their message instantly. Then, trigger a setTimeout for 1.5 seconds and render this AI response: "Esa es la parte que quiero que razones. Piensa en el límite de iteraciones: ¿qué bucle usas cuando no sabes cuántas veces se repetirá el código?". 

- If the user sends a second message, wait 1.5 seconds and render: "Exacto. Ahora reformula cuándo es peligroso usar un while sin condición de salida clara."

- After 2 user messages, display a button below the chat: "Concepto Reformulado - Ir al Post-Test", which sets currentScreen to 'post-test'.

Screen 3: Post-Test Success (currentScreen === 'post-test')

- A large green check icon. Title: "¡Aprendizaje Validado!". 

- Subtitle: "Resolviste la variante B del problema sin asistencia de IA."

- Button: "Ver Panel del Profesor (Simulación)" which sets currentScreen to 'dashboard'.

Screen 4: Teacher Dashboard (currentScreen === 'dashboard')

- Title: "Panel Analítico del Docente"

- 3 stat cards: "85% Fallo Pre-Test", "2.4 Pistas Promedio", "92% Conversión Post-Test" (highlight this in green).

- A table of students. Columns: Estudiante, Pistas Usadas, Intentos de Copiar, Estado.

- Row 1: "Lincoln Haziel Chagua Bustos (20244108J)", Pistas: 2, Intentos: 1, Estado: "Validado" (Green text).

- Row 2: "Alumno Prueba B", Pistas: 4, Intentos: 3, Estado: "Requiere Humano" (Red text).

Ensure the UI is polished, responsive, and transitions smoothly between states. All UI text must be exactly in Spanish as provided.

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
