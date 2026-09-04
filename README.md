# Evaluación UX de Booking.com

Dos tableros para evaluar **Booking.com**, hechos con ayuda de herramientas de IA a partir del
material de la materia (Gestalt, Leyes UX y Heurísticas de Nielsen):

- **Leyes UX** — 14 leyes, escala: *Cumple / Cumple parcialmente / No cumple / No aplica*.
- **Heurísticas de Nielsen** — 10 heurísticas, escala de severidad **0 a 4**
  (0 = se cumple · 1 = cosmético · 2 = media · 3 = alta · 4 = catástrofe).

## Cómo funciona

- La página inicial tiene **dos tarjetas** (una por tablero), cada una con su **calificación** en vivo.
- Cada pregunta se responde **de a una**: al elegir una opción aparece el botón para pasar a la siguiente.
- Las preguntas son solo eso, **preguntas** (sin definiciones).
- La respuesta es únicamente el **multiple choice**; la **referencia de captura de pantalla es opcional**.
- El progreso se guarda en el navegador (`localStorage`).
- Botón **“Descargar PDF”** (arriba a la derecha y en cada resumen): exporta todo lo respondido
  a `evaluacion-ux-booking.pdf`.

## Correr localmente

```bash
python3 -m http.server 4173
```

Abrir http://localhost:4173

No hay build: son archivos estáticos (`index.html`, `styles.css`, `app.js`, `data.js`,
`vendor/jspdf.umd.min.js`).

## Deploy en Vercel

1. Importar este repo en Vercel.
2. Framework preset: **Other**. Build command: *(vacío)*. Output directory: `.` (raíz).
3. Deploy.

## Archivos

| Archivo | Rol |
|---|---|
| `index.html` | Estructura y carga de scripts |
| `styles.css` | Estilos |
| `data.js` | Las 14 leyes + 10 heurísticas con sus preguntas y escalas |
| `app.js` | Router, flujo pregunta-por-pregunta, puntajes y export a PDF |
| `vendor/jspdf.umd.min.js` | jsPDF (incluido, sin CDN) |
