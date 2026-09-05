# prompts_leyes_heuristicas

Documento de prompts usados para construir los dos tableros de evaluación (Leyes UX y
Heurísticas de Nielsen) sobre Booking.com.

> Subir al Drive del equipo con este nombre exacto: **prompts_leyes_heuristicas**.
> Por cada prompt relevante: herramienta de IA, objetivo, prompt completo (texto exacto),
> y resultado + ajustes. Completar / ampliar los campos "Resultado y ajustes" con lo que
> efectivamente vieron y corrigieron.

---

## Prompt 1 — Base del proyecto y primer armado del tablero

- **Herramienta de IA usada:** Claude Code (Claude Sonnet)
- **Objetivo del prompt:** crear la mini-web con dos secciones (Leyes UX y Heurísticas de
  Nielsen) sobre Booking, con pantalla inicial de dos tarjetas y su calificación, flujo de una
  pregunta por vez, sin definiciones, respuesta multiple choice + captura opcional, resultados
  finales y descarga en PDF.
- **Prompt completo:**

  > En base a lo que está en este PDF, Usando herramientas de inteligencia artificial, cada
  > equipo deberá crear dos tableros: uno para las leyes UX y otro para heurísticas de Nielsen.
  > Hacé esto pero de Booking. Permitime descargarlo para exportar y para que yo pueda resolver
  > las preguntas. Me gustaria que la pagina inicial tenga dos tarjetas: una para las leyes ux y
  > otra para las heuristicas de Nielsen. Ambas tienen que tenes las calificaciones
  > correspondientes. Quiero que cada pregunta esté separada, es decir, que cuando responda una
  > ahí recien pase a la siguiente. No pongas la definición de cada uno, pone simplemente
  > preguntas. Hacé que pueda descargarlo en formato PDF. Que de respuesta este solo el multiple
  > choice y la referencia de captura de pantalla como opcional.

- **Resultado y ajustes:** generó `index.html`, `styles.css`, `data.js`, `app.js` y vendorizó
  jsPDF para la descarga sin depender de un CDN. Las 14 leyes se armaron a partir de las que
  nombra el PDF (Hick, Fitts, Tesler, Jakob, Miller) completando el resto con la lista estándar
  de Laws of UX. _(Ampliar: qué revisaron / cambiaron.)_

## Prompt 2 — Deploy en GitHub + Vercel

- **Herramienta de IA usada:** Claude Code
- **Objetivo del prompt:** inicializar el repo y publicarlo; luego resolver el error de deploy.
- **Prompt completo:**

  > commit y push
  >
  > (y más tarde, ante el error de Vercel) a la pagina que hiciste, … me aparece 404: NOT_FOUND

- **Resultado y ajustes:** se creó el repo, se pusheó a GitHub y se agregó `vercel.json` con
  `outputDirectory: "."` para servir el sitio como estático y resolver el `404: NOT_FOUND`.
  _(Ampliar: config final del proyecto en Vercel.)_

## Prompt 3 — Ajuste del tablero a la consigna definitiva

- **Herramienta de IA usada:** Claude Code
- **Objetivo del prompt:** adaptar la web a las aclaraciones de la cátedra: cada tablero como
  documento navegable con hallazgo + evidencia (captura) + análisis escrito; leyes con veredicto
  Cumple/Rompe y mínimo 8 de 14; heurísticas con las 10 completas y severidad 0–4; explicación
  por ítem; y descarga de todo en PDF. Sin autocompletar respuestas.
- **Prompt completo:**

  > En base al PDF, creá una web interactiva sobre Booking con dos secciones: "Leyes UX" y
  > "Heurísticas de Nielsen". … (consigna completa con "Qué tienen que crear", "Tablero 1: leyes
  > UX", "Tablero 2: heurísticas de Nielsen", "Documento de prompts" y "Entregables").
  > No completes las respuestas automáticamente, dejá todo preparado para que yo lo responda.

- **Resultado y ajustes:** se cambió la escala de leyes a binaria (Cumple / Rompe), la de
  heurísticas a 0–4 con las etiquetas de la consigna (menor / mayor), se agregó campo de
  **explicación** y **carga de imagen** por ítem (con compresión antes de guardar), y una vista
  de **tablero navegable** con índice. El PDF ahora embebe las capturas.
  _(Ampliar: qué quedó pendiente / qué se retocó a mano.)_

---

## Prompts propios del equipo (evaluación real)

_(Agregar acá los prompts que el equipo use para redactar hallazgos, contrastar criterios de
severidad, revisar el análisis de cada ley/heurística, etc. Incluir texto exacto y qué se
ajustó.)_

- **Herramienta de IA usada:**
- **Objetivo del prompt:**
- **Prompt completo:**
- **Resultado y ajustes:**
