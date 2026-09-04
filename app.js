(function () {
  "use strict";

  var DATASETS = window.DATASETS;
  var STORE_KEY = "booking-ux-eval-v1";
  var app = document.getElementById("app");

  /* ---------- estado ---------- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { leyes: {}, heuristicas: {} };
      var parsed = JSON.parse(raw);
      return {
        leyes: parsed.leyes || {},
        heuristicas: parsed.heuristicas || {},
      };
    } catch (e) {
      return { leyes: {}, heuristicas: {} };
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  var state = loadState();

  function getAnswer(dsId, qId) {
    return (state[dsId] && state[dsId][qId]) || null;
  }
  function setAnswer(dsId, qId, patch) {
    if (!state[dsId]) state[dsId] = {};
    var cur = state[dsId][qId] || {};
    state[dsId][qId] = Object.assign({}, cur, patch);
    saveState(state);
  }

  /* ---------- helpers de puntaje ---------- */
  function scaleLabel(ds, value) {
    for (var i = 0; i < ds.scale.length; i++) {
      if (ds.scale[i].value === value) return ds.scale[i].label;
    }
    return value;
  }

  function computeScore(ds) {
    var answers = state[ds.id] || {};
    var total = ds.questions.length;
    var answered = 0;
    var counts = {};
    ds.scale.forEach(function (s) { counts[s.value] = 0; });

    ds.questions.forEach(function (q) {
      var a = answers[q.id];
      if (a && a.answer) {
        answered++;
        if (counts[a.answer] != null) counts[a.answer]++;
      }
    });

    var result = { total: total, answered: answered, counts: counts };

    if (ds.id === "leyes") {
      var considered = 0, sum = 0;
      ds.scale.forEach(function (s) {
        if (s.weight == null) return;
        considered += counts[s.value];
        sum += counts[s.value] * s.weight;
      });
      result.compliance = considered ? Math.round((sum / considered) * 100) : null;
    } else {
      var sev = 0, n = 0;
      ds.scale.forEach(function (s) {
        sev += counts[s.value] * s.weight;
        n += counts[s.value];
      });
      result.avgSeverity = n ? Math.round((sev / n) * 10) / 10 : null;
    }
    return result;
  }

  function severityToneForLeyes(value) {
    if (value === "cumple") return "good";
    if (value === "parcial") return "warn";
    if (value === "rompe") return "bad";
    return "muted";
  }
  function severityToneForHeur(value) {
    var n = parseInt(value, 10);
    if (n <= 0) return "good";
    if (n === 1 || n === 2) return "warn";
    return "bad";
  }
  function toneFor(dsId, value) {
    return dsId === "leyes" ? severityToneForLeyes(value) : severityToneForHeur(value);
  }

  /* ---------- render: home ---------- */
  function renderHome() {
    var frag = document.createElement("div");

    var intro = el("div", "home-intro");
    intro.innerHTML =
      "<h1>Evaluación de Booking.com</h1>" +
      "<p>Elegí un tablero. Cada pregunta se responde de a una: al contestar, aparece la siguiente. La respuesta es el multiple choice; la captura de pantalla es opcional.</p>";
    frag.appendChild(intro);

    var cards = el("div", "cards");
    ["leyes", "heuristicas"].forEach(function (id) {
      cards.appendChild(buildCard(DATASETS[id]));
    });
    frag.appendChild(cards);

    render(frag);
  }

  function buildCard(ds) {
    var sc = computeScore(ds);
    var card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.addEventListener("click", function () {
      location.hash = "#/q/" + ds.id;
    });

    var scoreMain, scoreSub;
    if (ds.id === "leyes") {
      scoreMain = sc.compliance == null ? "Sin evaluar" : sc.compliance + "% de cumplimiento";
      scoreSub = sc.answered + " de " + sc.total + " leyes respondidas";
    } else {
      scoreMain = sc.avgSeverity == null ? "Sin evaluar" : sc.avgSeverity + " / 4 severidad media";
      scoreSub = sc.answered + " de " + sc.total + " heurísticas respondidas";
    }

    var pills = ds.scale
      .map(function (s) {
        return '<span class="pill">' + shortLabel(s.label) + ": " + sc.counts[s.value] + "</span>";
      })
      .join("");

    card.innerHTML =
      '<div class="card-emoji">' + ds.emoji + "</div>" +
      "<h2>" + ds.title + "</h2>" +
      '<p class="card-tag">' + ds.tagline + "</p>" +
      '<div class="score-box">' +
      '<div class="score-main">' + scoreMain + "</div>" +
      '<div class="score-sub">' + scoreSub + "</div>" +
      '<div class="pill-row">' + pills + "</div>" +
      "</div>" +
      '<div class="card-cta">' + (sc.answered ? "Continuar la evaluación →" : "Comenzar la evaluación →") + "</div>";

    return card;
  }

  function shortLabel(label) {
    // "0 · Sin problema — se cumple" -> "0" ; "Cumple parcialmente" -> "Cumple parcialmente"
    if (/^\d/.test(label)) return label.split(" ")[0];
    return label;
  }

  /* ---------- render: quiz (una pregunta por vez) ---------- */
  function renderQuiz(dsId, step) {
    var ds = DATASETS[dsId];
    if (!ds) return renderHome();

    var total = ds.questions.length;
    step = Math.max(0, Math.min(step, total - 1));
    var q = ds.questions[step];
    var current = getAnswer(dsId, q.id) || {};

    var frag = document.createElement("div");

    var head = el("div", "quiz-head");
    head.innerHTML =
      "<h1>" + ds.title + "</h1>" +
      '<span class="counter">Pregunta ' + (step + 1) + " de " + total + "</span>";
    frag.appendChild(head);

    var track = el("div", "progress-track");
    var fill = el("div", "progress-fill");
    fill.style.width = ((step) / total) * 100 + "%";
    track.appendChild(fill);
    frag.appendChild(track);

    var qCard = el("div", "q-card");

    var eyebrow = el("p", "q-eyebrow");
    eyebrow.textContent = q.name;
    qCard.appendChild(eyebrow);

    var qText = el("p", "q-text");
    qText.textContent = q.q;
    qCard.appendChild(qText);

    var opts = el("div", "options");
    ds.scale.forEach(function (s) {
      var optId = dsId + "-" + q.id + "-" + s.value;
      var label = document.createElement("label");
      label.className = "option" + (current.answer === s.value ? " selected" : "");
      label.setAttribute("for", optId);
      label.innerHTML =
        '<input type="radio" id="' + optId + '" name="opt" value="' + s.value + '"' +
        (current.answer === s.value ? " checked" : "") + " />" +
        "<span>" + s.label + "</span>";
      label.querySelector("input").addEventListener("change", function () {
        setAnswer(dsId, q.id, { answer: s.value });
        renderQuiz(dsId, step); // re-render para habilitar "Siguiente"
      });
      opts.appendChild(label);
    });
    qCard.appendChild(opts);

    var shot = el("div", "shot-field");
    shot.innerHTML =
      '<label for="shot">Referencia de captura de pantalla ' +
      '<span class="hint">(opcional)</span></label>' +
      '<input type="text" id="shot" placeholder="Ej.: captura_03.png / “resultados con 12 filtros”" />';
    var shotInput = shot.querySelector("input");
    shotInput.value = current.shot || "";
    shotInput.addEventListener("input", function () {
      setAnswer(dsId, q.id, { shot: shotInput.value.trim() });
    });
    qCard.appendChild(shot);

    frag.appendChild(qCard);

    var nav = el("div", "quiz-nav");

    var backBtn = document.createElement("button");
    backBtn.className = "btn btn-secondary";
    backBtn.type = "button";
    backBtn.textContent = step === 0 ? "Volver al inicio" : "Anterior";
    backBtn.addEventListener("click", function () {
      if (step === 0) location.hash = "#/";
      else renderQuiz(dsId, step - 1);
    });
    nav.appendChild(backBtn);

    var nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-primary";
    nextBtn.type = "button";
    nextBtn.disabled = !getAnswer(dsId, q.id) || !getAnswer(dsId, q.id).answer;
    nextBtn.textContent = step === total - 1 ? "Finalizar" : "Siguiente";
    nextBtn.addEventListener("click", function () {
      if (step === total - 1) location.hash = "#/resumen/" + dsId;
      else renderQuiz(dsId, step + 1);
    });
    nav.appendChild(nextBtn);

    frag.appendChild(nav);

    render(frag);
  }

  /* ---------- render: resumen ---------- */
  function renderSummary(dsId) {
    var ds = DATASETS[dsId];
    if (!ds) return renderHome();
    var sc = computeScore(ds);

    var frag = document.createElement("div");

    var head = el("div", "summary-head");
    head.innerHTML =
      "<h1>Resumen · " + ds.title + "</h1>" +
      "<p>Producto evaluado: Booking.com</p>";
    frag.appendChild(head);

    var box = el("div", "summary-score");
    if (dsId === "leyes") {
      box.innerHTML =
        '<div class="score-main">' +
        (sc.compliance == null ? "Sin evaluar" : sc.compliance + "% de cumplimiento") +
        "</div>" +
        '<div class="score-sub">' + sc.answered + " de " + sc.total + " leyes respondidas · " +
        "Cumple " + sc.counts.cumple + " · Parcial " + sc.counts.parcial +
        " · Se rompe " + sc.counts.rompe + " · N/A " + sc.counts.na + "</div>";
    } else {
      box.innerHTML =
        '<div class="score-main">' +
        (sc.avgSeverity == null ? "Sin evaluar" : sc.avgSeverity + " / 4 severidad media") +
        "</div>" +
        '<div class="score-sub">' + sc.answered + " de " + sc.total + " heurísticas respondidas · " +
        "0: " + sc.counts["0"] + " · 1: " + sc.counts["1"] + " · 2: " + sc.counts["2"] +
        " · 3: " + sc.counts["3"] + " · 4: " + sc.counts["4"] + "</div>";
    }
    frag.appendChild(box);

    var list = el("div", "answer-list");
    ds.questions.forEach(function (q) {
      var a = getAnswer(dsId, q.id) || {};
      var row = el("div", "answer-row");
      var meta;
      if (a.answer) {
        meta =
          '<span class="tag ' + toneFor(dsId, a.answer) + '">' + scaleLabel(ds, a.answer) + "</span>" +
          (a.shot
            ? '<span class="ar-shot">📎 ' + escapeHtml(a.shot) + "</span>"
            : '<span class="ar-shot">Sin captura</span>');
      } else {
        meta = '<span class="ar-missing">Sin responder</span>';
      }
      row.innerHTML =
        '<div class="ar-name">' + q.name + "</div>" +
        '<div class="ar-q">' + q.q + "</div>" +
        '<div class="ar-meta">' + meta + "</div>";
      list.appendChild(row);
    });
    frag.appendChild(list);

    var actions = el("div", "summary-actions");

    var editBtn = document.createElement("button");
    editBtn.className = "btn btn-secondary";
    editBtn.type = "button";
    editBtn.textContent = "Revisar respuestas";
    editBtn.addEventListener("click", function () {
      location.hash = "#/q/" + dsId;
    });
    actions.appendChild(editBtn);

    var pdfBtn = document.createElement("button");
    pdfBtn.className = "btn btn-primary";
    pdfBtn.type = "button";
    pdfBtn.textContent = "Descargar PDF";
    pdfBtn.addEventListener("click", function () { exportPDF(); });
    actions.appendChild(pdfBtn);

    frag.appendChild(actions);

    var back = document.createElement("a");
    back.className = "back-link";
    back.href = "#/";
    back.textContent = "← Volver al inicio";
    frag.appendChild(back);

    render(frag);
  }

  /* ---------- exportar PDF ---------- */
  function exportPDF() {
    var jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDFCtor) {
      alert("No se pudo cargar el generador de PDF.");
      return;
    }
    var doc = new jsPDFCtor({ unit: "pt", format: "a4" });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var margin = 48;
    var maxW = pageW - margin * 2;
    var y = margin;

    function ensure(space) {
      if (y + space > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    }
    function line(text, opts) {
      opts = opts || {};
      doc.setFont("helvetica", opts.bold ? "bold" : "normal");
      doc.setFontSize(opts.size || 11);
      doc.setTextColor(opts.color || "#1b2130");
      var wrapped = doc.splitTextToSize(text, opts.width || maxW);
      for (var i = 0; i < wrapped.length; i++) {
        ensure((opts.size || 11) + 4);
        doc.text(wrapped[i], opts.x || margin, y);
        y += (opts.size || 11) + 4;
      }
    }
    function gap(h) { y += h || 8; }

    var now = new Date();
    var stamp = now.toLocaleDateString("es-AR") + " " + now.toLocaleTimeString("es-AR");

    line("Evaluación UX de Booking.com", { bold: true, size: 20 });
    gap(2);
    line("Tableros: Leyes UX y Heurísticas de Nielsen", { size: 11, color: "#5b6577" });
    line("Generado: " + stamp, { size: 10, color: "#5b6577" });
    gap(14);

    ["leyes", "heuristicas"].forEach(function (dsId) {
      var ds = DATASETS[dsId];
      var sc = computeScore(ds);

      ensure(60);
      line(ds.title, { bold: true, size: 15, color: "#003b95" });
      gap(2);
      if (dsId === "leyes") {
        line(
          "Cumplimiento: " +
            (sc.compliance == null ? "sin evaluar" : sc.compliance + "%") +
            "   |   Respondidas: " + sc.answered + "/" + sc.total +
            "   |   Cumple " + sc.counts.cumple + " · Parcial " + sc.counts.parcial +
            " · Se rompe " + sc.counts.rompe + " · N/A " + sc.counts.na,
          { size: 10, color: "#5b6577" }
        );
      } else {
        line(
          "Severidad media: " +
            (sc.avgSeverity == null ? "sin evaluar" : sc.avgSeverity + " / 4") +
            "   |   Respondidas: " + sc.answered + "/" + sc.total +
            "   |   0:" + sc.counts["0"] + " 1:" + sc.counts["1"] + " 2:" + sc.counts["2"] +
            " 3:" + sc.counts["3"] + " 4:" + sc.counts["4"],
          { size: 10, color: "#5b6577" }
        );
      }
      gap(10);

      ds.questions.forEach(function (q, idx) {
        var a = getAnswer(dsId, q.id) || {};
        ensure(48);
        line((idx + 1) + ". " + q.name, { bold: true, size: 11 });
        line(q.q, { size: 10, color: "#333c4d" });
        line("Respuesta: " + (a.answer ? scaleLabel(ds, a.answer) : "Sin responder"), {
          size: 10.5,
          bold: true,
          color: a.answer ? "#1b2130" : "#b42318",
        });
        line("Captura de pantalla: " + (a.shot ? a.shot : "—"), { size: 10, color: "#5b6577" });
        gap(8);
      });

      gap(10);
    });

    doc.save("evaluacion-ux-booking.pdf");
  }

  /* ---------- utilidades ---------- */
  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function render(node) {
    app.innerHTML = "";
    app.appendChild(node);
    window.scrollTo(0, 0);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- router ---------- */
  function route() {
    var hash = location.hash || "#/";
    var parts = hash.replace(/^#\//, "").split("/").filter(Boolean);

    if (parts.length === 0) return renderHome();
    if (parts[0] === "q" && parts[1]) {
      // reanudar en la primera pregunta sin responder
      var ds = DATASETS[parts[1]];
      if (!ds) return renderHome();
      var startAt = 0;
      for (var i = 0; i < ds.questions.length; i++) {
        var a = getAnswer(parts[1], ds.questions[i].id);
        if (!a || !a.answer) { startAt = i; break; }
        startAt = i;
      }
      return renderQuiz(parts[1], startAt);
    }
    if (parts[0] === "resumen" && parts[1]) return renderSummary(parts[1]);
    return renderHome();
  }

  window.addEventListener("hashchange", route);
  document.getElementById("pdf-btn").addEventListener("click", exportPDF);
  route();
})();
