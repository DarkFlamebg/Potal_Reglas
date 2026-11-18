/* ==========================================================
   app.js — Dixel RP · Portal de información

   El contenido está en data.js (objeto DATA). Aquí solo va la lógica:
   1. Utilidades  → helpers de DOM y YouTube
   2. Bloques     → constructores reutilizables (reglas, tablas, FAQ…)
   3. Vistas      → Inicio (landing) y páginas de sección
   4. Navegación  → qué sección dibujar
   5. Fondo       → silueta animada de Los Santos (canvas)
   6. Analytics   → Google Analytics 4 (opcional)
   7. SEO         → datos estructurados para buscadores
   8. Arranque

   La barra superior (navbar), el menú y el pie están en layout.js.

   Cada sección es un archivo .html propio (rol.html, faq.html…) que
   indica cuál es con <body data-page="...">.
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. UTILIDADES
   ---------------------------------------------------------- */

/** Crea un elemento con texto y clase opcionales.
 *  Se usa textContent (no innerHTML) para evitar inyección de HTML. */
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

/** Enlace. Si external es true, abre en otra pestaña. */
function link(text, href, className, external) {
  const a = el("a", text, className);
  a.href = href;
  if (external) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}

/** Extrae el ID de un enlace de YouTube (youtu.be/ID o watch?v=ID). */
function youTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    return u.searchParams.get("v");
  } catch (e) {
    return null;
  }
}

/** Vídeo "bajo demanda": portada de YouTube con botón de reproducir.
 *  El iframe solo se carga al hacer clic. */
