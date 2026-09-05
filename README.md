# Evaluación UX de Booking.com

Dos **tableros de evaluación** sobre **Booking.com**, hechos con asistencia de IA generativa de
código (Claude Code), desplegados como una mini-web estática en Vercel. Un solo proyecto con dos
secciones.

Cada tablero funciona como un **documento de evaluación navegable**: por cada ley o heurística
muestra el **hallazgo** (veredicto / severidad), la **evidencia** (captura) y el **análisis
escrito**. No hay backend: el contenido lo completa el equipo con su análisis real y queda
guardado en el navegador (`localStorage`).

## Tablero 1 · Leyes UX

- Checklist con las **14 leyes** de la ficha de referencia rápida.
- Cobertura mínima sugerida: **8 de 14** documentadas con evidencia real (cumplida o rota).
- Por cada ley: **nombre** · **Cumple / Rompe** · **captura** del punto exacto ·
  **explicación** de 1–2 frases que responde la pregunta guía (qué pasa y por qué).

## Tablero 2 · Heurísticas de Nielsen

- Evaluación heurística completa: **las 10 heurísticas, sin excepción**.
- Por cada heurística: **nombre** · **severidad 0–4** (0 no es problema · 1 cosmético ·
  2 menor · 3 mayor · 4 catástrofe) · **captura** del punto de dolor (severidad ≥ 1) o del
  punto donde se cumple bien (severidad 0) · **explicación**: qué pasa, por qué rompe o
  cumple, y qué impacto tiene en la persona usuaria.

## Cómo se usa

1. **Pantalla inicial:** dos tarjetas (una por tablero) con la **calificación final** en vivo.
2. **Completar:** una pregunta por vez; recién al elegir el veredicto/severidad se habilita
   “Siguiente”. Se agrega captura (imagen + nota) y la explicación.
3. **Ver tablero:** documento navegable con índice, badges de color y evidencia.
4. **Descargar PDF:** botón arriba a la derecha y en cada tablero → `evaluacion-ux-booking.pdf`
   con las 14 leyes + 10 heurísticas, veredicto, explicación y capturas embebidas.

## Correr localmente

```bash
python3 -m http.server 4173
```

Abrir http://localhost:4173 · Sin build: archivos estáticos.

| Archivo | Rol |
|---|---|
| `index.html` | Estructura y carga de scripts |
| `styles.css` | Estilos |
| `data.js` | Las 14 leyes + 10 heurísticas con sus preguntas guía y escalas |
| `app.js` | Router, flujo pregunta-por-pregunta, tablero navegable, export a PDF |
| `vendor/jspdf.umd.min.js` | jsPDF incluido (sin CDN) |
| `prompts_leyes_heuristicas.md` | Plantilla del documento de prompts (copiar al Drive del equipo) |

## Deploy en Vercel

Framework Preset **Other**, sin build command. `vercel.json` ya fija el sitio como estático
(`outputDirectory: "."`). Cada `git push` a `main` redeploya.

## Entregables

- Link al tablero desplegado en Vercel.
- Link a este repositorio en GitHub.
- Documento `prompts_leyes_heuristicas` en el Drive del equipo (partir de la plantilla incluida).
