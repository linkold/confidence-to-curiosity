# CogniCheck

Aplicación React con TanStack Start para sesiones de aprendizaje guiadas por un tutor socrático. El backend usa funciones Node.js de Vercel, Groq para el tutor y Neon Postgres para cursos y eventos.

## Desarrollo local

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env.local` y completa las variables privadas.
3. Ejecuta `neon/schema.sql` una vez en el SQL Editor de Neon.
4. Inicia el entorno con `npx vercel dev` para que `/api/*` también esté disponible localmente.

## Variables de entorno

Configura en `.env.local` para desarrollo y en Vercel → Settings → Environment Variables para cada entorno:

- `DATABASE_URL`: cadena de conexión Postgres de Neon.
- `GROQ_API_KEY`: clave privada de Groq. `GROQ_API` se acepta por compatibilidad.
- `GROQ_MODEL`: opcional; predeterminado `openai/gpt-oss-120b`.

No uses prefijo `VITE_` para secretos. Las variables antiguas de Supabase ya no las consume el backend.

## API

- `POST /api/chat`: recibe `{ historial: [{ role, content }] }` y responde `{ respuesta }`.
- `GET /api/courses`: devuelve cursos persistidos en Neon.
- `GET /api/courses?sessionCode=...`: verifica un código de acceso.
- `POST /api/courses`: crea un curso con temas, preguntas y configuración del tutor.
- `POST /api/events`: registra eventos de aprendizaje.
- `GET /api/health/neon`: comprueba la conexión y el esquema de Neon.

El código `847291` identifica el único curso de demostración; sus métricas son ficticias y están aisladas de los cursos reales.

## Comprobaciones

- `npx tsc --noEmit`: verificación de tipos.
- `npm run build`: compilación para Vercel.

En producción, revisa Vercel → Logs si una función responde con error. Los registros persistentes requieren que `DATABASE_URL` esté configurada y que el esquema de Neon esté aplicado.
