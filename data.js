// Preguntas guía para evaluar Booking.com
// Sin definiciones: solo preguntas. La respuesta es el multiple choice;
// la referencia de captura de pantalla es opcional.

window.DATASETS = {
  leyes: {
    id: "leyes",
    title: "Leyes UX",
    tagline: "14 leyes · evaluación de Booking.com",
    emoji: "📐",
    scale: [
      { value: "cumple", label: "Cumple", weight: 1 },
      { value: "parcial", label: "Cumple parcialmente", weight: 0.5 },
      { value: "rompe", label: "No cumple / Se rompe", weight: 0 },
      { value: "na", label: "No aplica / No observado", weight: null },
    ],
    questions: [
      {
        id: "jakob",
        name: "Ley de Jakob",
        q: "¿Booking se comporta de forma predecible respecto a otros sitios de reservas y de e-commerce que la persona ya conoce (ubicación del buscador, del login, de “Mis reservas” y de los filtros)?",
      },
      {
        id: "fitts",
        name: "Ley de Fitts",
        q: "¿Los controles de acción principal (“Buscar”, selección de fechas, “Reservar ahora”) son suficientemente grandes y están cerca de donde la persona los necesita?",
      },
      {
        id: "hick",
        name: "Ley de Hick",
        q: "En la página de resultados, ¿la cantidad de filtros, ordenamientos y opciones visibles a la vez entorpece la toma de decisión?",
      },
      {
        id: "miller",
        name: "Ley de Miller",
        q: "¿Booking divide la información de cada alojamiento en bloques cortos (precio, puntuación, servicios) en lugar de listas largas difíciles de retener?",
      },
      {
        id: "tesler",
        name: "Ley de Tesler",
        q: "En el flujo de reserva, ¿Booking absorbe la complejidad (autocompletar destino, fechas sugeridas, datos guardados) o se la traslada a la persona usuaria?",
      },
      {
        id: "posicion-serial",
        name: "Efecto de posición serial",
        q: "¿Los elementos más importantes (buscar, mejores resultados, precio total) están al principio o al final de las listas, donde más se recuerdan?",
      },
      {
        id: "von-restorff",
        name: "Efecto Von Restorff",
        q: "¿Los elementos que Booking quiere destacar (ofertas, “¡Solo quedan 2!”, botón de reservar) se diferencian visualmente del resto?",
      },
      {
        id: "doherty",
        name: "Umbral de Doherty",
        q: "¿Las respuestas del sistema (cargar resultados, aplicar filtros, abrir una ficha) ocurren de forma casi inmediata o con feedback que evita la sensación de espera?",
      },
      {
        id: "estetica-usabilidad",
        name: "Efecto estético-usabilidad",
        q: "¿El diseño visual de Booking transmite suficiente calidad como para que la persona lo perciba como fácil de usar y confiable?",
      },
      {
        id: "pragnanz",
        name: "Ley de Prägnanz",
        q: "¿Las pantallas de Booking se leen como formas simples y ordenadas, sin ruido visual que obligue a esfuerzo para interpretarlas?",
      },
      {
        id: "proximidad",
        name: "Ley de proximidad",
        q: "¿Los datos relacionados de cada alojamiento (nombre, ubicación, puntuación, precio) están lo bastante cerca como para percibirse como una unidad?",
      },
      {
        id: "similitud",
        name: "Ley de similitud",
        q: "¿Los elementos que cumplen la misma función (botones, enlaces, etiquetas de filtro) se ven consistentes entre sí?",
      },
      {
        id: "region-comun",
        name: "Ley de la región común",
        q: "¿Booking usa tarjetas, recuadros o fondos para delimitar cada alojamiento y cada grupo de filtros?",
      },
      {
        id: "peak-end",
        name: "Regla del pico y el final",
        q: "¿El momento pico (encontrar el alojamiento ideal) y el cierre del flujo (confirmación de la reserva) dejan una impresión positiva?",
      },
    ],
  },

  heuristicas: {
    id: "heuristicas",
    title: "Heurísticas de Nielsen",
    tagline: "10 heurísticas · escala 0 a 4",
    emoji: "🔍",
    scale: [
      { value: "0", label: "0 · Sin problema — se cumple", weight: 0 },
      { value: "1", label: "1 · Cosmético", weight: 1 },
      { value: "2", label: "2 · Prioridad media", weight: 2 },
      { value: "3", label: "3 · Prioridad alta", weight: 3 },
      { value: "4", label: "4 · Catástrofe de usabilidad", weight: 4 },
    ],
    questions: [
      {
        id: "h1",
        name: "1. Visibilidad del estado del sistema",
        q: "Durante la búsqueda y la reserva, ¿Booking informa con claridad en qué paso está la persona, si algo está cargando y si la acción se completó?",
      },
      {
        id: "h2",
        name: "2. Correspondencia entre el sistema y el mundo real",
        q: "¿Booking usa lenguaje y conceptos familiares para quien viaja (fechas, huéspedes, “desayuno incluido”, “cancelación gratis”) en lugar de términos internos del sistema?",
      },
      {
        id: "h3",
        name: "3. Control y libertad del usuario",
        q: "¿La persona puede deshacer o rehacer con facilidad: cambiar fechas, quitar filtros, volver atrás, cancelar una reserva?",
      },
      {
        id: "h4",
        name: "4. Consistencia y estándares",
        q: "¿Los patrones, íconos y textos se mantienen consistentes entre las pantallas de Booking y respecto de las convenciones de la industria?",
      },
      {
        id: "h5",
        name: "5. Prevención de errores",
        q: "¿Booking evita que la persona cometa errores: valida fechas imposibles, avisa antes de reservas no reembolsables, restringe campos?",
      },
      {
        id: "h6",
        name: "6. Reconocer antes que recordar",
        q: "¿Booking mantiene visible la información necesaria (destino y fechas elegidas, filtros activos) para que la persona no tenga que recordarla?",
      },
      {
        id: "h7",
        name: "7. Flexibilidad y eficiencia de uso",
        q: "¿Hay aceleradores para usuarios expertos: búsquedas recientes, favoritos, datos de pago guardados, filtros rápidos?",
      },
      {
        id: "h8",
        name: "8. Diseño estético y minimalista",
        q: "¿Las pantallas evitan información irrelevante, banners y mensajes de urgencia que compiten con el contenido principal?",
      },
      {
        id: "h9",
        name: "9. Ayudar a reconocer, diagnosticar y recuperarse de los errores",
        q: "Cuando algo falla (pago rechazado, sin disponibilidad, campo vacío), ¿el mensaje explica en lenguaje claro qué pasó y cómo resolverlo?",
      },
      {
        id: "h10",
        name: "10. Ayuda y documentación",
        q: "¿La ayuda, el centro de atención al cliente y las políticas son fáciles de encontrar y están orientadas a la tarea de la persona usuaria?",
      },
    ],
  },
};