function buildVideo(id, title) {
  const box = el("div", undefined, "video");
  const btn = el("button", undefined, "video-btn");
  btn.type = "button";
  btn.setAttribute("aria-label", "Reproducir vídeo de " + title);

  const thumb = el("img");
  thumb.src = "https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg";
  thumb.alt = "";                       // decorativa: el botón ya tiene nombre
  thumb.width = 480;
  thumb.height = 360;
  thumb.loading = "lazy";
  btn.append(thumb, el("span", undefined, "play"));

  btn.addEventListener("click", () => {
    const frame = el("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
    frame.title = "Vídeo de " + title;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    box.replaceChildren(frame);
    frame.focus();
  });

  box.appendChild(btn);
  return box;
}

/** Copia un texto al portapapeles. Devuelve true si lo consiguió. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Sin acceso al portapapeles (p. ej. abierto desde el disco): método antiguo
    const tmp = el("textarea");
    tmp.value = text;
    tmp.setAttribute("readonly", "");
    tmp.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(tmp);
    tmp.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    tmp.remove();
    return ok;
  }
}

/**
 * Visor de imágenes: abre una foto en grande dentro de un <dialog> nativo.
 * El navegador se encarga de Escape, del foco y de devolverlo al cerrar.
 * Se crea una sola vez y se reutiliza para todas las fotos.
 */
let lightbox = null;
function openLightbox(src, alt) {
  if (!lightbox) {
    lightbox = el("dialog", undefined, "lightbox");
    const close = el("button", "Cerrar", "btn lightbox-close");
    close.type = "button";
    close.addEventListener("click", () => lightbox.close());
    const figure = el("figure");
    figure.append(el("img"), el("figcaption"));
    lightbox.append(close, figure);
    // Clic fuera de la imagen (en el fondo oscuro) = cerrar
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
    document.body.appendChild(lightbox);
  }
  if (!lightbox.showModal) { window.open(src, "_blank", "noopener"); return; }  // navegadores antiguos
  const img = lightbox.querySelector("img");
  img.src = src;
  img.alt = alt;
  lightbox.querySelector("figcaption").textContent = alt;
  lightbox.showModal();
}

/** Texto sin acentos y en minúsculas, para buscar sin importar cómo se escriba. */
function normText(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Campo de búsqueda con etiqueta y una línea de estado ("12 de 60 faltas"). */
function buildSearch(id, labelText, placeholder) {
  const field = el("div", undefined, "search");
  const label = el("label", labelText);
  label.htmlFor = id;
  const input = el("input");
  input.type = "search";
  input.id = id;
  input.autocomplete = "off";
  input.spellcheck = false;
  input.placeholder = placeholder;
  const status = el("p", "", "result-count");
  status.setAttribute("role", "status");
  field.append(label, input);
  return { field, input, status };
}

/** Filtra filas al escribir: oculta las que no coinciden y los grupos que quedan vacíos. */
function bindFilter(search, entries, groups, empty, noun, visibleRow) {
  function apply() {
    const q = normText(search.input.value.trim());
    let shown = 0;
    entries.forEach((e) => {
      const match = !q || e.haystack.includes(q);
      e.node.hidden = !match;
      if (match) shown++;
    });
    groups.forEach((g) => { g.hidden = !g.querySelector(visibleRow); });
    empty.hidden = shown !== 0;
    search.status.textContent = q ? shown + " de " + entries.length + " " + noun : entries.length + " " + noun;
    document.dispatchEvent(new CustomEvent("content:filtered"));   // el índice lateral se actualiza
  }
  search.input.addEventListener("input", apply);
  apply();
}

/** Peso de una sanción según su duración: aviso, leve, media, grave o ban. */
function sanctionLevel(time) {
  if (/advertencia/i.test(time)) return "warn";
  if (/ban/i.test(time)) return "ban";
  const n = Math.max(...(time.match(/\d+/g) || ["0"]).map(Number));
  return n >= 500 ? "high" : n >= 200 ? "mid" : "low";
}

/* ----------------------------------------------------------
   2. BLOQUES — un constructor por tipo. Cada uno devuelve un nodo.
   ---------------------------------------------------------- */
const BLOCKS = {
  text:    (b) => el("p", b.text),
  intro:   (b) => el("p", b.text, "intro"),
  heading: (b) => el("h2", b.text, "block-title"),
  notice:  (b) => {
    const n = el("p", b.text, "notice");
    n.setAttribute("role", "note");
    return n;
  },

  list: (b) => {
    const ul = el("ul", undefined, "plain");
    b.items.forEach((item) => ul.appendChild(el("li", item)));
    return ul;
  },

  // Reglas numeradas: el número (01, 02…) lo pone el contador CSS
  rules: (b) => {
    const ol = el("ol", undefined, "rules");
    ol.setAttribute("role", "list");   // conserva la semántica con list-style: none
    b.items.forEach((item) => ol.appendChild(el("li")).appendChild(el("span", item)));
    return ol;
  },

  cards: (b) => {
    const wrap = el("div", undefined, "cards");
    b.items.forEach((c) => {
      const card = el("article", undefined, "card");
      card.append(el("h3", c.title), el("p", c.text));
      wrap.appendChild(card);
    });
    return wrap;
  },

  // Bases (HQ) de bandas y mafias. Los huecos { empty: true } se muestran como "Base libre".
  bases: (b) => {
    const wrap = el("div", undefined, "bases");
    b.items.forEach((it) => {
      if (it.empty) {
        const free = el("article", undefined, "base base-empty");
        free.append(el("h3", "Base libre"), el("p", "Espacio disponible para una nueva banda o mafia."));
        wrap.appendChild(free);
        return;
      }
      const card = el("article", undefined, "base");
      card.dataset.color = it.color;           // el color se resuelve en styles.css

      // Miniatura: es un botón que abre la foto en grande
      if (it.photo) {
        const alt = "Base de " + it.name;
        const thumb = el("button", undefined, "base-photo");
        thumb.type = "button";
        const img = el("img");
        img.src = it.photo;
        img.alt = alt;
        img.width = 1280;
        img.height = 720;
        img.loading = "lazy";
        thumb.append(img, el("span", "Ampliar", "base-zoom"));
        thumb.addEventListener("click", () => openLightbox(it.photo, alt));
        card.appendChild(thumb);
      }
      card.append(el("p", it.kind, "base-kind"), el("h3", it.name));

      const dl = el("dl");
      [["Líder", it.leader], ["Color", it.colorName], ["Estado de la HQ", it.status],
       ["Oficiales para entrar", String(it.officers)]].forEach(([term, value]) => {
        const row = el("div");
        row.append(el("dt", term), el("dd", value));
        dl.appendChild(row);
      });
      card.appendChild(dl);
      wrap.appendChild(card);
    });
    return wrap;
  },

  table: (b) => {
    const wrap = el("div", undefined, "table-wrap");
    const table = el("table");
    const headRow = el("tr");
    b.headers.forEach((h) => {
      const th = el("th", h);
      th.scope = "col";
      headRow.appendChild(th);
    });
    const thead = el("thead");
    thead.appendChild(headRow);
    const tbody = el("tbody");
    b.rows.forEach((row) => {
      const tr = el("tr");
      // data-label: en móvil cada fila se apila y la celda muestra su cabecera (ver styles.css)
      row.forEach((cell, i) => { tr.appendChild(el("td", cell)).dataset.label = b.headers[i] || ""; });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    wrap.appendChild(table);
    return wrap;
  },

  links: (b) => {
    const ul = el("ul", undefined, "link-list");
    b.items.forEach((item) => {
      const li = el("li");
      li.appendChild(el("strong", item.label + ": "));
      li.appendChild(item.href ? link(item.text, item.href, undefined, true)
                               : document.createTextNode(item.text));
      ul.appendChild(li);
    });
    return ul;
  },

  // Acordeón nativo <details>/<summary>: accesible por teclado sin JS extra
  faq: (b) => {
    const wrap = el("div", undefined, "faq");
    b.items.forEach((item) => {
      const d = el("details");
      const answer = el("div", undefined, "answer");
      answer.appendChild(el("p", item.a));
      if (item.links) {
        const ul = el("ul");
        item.links.forEach((l) => ul.appendChild(el("li")).appendChild(link(l.label, l.href, undefined, true)));
        answer.appendChild(ul);
      }
      d.append(el("summary", item.q), answer);
      wrap.appendChild(d);
    });
    return wrap;
  },

  // Sanciones: buscador + fila con nombre y duración.
  // La duración lleva un color según su peso (data-level, ver styles.css).
  sanctions: (b) => {
    const wrap = el("div", undefined, "sanctions-block");
    const search = buildSearch("sanciones-search", "Buscar falta", "Por ejemplo: DM, PG, vehículo…");
    const legend = el("ul", undefined, "sanction-legend");
    legend.setAttribute("aria-label", "Colores de la duración");
    [["warn", "Advertencia"], ["low", "Menos de 200 min"], ["mid", "200 a 499 min"], ["high", "500 min o más / ban"]]
      .forEach(([lvl, text]) => { legend.appendChild(el("li", text)).dataset.level = lvl; });
    wrap.append(search.field, legend, search.status);

    const entries = [];
    const groups = [];
    b.groups.forEach((g) => {
      const section = el("section", undefined, "sanction-group");
      section.appendChild(el("h2", g.title, "block-title"));
      if (g.note) section.appendChild(el("p", g.note, "intro"));
      const list = el("div", undefined, "sanctions");
      g.items.forEach(([name, , time, desc, example]) => {   // el nivel (2.º valor) ya no se muestra
        const row = el("div", undefined, "sanction");
        const info = el("div", undefined, "info");
        info.appendChild(el("span", name, "name"));
        if (desc || example) {
          const p = el("p", desc ? desc + " " : "", "desc");
          if (example) {
            const a = link("Ver ejemplo", example, undefined, true);
            a.appendChild(el("span", " de " + name, "sr-only"));
            p.appendChild(a);
          }
          info.appendChild(p);
        }
        const t = el("span", time, "time");
        t.dataset.level = sanctionLevel(time);
        row.append(info, t);
        list.appendChild(row);
        entries.push({ node: row, haystack: normText([name, desc || "", time, g.title].join(" ")) });
      });
      section.appendChild(list);
      wrap.appendChild(section);
      groups.push(section);
    });

    const empty = el("div", undefined, "empty");
    empty.append(el("strong", "Sin resultados"), document.createTextNode("Prueba con otra sigla o palabra."));
    empty.hidden = true;
    wrap.appendChild(empty);

    bindFilter(search, entries, groups, empty, "faltas", ".sanction:not([hidden])");
    return wrap;
  },

  // Glosario con buscador (ignora mayúsculas y acentos)
  glossary: (b) => {
    const wrap = el("div", undefined, "glossary");
    const search = buildSearch("glossary-search", "Buscar concepto", "Por ejemplo: DM, vehículos, lag…");
    wrap.append(search.field, search.status);

    const entries = [];
    const groups = [];
    b.groups.forEach((g) => {
      const section = el("section", undefined, "gloss-group");
      section.appendChild(el("h2", g.title, "block-title"));
      const dl = el("dl");
      g.items.forEach((it) => {
        const row = el("div", undefined, "gloss-row");
        const dt = el("dt");
        dt.append(el("span", it.term, "abbr"), el("span", it.name, "full"));
        const dd = el("dd");
        dd.appendChild(el("p", it.text));
        if (it.example) {
          const ex = el("p", undefined, "example");
          ex.append(el("strong", "Ejemplo: "), document.createTextNode(it.example));
          dd.appendChild(ex);
        }
        row.append(dt, dd);
        dl.appendChild(row);
        entries.push({ node: row, haystack: normText([it.term, it.name, it.text, it.example || "", g.title].join(" ")) });
      });
      section.appendChild(dl);
      wrap.appendChild(section);
      groups.push(section);
    });

    const empty = el("div", undefined, "empty");
    empty.append(el("strong", "Sin resultados"), document.createTextNode("Prueba con otra sigla o palabra."));
    empty.hidden = true;
    wrap.appendChild(empty);

    bindFilter(search, entries, groups, empty, "conceptos", ".gloss-row:not([hidden])");
    return wrap;
  },

  // Recuadro del servidor: IP, botón para conectar con SA-MP y botón para copiar la IP
  server: () => {
    const { host, port } = DATA.site.server;
    const address = host + ":" + port;
    const box = el("div", undefined, "server-box");

    const info = el("div", undefined, "server-info");
    info.append(el("p", "IP del servidor", "server-label"), el("code", address, "server-ip"));

    const actions = el("div", undefined, "server-actions");
    // samp:// abre SA-MP y conecta directamente (si está instalado)
    actions.appendChild(link("Conectar", "samp://" + address, "btn"));
    const copy = el("button", "Copiar IP", "btn btn-ghost");
    copy.type = "button";
    const status = el("span", "", "sr-only");
    status.setAttribute("role", "status");
    copy.addEventListener("click", async () => {
      const ok = await copyText(address);
      copy.textContent = ok ? "IP copiada" : "Cópiala a mano";
      status.textContent = ok ? "IP copiada al portapapeles" : "";
      setTimeout(() => { copy.textContent = "Copiar IP"; }, 2000);
    });
    actions.append(copy, status);

    box.append(info, actions);
    return box;
  },

  // Fichas de descarga con vídeo o imagen de referencia
  downloads: (b) => {
    const wrap = el("div", undefined, "downloads");
    b.items.forEach((it) => {
      const card = el("article", undefined, "dl-card");

      const videoId = it.video ? youTubeId(it.video) : null;
      if (videoId) card.appendChild(buildVideo(videoId, it.title));
      if (it.image) {
        const fig = el("figure", undefined, "dl-image");
        const img = el("img");
        img.src = it.image.src;
        img.alt = it.image.alt;
        img.width = it.image.width;      // dimensiones explícitas: evitan saltos de diseño
        img.height = it.image.height;
        img.loading = "lazy";
        fig.appendChild(img);
        card.appendChild(fig);
      }

      const body = el("div", undefined, "dl-body");
      const head = el("div", undefined, "dl-head");
      head.appendChild(el("h3", it.title));
      if (it.status) head.appendChild(el("span", it.status, "tag tag-ok"));
      body.appendChild(head);

      if (it.performance) {
        const p = el("p");
        p.append(el("strong", "Rendimiento: "), document.createTextNode(it.performance));
        body.appendChild(p);
      }
      if (it.contains && it.contains.length) {
        body.appendChild(el("p", "Contiene:", "dl-label"));
        const ul = el("ul");
        it.contains.forEach((c) => ul.appendChild(el("li", c)));
        body.appendChild(ul);
      }
      if (it.note) {
        const n = el("p", undefined, "dl-note");
        n.append(el("strong", "Nota: "), document.createTextNode(it.note));
        body.appendChild(n);
      }

      const actions = el("div", undefined, "dl-actions");
      const dl = link("Descargar", it.link, "btn", true);
      dl.appendChild(el("span", " " + it.title, "sr-only"));
      actions.appendChild(dl);
      if (it.video) {
        const yt = link("Ver en YouTube", it.video, "btn btn-ghost", true);
        yt.appendChild(el("span", " " + it.title, "sr-only"));
        actions.appendChild(yt);
      }
      body.appendChild(actions);
      card.appendChild(body);
      wrap.appendChild(card);
    });
    return wrap;
  }
};

/** Convierte una lista de bloques en nodos y los añade al contenedor. */
function renderBlocks(blocks, container) {
  blocks.forEach((block) => {
    const build = BLOCKS[block.type];
    if (build) container.appendChild(build(block));
    else console.warn("Tipo de bloque desconocido:", block.type);
  });
}

/* ----------------------------------------------------------
   3. VISTAS
   ---------------------------------------------------------- */

/**
 * INICIO: portada a pantalla completa con capturas del servidor, cifras y
 * el índice de secciones por categoría. Aquí solo se construye la página;
 * las animaciones (anime.js) están en js/home.js. Sin anime.js, la página
 * se ve completa y estática.
 */
function renderHome(main) {
  const home = DATA.home;
  main.classList.remove("container");   // la portada ocupa todo el ancho
  main.classList.add("home");

  /* --- Portada --- */
  const hero = el("section", undefined, "home-hero");
  hero.setAttribute("aria-labelledby", "home-title");

  // Capturas de fondo: solo la primera se descarga al entrar; el resto, después (home.js)
  const slides = el("div", undefined, "hero-slides");
  slides.setAttribute("aria-hidden", "true");
  home.slides.forEach((s, i) => {
    const img = el("img", undefined, "hero-slide" + (i === 0 ? " is-active" : ""));
    img.alt = "";
    img.width = 1600;
    img.height = 800;
    img.decoding = "async";
    const src = s.src + "-1600.webp";
    const srcset = s.src + "-800.webp 800w, " + s.src + "-1600.webp 1600w";
    if (i === 0) {
      img.src = src;
      img.srcset = srcset;
      img.sizes = "100vw";
      img.fetchPriority = "high";
    } else {
      img.dataset.src = src;
      img.dataset.srcset = srcset;
    }
    slides.appendChild(img);
  });
  hero.appendChild(slides);
  // Sombra para leer el texto y línea rosa que acompaña al cambio de captura
  hero.append(el("div", undefined, "hero-shade"), el("div", undefined, "hero-wipe"));

  // Esquinas de visor (decorativas)
  const frame = el("div", undefined, "hero-frame");
  frame.setAttribute("aria-hidden", "true");
  ["tl", "tr", "bl", "br"].forEach((c) => frame.appendChild(el("span", undefined, "corner " + c)));
  hero.appendChild(frame);

  const inner = el("div", undefined, "container hero-inner");
  const copy = el("div", undefined, "hero-copy");
  copy.appendChild(el("p", home.eyebrow, "hero-eyebrow"));

  // Título en líneas; cada línea va dentro de una máscara para animarla
  const h1 = el("h1", undefined, "hero-title");
  h1.id = "home-title";
  h1.setAttribute("aria-label", home.title.join(" "));
  home.title.forEach((line, i) => {
    const mask = el("span", undefined, "line");
    mask.setAttribute("aria-hidden", "true");
    mask.appendChild(el("span", line, "line-in" + (i === home.highlightLine ? " hl" : "")));
    h1.appendChild(mask);
  });
  copy.append(h1, el("p", home.text, "hero-lead"));

  const actions = el("div", undefined, "hero-actions");
  actions.appendChild(link("Cómo empezar", pageUrl("empezar"), "btn hero-btn"));
  if (DATA.site.discord) {
    const discord = link("Entrar al Discord", DATA.site.discord, "hero-link", true);
    const arrow = el("span", "↗", "arrow");
    arrow.setAttribute("aria-hidden", "true");
    discord.appendChild(arrow);
    actions.appendChild(discord);
  }
  copy.appendChild(actions);

  // Índice de capturas (pantallas anchas): pulsar uno cambia la imagen
  const index = el("ol", undefined, "hero-index");
  index.setAttribute("aria-label", "Capturas del servidor");
  home.slides.forEach((s, i) => {
    const b = el("button", undefined, "hero-index-btn");
    b.type = "button";
    b.dataset.index = i;
    if (i === 0) b.setAttribute("aria-current", "true");
    const track = el("span", undefined, "track");
    track.appendChild(el("span", undefined, "fill"));
    b.append(el("span", String(i + 1).padStart(2, "0"), "num"), el("span", s.caption, "cap"), track);
    b.setAttribute("aria-label", "Ver captura: " + s.caption);
    b.addEventListener("click", () => hero.dispatchEvent(new CustomEvent("hero:goto", { detail: i })));
    index.appendChild(el("li")).appendChild(b);
  });
  inner.append(copy, index);
  hero.appendChild(inner);

  // Barra inferior: estado del servidor, IP para copiar y aviso para bajar
  const bar = el("div", undefined, "container hero-bar");
  const online = DATA.site.serverOnline;
  const status = el("p", undefined, "hero-status");
  const dot = el("span", undefined, "dot" + (online ? "" : " off"));
  dot.appendChild(el("span", undefined, "ring"));
  status.append(dot, document.createTextNode(online ? "Servidor online" : "Servidor offline"));

  const { host, port } = DATA.site.server;
  const address = host + ":" + port;
  const ip = el("button", undefined, "hero-ip");
  ip.type = "button";
  ip.setAttribute("aria-label", "Copiar la IP del servidor: " + address);
  const ipAction = el("span", "Copiar", "act");
  ip.append(el("span", "IP", "lbl"), el("span", address, "val"), ipAction);
  const ipStatus = el("span", "", "sr-only");
  ipStatus.setAttribute("role", "status");
  ip.addEventListener("click", async () => {
    const ok = await copyText(address);
    ipAction.textContent = ok ? "Copiada" : "Cópiala a mano";
    ipStatus.textContent = ok ? "IP copiada al portapapeles" : "";
    ip.classList.toggle("copied", ok);
    setTimeout(() => { ipAction.textContent = "Copiar"; ip.classList.remove("copied"); }, 2000);
  });

  const scroll = link("Explorar", "#portal", "hero-scroll");
  const cue = el("span", undefined, "cue");
  cue.setAttribute("aria-hidden", "true");
  cue.appendChild(el("span"));
  scroll.appendChild(cue);

  const rule = el("span", undefined, "hero-rule");   // línea fina sobre la barra
  rule.setAttribute("aria-hidden", "true");
  bar.append(rule, status, ip, ipStatus, scroll);
  hero.appendChild(bar);
  main.appendChild(hero);

  // Sin animaciones (o sin anime.js): el índice cambia la captura al instante
  hero.addEventListener("hero:goto", (e) => {
    if (document.documentElement.classList.contains("motion")) return;   // de eso se encarga home.js
    const imgs = hero.querySelectorAll(".hero-slide");
    imgs.forEach((img, j) => {
      if (j === e.detail && img.dataset.src) { img.srcset = img.dataset.srcset; img.sizes = "100vw"; img.src = img.dataset.src; delete img.dataset.src; }
      img.classList.toggle("is-active", j === e.detail);
    });
    hero.querySelectorAll(".hero-index-btn").forEach((b, j) => {
      if (j === e.detail) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  });

  /* --- Contenido bajo la portada --- */
  const body = el("div", undefined, "container home-body");
  body.id = "portal";   // destino del enlace "Explorar" de la portada

  // Cifras: se calculan a partir del contenido real de data.js
  const P = DATA.pages;
  const count = (page, type, fn) => P[page].blocks.filter((b) => b.type === type).reduce((n, b) => n + fn(b), 0);
  const stats = [
    { n: count("rol", "glossary", (b) => b.groups.reduce((m, g) => m + g.items.length, 0)), label: "conceptos de rol explicados", page: "rol" },
    { n: count("sanciones", "sanctions", (b) => b.groups.reduce((m, g) => m + g.items.length, 0)), label: "faltas con su sanción", page: "sanciones" },
    { n: count("descargas", "downloads", (b) => b.items.length), label: "versiones de GTA listas para jugar", page: "descargas" },
    { n: count("facciones", "bases", (b) => b.items.filter((it) => !it.empty).length), label: "bandas y mafias con base", page: "facciones" }
  ];
  const statList = el("ul", undefined, "home-stats");
  statList.setAttribute("role", "list");
  stats.forEach((s) => {
    const a = link("", pageUrl(s.page), "stat");
    const num = el("span", String(s.n), "stat-num");
    num.dataset.value = s.n;
    a.append(num, el("span", s.label, "stat-label"));
    statList.appendChild(el("li")).appendChild(a);
  });
  body.appendChild(statList);

  // Índice: una tarjeta por categoría del menú
  body.appendChild(el("h2", "Todo el portal", "home-heading"));
  const grid = el("div", undefined, "home-groups");
  const groups = {};
  DATA.nav.filter((n) => n.id !== "inicio").forEach((n) => {
    const name = n.group || "Secciones";
    if (!groups[name]) {
      const card = el("section", undefined, "home-group");
      const num = String(Object.keys(groups).length + 1).padStart(2, "0");
      const head = el("h3");
      head.append(el("span", num, "home-group-num"), document.createTextNode(name));
      groups[name] = el("ul");
      groups[name].setAttribute("role", "list");
      card.append(head, groups[name]);
      grid.appendChild(card);
    }
    const a = link("", pageUrl(n.id));
    a.append(el("span", n.label, "home-link-label"), el("span", n.desc, "home-link-desc"));
    groups[name].appendChild(el("li")).appendChild(a);
  });
  body.appendChild(grid);
  main.appendChild(body);

  if (typeof initHomeMotion === "function") initHomeMotion(main);   // js/home.js
}

/**
 * PÁGINAS DE SECCIÓN
 *   Cabecera  → ruta (Inicio / Categoría / Sección), título, entradilla y
 *               una captura del servidor difuminada según la categoría.
 *   Cuerpo    → el panel con los bloques y, si hay 3 apartados o más, un
 *               índice "En esta página" (lateral en escritorio, plegable en móvil).
 *   Final     → enlaces a la sección anterior y a la siguiente del menú.
 */
function renderPage(main, page, id) {
  const navItem = DATA.nav.find((n) => n.id === id) || {};
  const blocks = page.blocks.slice();                       // copia: data.js no se toca
  const lead = blocks[0] && blocks[0].type === "intro" ? blocks.shift().text : null;

  main.classList.remove("container");
  main.classList.add("section-page");

  // Cabecera
  const head = el("header", undefined, "page-head");
  const img = DATA.groupImages && DATA.groupImages[navItem.group];
  if (img) {
    const media = el("img", undefined, "page-head-media");
    media.src = img + "-1600.webp";
    media.srcset = img + "-800.webp 800w, " + img + "-1600.webp 1600w";
    media.sizes = "100vw";
    media.alt = "";                                          // decorativa
    media.decoding = "async";
    head.appendChild(media);
  }
  const inner = el("div", undefined, "container page-head-inner");
  const crumbs = el("nav", undefined, "crumbs");
  crumbs.setAttribute("aria-label", "Ruta");
  const ol = el("ol");
  ol.appendChild(el("li")).appendChild(link("Inicio", "index.html"));
  if (navItem.group) ol.appendChild(el("li", navItem.group));
  const here = el("li", navItem.label || page.title);
  here.setAttribute("aria-current", "page");
  ol.appendChild(here);
  crumbs.appendChild(ol);
  const h1 = el("h1", page.title, "page-title");
  h1.id = "page-h1";
  inner.append(crumbs, h1);
  if (lead) inner.appendChild(el("p", lead, "page-lead"));
  head.appendChild(inner);

  // Cuerpo
  const layout = el("div", undefined, "container page-layout");
  const article = el("article", undefined, "page");
  article.setAttribute("aria-labelledby", "page-h1");
  renderBlocks(blocks, article);
  const toc = buildToc(article);
  if (toc) { layout.classList.add("has-toc"); layout.appendChild(toc); }
  layout.appendChild(article);

  main.append(head, layout);
  const pager = buildPager(id);
  if (pager) main.appendChild(pager);
  initToTop();
}

/** Identificador legible para un título: "Jails directos" → "jails-directos". */
function slugify(text) {
  return normText(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "apartado";
}

/**
 * Índice "En esta página": un enlace por cada título de apartado (h2).
 * Cada título recibe un id y un enlace "#" para compartir ese punto.
 * El enlace del apartado que se está leyendo queda marcado.
 */
function buildToc(article) {
  const heads = [...article.querySelectorAll("h2.block-title")];
  const used = new Set();
  heads.forEach((h) => {
    const base = slugify(h.textContent);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = base + "-" + n;
    used.add(slug);
    h.id = slug;
    const a = link("#", "#" + slug, "heading-anchor");
    a.setAttribute("aria-label", "Enlace a " + h.textContent);
    h.appendChild(a);
  });
  if (heads.length < 3) return null;

  const aside = el("aside", undefined, "page-toc");
  aside.setAttribute("aria-label", "En esta página");
  const details = el("details", undefined, "toc");
  const summary = el("summary", "En esta página", "toc-title");
  const list = el("ol");
  const links = heads.map((h) => {
    const a = link(h.firstChild.textContent, "#" + h.id);
    list.appendChild(el("li")).appendChild(a);
    return a;
  });
  details.append(summary, list);
  aside.appendChild(details);

  // Escritorio: siempre abierto. Móvil: plegado, y se cierra al elegir un apartado.
  const wide = window.matchMedia("(min-width: 1100px)");
  const syncOpen = () => { details.open = wide.matches; };
  syncOpen();
  wide.addEventListener("change", syncOpen);
  list.addEventListener("click", (e) => { if (e.target.closest("a") && !wide.matches) details.open = false; });
  summary.addEventListener("click", (e) => { if (wide.matches) e.preventDefault(); });

  // Marca el apartado actual: el último título que ya pasó bajo la barra superior
  let ticking = false;
  function spy() {
    ticking = false;
    const line = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 60) + 40;
    let active = -1;
    heads.forEach((h, i) => {
      if (h.offsetParent !== null && h.getBoundingClientRect().top <= line) active = i;
    });
    // Al llegar al final, los últimos apartados no suben hasta arriba: marca el último visible
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      for (let i = heads.length - 1; i >= 0; i--) {
        if (heads[i].offsetParent !== null && heads[i].getBoundingClientRect().top < window.innerHeight) { active = i; break; }
      }
    }
    links.forEach((a, i) => {
      if (i === active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      a.parentElement.hidden = heads[i].offsetParent === null;   // apartado oculto por el buscador
    });
  }
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  document.addEventListener("content:filtered", queue);
  requestAnimationFrame(spy);
  return aside;
}

/** Enlaces a la sección anterior y a la siguiente, en el orden del menú. */
function buildPager(id) {
  const order = DATA.nav.filter((n) => n.id !== "inicio");
  const i = order.findIndex((n) => n.id === id);
  if (i < 0) return null;
  const nav = el("nav", undefined, "container pager");
  nav.setAttribute("aria-label", "Más secciones");
  [[order[i - 1], "prev", "Anterior"], [order[i + 1], "next", "Siguiente"]].forEach(([item, cls, dir]) => {
    if (!item) { nav.appendChild(el("span", undefined, "pager-gap")); return; }
    const a = link("", pageUrl(item.id), "pager-link " + cls);
    a.append(el("span", dir + (item.group ? " · " + item.group : ""), "pager-dir"), el("span", item.label, "pager-label"));
    nav.appendChild(a);
  });
  return nav;
}

/** Botón "Volver arriba": aparece cuando ya se ha bajado un buen trecho. */
function initToTop() {
  const btn = el("button", undefined, "to-top");
  btn.type = "button";
  btn.setAttribute("aria-label", "Volver arriba");
  btn.hidden = true;
  btn.addEventListener("click", () => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    document.getElementById("contenido").focus({ preventScroll: true });
  });
  document.body.appendChild(btn);
  const sync = () => { btn.hidden = window.scrollY < 900; };
  window.addEventListener("scroll", sync, { passive: true });
  sync();
}

/* ----------------------------------------------------------
   4. NAVEGACIÓN — una página por archivo
   La barra, el menú y el pie se dibujan en layout.js.
   ---------------------------------------------------------- */
/** Página 404: se muestra cuando la dirección no existe. */
function renderNotFound(main) {
  const article = el("article", undefined, "page");
  article.append(
    el("h1", "Página no encontrada", "page-title"),
    el("p", "La dirección que buscas no existe o cambió de sitio.", "intro"),
    link("Volver al inicio", "index.html", "btn")
  );
  main.appendChild(article);
}

function router() {
  const page = document.body.dataset.page;
  const main = document.getElementById("contenido");
  main.replaceChildren();

  if (page === "404") {
    renderNotFound(main);
    setActiveNav(null);
    return;
  }

  const id = DATA.nav.some((n) => n.id === page) ? page : "inicio";

  // Enlaces antiguos (index.html#rol): llevan a la página nueva de esa sección
  const old = location.hash.slice(1);
  if (id === "inicio" && old !== "inicio" && DATA.nav.some((n) => n.id === old)) {
    location.replace(pageUrl(old));
    return;
  }

  if (id === "inicio") renderHome(main);
  else renderPage(main, DATA.pages[id], id);

  setActiveNav(id);
  initStructuredData(id);

  // El contenido se dibuja después de cargar: si la dirección trae #apartado, ir a él
  const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView();
}

/* ----------------------------------------------------------
   5. FONDO ANIMADO — Los Santos de noche
   Dos capas de edificios y palmeras que se desplazan despacio a
   distinta velocidad (efecto de profundidad), ancladas abajo.
   - Cada capa se dibuja UNA vez en un lienzo oculto y luego solo
     se desplaza, así que consume muy poco.
   - Se detiene con la pestaña oculta y queda fija si el usuario
     pide menos movimiento en su sistema.
   Para ajustarlo, cambia BG_LAYERS (colores, velocidad, altura).
   ---------------------------------------------------------- */
const BG_LAYERS = [
  // speed: píxeles por segundo · min/max: altura como fracción de la pantalla
  { color: "#19132f", lights: "rgba(255, 92, 198, .30)",  speed: 4,  min: .10, max: .26, palms: false },  // lejos
  { color: "#211940", lights: "rgba(255, 214, 120, .40)", speed: 10, min: .04, max: .15, palms: true }    // cerca
];

function initBackground() {
  const canvas = document.getElementById("bg");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0, height = 0, dpr = 1, tiles = [], frameId = 0, lastDraw = 0;

  // Generador aleatorio con semilla: la ciudad es siempre la misma
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawPalm(c, x, base, size, rand) {
    const topX = x + (rand() - .5) * size * .3;
    const topY = base - size;
    c.lineCap = "round";
    c.lineWidth = Math.max(2, size * .05);
    c.beginPath();
    c.moveTo(x, base);
    c.quadraticCurveTo(x + (topX - x) * 2, base - size * .5, topX, topY);
    c.stroke();
    c.lineWidth = Math.max(1.5, size * .035);
    for (let i = 0; i < 7; i++) {            // hojas en abanico
      const angle = Math.PI + (i / 6) * Math.PI;
      const len = size * (.38 + rand() * .12);
      const endX = topX + Math.cos(angle) * len;
      const endY = topY + Math.sin(angle) * len * .45 + len * .35;
      c.beginPath();
      c.moveTo(topX, topY);
      c.quadraticCurveTo(topX + Math.cos(angle) * len * .6, topY - len * .35, endX, endY);
      c.stroke();
    }
  }

  // Dibuja una capa completa en un lienzo oculto (una "baldosa" que se repite)
  function buildTile(layer, index) {
    const rand = seeded(1992 + index * 77);
    const w = Math.max(1400, Math.ceil(width / 200) * 200);
    const h = Math.ceil(height * layer.max) + (layer.palms ? 130 : 0);
    const tile = document.createElement("canvas");
    tile.width = w * dpr;
    tile.height = h * dpr;
    const c = tile.getContext("2d");
    c.scale(dpr, dpr);

    let x = 0;
    while (x < w) {
      const bw = Math.min(34 + rand() * 70, w - x);
      const bh = height * (layer.min + rand() * (layer.max - layer.min));
      c.fillStyle = layer.color;
      c.fillRect(x, h - bh, bw + 1, bh);
      // Ventanas encendidas
      c.fillStyle = layer.lights;
      for (let wy = h - bh + 8; wy < h - 6; wy += 9) {
        for (let wx = x + 5; wx < x + bw - 5; wx += 8) {
          if (rand() < .16) c.fillRect(wx, wy, 3, 4);
        }
      }
      x += bw;
    }
    if (layer.palms) {
      c.strokeStyle = layer.color;
      for (let px = 90 + rand() * 200; px < w - 60; px += 240 + rand() * 320) {
        drawPalm(c, px, h, 80 + rand() * 45, rand);
      }
    }
    return { canvas: tile, w, h, speed: layer.speed };
  }

  function draw(time) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    // Resplandor de la ciudad en el horizonte
    const glow = ctx.createLinearGradient(0, height * .5, 0, height);
    glow.addColorStop(0, "rgba(123, 44, 255, 0)");
    glow.addColorStop(1, "rgba(123, 44, 255, .13)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, height * .5, width, height * .5);

    tiles.forEach((t) => {
      const offset = -((time / 1000) * t.speed % t.w);
      for (let x = offset; x < width; x += t.w) {
        ctx.drawImage(t.canvas, x, height - t.h, t.w, t.h);
      }
    });
  }

  function loop(time) {
    frameId = requestAnimationFrame(loop);
    if (time - lastDraw < 33) return;          // ~30 fps es suficiente
    lastDraw = time;
    draw(time);
  }

  function start() {
    cancelAnimationFrame(frameId);
    if (reduceMotion.matches || document.hidden) draw(0);   // imagen fija
    else frameId = requestAnimationFrame(loop);
  }

  function resize() {
    // En móvil, la barra del navegador cambia la altura al desplazar: se ignora
    if (window.innerWidth === width && Math.abs(window.innerHeight - height) < 140) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    tiles = BG_LAYERS.map(buildTile);
    start();
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener("visibilitychange", start);
  reduceMotion.addEventListener("change", start);
  resize();
}

/* ----------------------------------------------------------
   6. GOOGLE ANALYTICS (GA4)
   Solo se carga si DATA.site.analyticsId (en data.js) tiene un ID y la
   web está publicada (no al abrir el archivo desde el disco). Cada
   sección es una página propia, así que GA4 cuenta las vistas solo.
   ---------------------------------------------------------- */
function initAnalytics() {
  const id = DATA.site.analyticsId;
  if (!id || location.protocol === "file:") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id);
  const script = el("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(script);
}

/* ----------------------------------------------------------
   7. SEO — datos estructurados (JSON-LD)
   Le explican a Google qué es cada página: el sitio (en Inicio), la
   ruta "Inicio › Sección" y las preguntas de la FAQ. Se generan solos
   a partir de data.js y de la dirección real de la web, así que no hay
   nada que mantener a mano. No se añaden al abrir el archivo desde el disco.
   El resto del SEO (título, descripción, vista previa al compartir)
   está en el <head> de cada .html, y en robots.txt y sitemap.xml.
   ---------------------------------------------------------- */
function initStructuredData(id) {
  if (location.protocol === "file:") return;
  const base = new URL(".", location.href).href;          // carpeta donde está publicado el portal
  const urlOf = (pid) => (pid === "inicio" ? base : base + pageUrl(pid));
  const graph = [];

  if (id === "inicio") {
    graph.push({
      "@type": "WebSite",
      name: DATA.site.title,
      alternateName: DATA.site.title + " · " + DATA.site.subtitle,
      url: base,
      inLanguage: "es",
      description: DATA.home.text
    }, {
      "@type": "Organization",
      name: DATA.site.title,
      url: "https://rol.dixel-rp.com/",
      logo: base + "img/dixel-logo.png",
      sameAs: DATA.site.social.map((s) => s.href)   // redes oficiales
    });
  } else {
    const page = DATA.pages[id];
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: base },
        { "@type": "ListItem", position: 2, name: page.title, item: urlOf(id) }
      ]
    });
    // Preguntas frecuentes: una entrada por pregunta
    const questions = page.blocks.filter((b) => b.type === "faq").flatMap((b) => b.items);
    if (questions.length) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: questions.map((q) => ({
          "@type": "Question",
          name: q.q,
          acceptedAnswer: { "@type": "Answer", text: q.a }
        }))
      });
    }
  }

  const script = el("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  document.head.appendChild(script);
}

/* Arranque */
function init() {
  renderLayout();        // barra, menú y pie (layout.js)
  initBackground();
  initAnalytics();
  router();
}

document.addEventListener("DOMContentLoaded", init);
