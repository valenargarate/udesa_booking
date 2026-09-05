(function () {
  "use strict";

  var DATASETS = window.DATASETS;
  var STORE_KEY = "booking-ux-eval-v2";
  var app = document.getElementById("app");

  /* ============ estado ============ */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { leyes: {}, heuristicas: {} };
      var p = JSON.parse(raw);
      return { leyes: p.leyes || {}, heuristicas: p.heuristicas || {} };
    } catch (e) {
      return { leyes: {}, heuristicas: {} };
    }
  }
  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }
  var state = loadState();

  function getItem(dsId, qId) {
    return (state[dsId] && state[dsId][qId]) || null;
  }
  function patchItem(dsId, qId, patch) {
    if (!state[dsId]) state[dsId] = {};
    var cur = state[dsId][qId] || {};
    var next = Object.assign({}, cur, patch);
    var prev = state[dsId][qId];
    state[dsId][qId] = next;
    if (!saveState()) {
      // se rompió la cuota (imagen muy pesada): revertir el cambio
      state[dsId][qId] = prev;
      saveState();
      alert(
        "No se pudo guardar: la imagen es demasiado pesada o hay muchas capturas cargadas.\n" +
          "Probá con una captura más chica (recortá solo la zona relevante)."
      );
      return false;
    }
    return true;
  }
  function isDocumented(item) {
    return !!(item && (item.answer || (item.note && item.note.trim()) || item.img));
  }

  /* ============ puntajes ============ */
  function scaleLabel(ds, value) {
    for (var i = 0; i < ds.scale.length; i++)
      if (ds.scale[i].value === value) return ds.scale[i].label;
    return value || "";
  }
  function computeScore(ds) {
    var items = state[ds.id] || {};
    var total = ds.questions.length;
    var counts = {};
    ds.scale.forEach(function (s) { counts[s.value] = 0; });
    var answered = 0, documented = 0;

    ds.questions.forEach(function (q) {
      var it = items[q.id];
      if (isDocumented(it)) documented++;
      if (it && it.answer) {
        answered++;
        if (counts[it.answer] != null) counts[it.answer]++;
      }
    });

    var r = { total: total, answered: answered, documented: documented, counts: counts };
    if (ds.id === "leyes") {
      var base = counts.cumple + counts.rompe;
      r.compliance = base ? Math.round((counts.cumple / base) * 100) : null;
    } else {
      var sum = 0, n = 0;
      ds.scale.forEach(function (s) { sum += counts[s.value] * s.weight; n += counts[s.value]; });
      r.avgSeverity = n ? Math.round((sum / n) * 10) / 10 : null;
    }
    return r;
  }
  function toneFor(dsId, value) {
    if (dsId === "leyes") return value === "cumple" ? "good" : "bad";
    var n = parseInt(value, 10);
    if (n <= 0) return "good";
    if (n <= 2) return "warn";
    return "bad";
  }

  /* ============ HOME ============ */
  function renderHome() {
    var frag = el("div");

    var intro = el("div", "home-intro");
    intro.innerHTML =
      "<h1>Evaluación UX de Booking.com</h1>" +
      "<p>Dos tableros de evaluación. Cada uno se completa de a una pregunta por vez y después " +
      "se ve como un documento navegable: veredicto, captura y explicación por ley o heurística.</p>";
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
    var card = el("div", "card");

    var main, sub, target;
    if (ds.id === "leyes") {
      main = sc.compliance == null ? "Sin evaluar" : sc.compliance + "% cumple";
      sub = sc.documented + " de " + sc.total + " leyes documentadas (mínimo sugerido: 8)";
      target = "Cumple " + sc.counts.cumple + " · Rompe " + sc.counts.rompe;
    } else {
      main = sc.avgSeverity == null ? "Sin evaluar" : sc.avgSeverity + " / 4 severidad media";
      sub = sc.answered + " de " + sc.total + " heurísticas evaluadas (deben ser las 10)";
      target =
        "0:" + sc.counts["0"] + "  1:" + sc.counts["1"] + "  2:" + sc.counts["2"] +
        "  3:" + sc.counts["3"] + "  4:" + sc.counts["4"];
    }

    card.innerHTML =
      '<div class="card-emoji">' + ds.emoji + "</div>" +
      "<h2>" + ds.title + "</h2>" +
      '<p class="card-tag">' + ds.tagline + "</p>" +
      '<div class="score-box">' +
      '<div class="score-main">' + main + "</div>" +
      '<div class="score-sub">' + sub + "</div>" +
      '<div class="pill-row"><span class="pill">' + target + "</span></div>" +
      "</div>" +
      '<div class="card-actions">' +
      '<button class="btn btn-primary" data-go="eval">' +
      (sc.documented || sc.answered ? "Continuar" : "Comenzar") +
      "</button>" +
      '<button class="btn btn-secondary" data-go="tablero">Ver tablero</button>' +
      "</div>";

    card.querySelector('[data-go="eval"]').addEventListener("click", function () {
      location.hash = "#/eval/" + ds.id;
    });
    card.querySelector('[data-go="tablero"]').addEventListener("click", function () {
      location.hash = "#/tablero/" + ds.id;
    });
    return card;
  }

  /* ============ WIZARD (una pregunta por vez) ============ */
  function renderEval(dsId, step) {
    var ds = DATASETS[dsId];
    if (!ds) return renderHome();
    var total = ds.questions.length;
    step = Math.max(0, Math.min(step, total - 1));
    var q = ds.questions[step];
    var it = getItem(dsId, q.id) || {};

    var frag = el("div");

    var head = el("div", "quiz-head");
    head.innerHTML =
      "<h1>" + ds.title + "</h1>" +
      '<span class="counter">Pregunta ' + (step + 1) + " de " + total + "</span>";
    frag.appendChild(head);

    var track = el("div", "progress-track");
    var fill = el("div", "progress-fill");
    fill.style.width = (step / total) * 100 + "%";
    track.appendChild(fill);
    frag.appendChild(track);

    var qc = el("div", "q-card");

    var eyebrow = el("p", "q-eyebrow");
    eyebrow.textContent = q.name;
    qc.appendChild(eyebrow);

    var qtext = el("p", "q-text");
    qtext.textContent = q.q;
    qc.appendChild(qtext);

    // opciones (multiple choice)
    var fieldLabel = el("p", "field-label");
    fieldLabel.textContent = ds.verdictLabel;
    qc.appendChild(fieldLabel);

    var opts = el("div", "options");
    ds.scale.forEach(function (s) {
      var oid = dsId + "-" + q.id + "-" + s.value;
      var lab = document.createElement("label");
      lab.className = "option" + (it.answer === s.value ? " selected" : "");
      lab.setAttribute("for", oid);
      lab.innerHTML =
        '<input type="radio" id="' + oid + '" name="opt" value="' + s.value + '"' +
        (it.answer === s.value ? " checked" : "") + " /><span>" + s.label + "</span>";
      lab.querySelector("input").addEventListener("change", function () {
        patchItem(dsId, q.id, { answer: s.value });
        renderEval(dsId, step);
      });
      opts.appendChild(lab);
    });
    qc.appendChild(opts);

    // captura de pantalla
    var shot = el("div", "shot-field");
    shot.innerHTML =
      '<p class="field-label">Captura de pantalla <span class="hint">(imagen + nota, opcional)</span></p>';
    var fileWrap = el("div", "file-wrap");
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.id = "imgfile";
    fileWrap.appendChild(fileInput);
    shot.appendChild(fileWrap);

    if (it.img) {
      var prev = el("div", "img-preview");
      var im = document.createElement("img");
      im.src = it.img;
      im.alt = "Captura de " + q.name;
      prev.appendChild(im);
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "btn btn-link-danger";
      rm.textContent = "Quitar imagen";
      rm.addEventListener("click", function () {
        patchItem(dsId, q.id, { img: null, imgType: null });
        renderEval(dsId, step);
      });
      prev.appendChild(rm);
      shot.appendChild(prev);
    }

    fileInput.addEventListener("change", function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      compressImage(f, 1400, 0.7).then(function (res) {
        patchItem(dsId, q.id, { img: res.dataURL, imgType: res.type });
        renderEval(dsId, step);
      }).catch(function () {
        alert("No se pudo procesar esa imagen.");
      });
    });

    var cap = document.createElement("input");
    cap.type = "text";
    cap.className = "text-input";
    cap.placeholder = "Nota de la captura: qué pantalla / punto exacto (opcional)";
    cap.value = it.shot || "";
    cap.addEventListener("input", function () {
      patchItem(dsId, q.id, { shot: cap.value });
    });
    shot.appendChild(cap);
    qc.appendChild(shot);

    // explicación
    var noteWrap = el("div", "note-field");
    noteWrap.innerHTML = '<p class="field-label">' + ds.explainPrompt + "</p>";
    var ta = document.createElement("textarea");
    ta.rows = 3;
    ta.className = "text-area";
    ta.placeholder = "Escribí acá tu análisis…";
    ta.value = it.note || "";
    ta.addEventListener("input", function () {
      patchItem(dsId, q.id, { note: ta.value });
    });
    noteWrap.appendChild(ta);
    qc.appendChild(noteWrap);

    frag.appendChild(qc);

    // navegación
    var nav = el("div", "quiz-nav");
    var back = document.createElement("button");
    back.type = "button";
    back.className = "btn btn-secondary";
    back.textContent = step === 0 ? "Volver al inicio" : "Anterior";
    back.addEventListener("click", function () {
      if (step === 0) location.hash = "#/";
      else renderEval(dsId, step - 1);
    });
    nav.appendChild(back);

    var next = document.createElement("button");
    next.type = "button";
    next.className = "btn btn-primary";
    next.disabled = !it.answer;
    next.textContent = step === total - 1 ? "Ver tablero" : "Siguiente";
    next.addEventListener("click", function () {
      if (step === total - 1) location.hash = "#/tablero/" + dsId;
      else renderEval(dsId, step + 1);
    });
    nav.appendChild(next);
    frag.appendChild(nav);

    if (it.answer && !(it.note && it.note.trim())) {
      var hint = el("p", "soft-hint");
      hint.textContent = "Falta la explicación de este ítem para que el tablero quede completo.";
      frag.appendChild(hint);
    }

    render(frag);
  }

  /* ============ TABLERO (documento navegable) ============ */
  function renderBoard(dsId) {
    var ds = DATASETS[dsId];
    if (!ds) return renderHome();
    var sc = computeScore(ds);

    var frag = el("div");

    var head = el("div", "board-head");
    var scoreText;
    if (dsId === "leyes") {
      scoreText =
        (sc.compliance == null ? "Sin evaluar" : sc.compliance + "% cumple") +
        " · " + sc.documented + "/" + sc.total + " leyes documentadas · " +
        "Cumple " + sc.counts.cumple + " · Rompe " + sc.counts.rompe;
    } else {
      scoreText =
        (sc.avgSeverity == null ? "Sin evaluar" : sc.avgSeverity + " / 4 severidad media") +
        " · " + sc.answered + "/" + sc.total + " heurísticas · " +
        "0:" + sc.counts["0"] + " 1:" + sc.counts["1"] + " 2:" + sc.counts["2"] +
        " 3:" + sc.counts["3"] + " 4:" + sc.counts["4"];
    }
    head.innerHTML =
      "<h1>Tablero · " + ds.title + "</h1>" +
      '<p class="board-sub">Producto: Booking.com</p>' +
      '<div class="board-score">' + scoreText + "</div>";
    frag.appendChild(head);

    var actions = el("div", "board-actions");
    var editBtn = mkBtn("btn btn-secondary", "Editar respuestas", function () {
      location.hash = "#/eval/" + dsId;
    });
    var pdfBtn = mkBtn("btn btn-primary", "Descargar PDF", function () { exportPDF(); });
    actions.appendChild(editBtn);
    actions.appendChild(pdfBtn);
    frag.appendChild(actions);

    // índice de navegación
    var toc = el("nav", "board-toc");
    ds.questions.forEach(function (q, i) {
      var it = getItem(dsId, q.id) || {};
      var a = document.createElement("a");
      a.href = "#item-" + dsId + "-" + q.id;
      a.className = "toc-link";
      var dot = it.answer
        ? '<span class="dot ' + toneFor(dsId, it.answer) + '"></span>'
        : '<span class="dot muted"></span>';
      a.innerHTML = dot + "<span>" + (i + 1) + ". " + escapeHtml(shortName(q.name)) + "</span>";
      toc.appendChild(a);
    });
    frag.appendChild(toc);

    // ítems
    var list = el("div", "doc-list");
    ds.questions.forEach(function (q, i) {
      var it = getItem(dsId, q.id) || {};
      var item = el("article", "doc-item");
      item.id = "item-" + dsId + "-" + q.id;

      var badge = it.answer
        ? '<span class="badge ' + toneFor(dsId, it.answer) + '">' +
          (dsId === "leyes" ? scaleLabel(ds, it.answer) : "Severidad " + scaleLabel(ds, it.answer)) +
          "</span>"
        : '<span class="badge muted">Sin documentar</span>';

      var shotHtml;
      if (it.img) {
        shotHtml =
          '<figure class="doc-shot"><img src="' + it.img + '" alt="Captura de ' +
          escapeHtml(q.name) + '" data-lightbox="1" />' +
          (it.shot ? "<figcaption>" + escapeHtml(it.shot) + "</figcaption>" : "") +
          "</figure>";
      } else if (it.shot) {
        shotHtml = '<div class="doc-shot doc-shot--text">📎 ' + escapeHtml(it.shot) +
          '<span class="muted-note">(sin imagen adjunta)</span></div>';
      } else {
        shotHtml = '<div class="doc-shot doc-shot--empty">Sin captura</div>';
      }

      var noteHtml = it.note && it.note.trim()
        ? "<p>" + escapeHtml(it.note).replace(/\n/g, "<br>") + "</p>"
        : '<p class="missing">Sin explicación.</p>';

      item.innerHTML =
        '<header class="doc-item-head">' +
        '<span class="doc-idx">' + (i + 1) + "</span>" +
        "<h3>" + escapeHtml(q.name) + "</h3>" +
        badge +
        "</header>" +
        '<p class="doc-q"><span>Pregunta guía:</span> ' + escapeHtml(q.q) + "</p>" +
        '<div class="doc-body">' +
        shotHtml +
        '<div class="doc-expl"><h4>Explicación</h4>' + noteHtml + "</div>" +
        "</div>";
      list.appendChild(item);
    });
    frag.appendChild(list);

    var back = document.createElement("a");
    back.className = "back-link";
    back.href = "#/";
    back.textContent = "← Volver al inicio";
    frag.appendChild(back);

    render(frag);
  }

  /* ============ lightbox ============ */
  document.addEventListener("click", function (e) {
    var img = e.target.closest ? e.target.closest('img[data-lightbox]') : null;
    if (!img) return;
    var ov = el("div", "lightbox");
    ov.innerHTML = '<img src="' + img.src + '" alt="" />';
    ov.addEventListener("click", function () { ov.remove(); });
    document.body.appendChild(ov);
  });

  /* ============ imagen: compresión ============ */
  function compressImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        var img = new Image();
        img.onerror = reject;
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, maxDim / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var c = document.createElement("canvas");
          c.width = cw; c.height = ch;
          var ctx = c.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          resolve({ dataURL: c.toDataURL("image/jpeg", quality), type: "JPEG" });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ============ PDF ============ */
  function exportPDF() {
    var Ctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!Ctor) { alert("No se pudo cargar el generador de PDF."); return; }
    var doc = new Ctor({ unit: "pt", format: "a4" });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var M = 48;
    var maxW = pageW - M * 2;
    var y = M;

    function ensure(space) {
      if (y + space > pageH - M) { doc.addPage(); y = M; }
    }
    function text(str, o) {
      o = o || {};
      doc.setFont("helvetica", o.bold ? "bold" : "normal");
      doc.setFontSize(o.size || 11);
      doc.setTextColor(o.color || "#1b2130");
      var lines = doc.splitTextToSize(str, o.width || maxW);
      for (var i = 0; i < lines.length; i++) {
        ensure((o.size || 11) + 4);
        doc.text(lines[i], o.x || M, y);
        y += (o.size || 11) + 4;
      }
    }
    function gap(h) { y += h == null ? 8 : h; }

    var now = new Date();
    text("Evaluación UX de Booking.com", { bold: true, size: 20 });
    gap(2);
    text("Tableros: Leyes UX y Heurísticas de Nielsen", { size: 11, color: "#5b6577" });
    text("Generado: " + now.toLocaleDateString("es-AR") + " " + now.toLocaleTimeString("es-AR"), {
      size: 10, color: "#5b6577",
    });
    gap(16);

    ["leyes", "heuristicas"].forEach(function (dsId) {
      var ds = DATASETS[dsId];
      var sc = computeScore(ds);
      ensure(50);
      text(ds.title, { bold: true, size: 15, color: "#003b95" });
      gap(2);
      if (dsId === "leyes") {
        text(
          "Cumplimiento: " + (sc.compliance == null ? "s/d" : sc.compliance + "%") +
          "  |  Documentadas: " + sc.documented + "/" + sc.total +
          "  |  Cumple " + sc.counts.cumple + " · Rompe " + sc.counts.rompe,
          { size: 10, color: "#5b6577" }
        );
      } else {
        text(
          "Severidad media: " + (sc.avgSeverity == null ? "s/d" : sc.avgSeverity + " / 4") +
          "  |  Evaluadas: " + sc.answered + "/" + sc.total +
          "  |  0:" + sc.counts["0"] + " 1:" + sc.counts["1"] + " 2:" + sc.counts["2"] +
          " 3:" + sc.counts["3"] + " 4:" + sc.counts["4"],
          { size: 10, color: "#5b6577" }
        );
      }
      gap(12);

      ds.questions.forEach(function (q, idx) {
        var it = getItem(dsId, q.id) || {};
        ensure(60);
        text((idx + 1) + ". " + q.name, { bold: true, size: 11.5 });
        text("Pregunta guía: " + q.q, { size: 9.5, color: "#5b6577" });
        var verdict = it.answer
          ? (dsId === "leyes" ? scaleLabel(ds, it.answer) : "Severidad " + scaleLabel(ds, it.answer))
          : "Sin documentar";
        text((dsId === "leyes" ? "Veredicto: " : "Severidad: ") + verdict, {
          size: 10.5, bold: true, color: it.answer ? "#1b2130" : "#b42318",
        });
        text("Explicación: " + (it.note && it.note.trim() ? it.note.trim() : "—"), {
          size: 10, color: "#333c4d",
        });
        text("Captura: " + (it.shot ? it.shot : it.img ? "(imagen adjunta)" : "—"), {
          size: 9.5, color: "#5b6577",
        });

        if (it.img) {
          try {
            var props = doc.getImageProperties(it.img);
            var iw = Math.min(maxW, 360);
            var ih = (props.height / props.width) * iw;
            if (ih > 300) { ih = 300; iw = (props.width / props.height) * ih; }
            gap(4);
            ensure(ih + 10);
            doc.addImage(it.img, it.imgType || "JPEG", M, y, iw, ih);
            y += ih + 6;
          } catch (e) {}
        }
        gap(12);
      });
      gap(10);
    });

    doc.save("evaluacion-ux-booking.pdf");
  }

  /* ============ utils ============ */
  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function mkBtn(cls, label, fn) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }
  function render(node) {
    app.innerHTML = "";
    app.appendChild(node);
    var hash = location.hash || "";
    if (hash.indexOf("#item-") === 0) {
      var t = document.getElementById(hash.slice(1));
      if (t) { t.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function shortName(name) {
    return name.replace(/^Ley de /, "").replace(/^\d+\.\s*/, "");
  }

  /* ============ router ============ */
  function route() {
    var hash = location.hash || "#/";
    if (hash.indexOf("#item-") === 0) {
      var t = document.getElementById(hash.slice(1));
      if (t) t.scrollIntoView();
      return;
    }
    var parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts.length === 0) return renderHome();

    if (parts[0] === "eval" && DATASETS[parts[1]]) {
      var ds = DATASETS[parts[1]];
      var start = 0;
      for (var i = 0; i < ds.questions.length; i++) {
        var it = getItem(parts[1], ds.questions[i].id);
        start = i;
        if (!it || !it.answer) break;
      }
      return renderEval(parts[1], start);
    }
    if (parts[0] === "tablero" && DATASETS[parts[1]]) return renderBoard(parts[1]);
    return renderHome();
  }

  window.addEventListener("hashchange", route);
  var pdfTop = document.getElementById("pdf-btn");
  if (pdfTop) pdfTop.addEventListener("click", exportPDF);
  route();
})();
