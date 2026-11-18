/* ==========================================================
   layout.js — Dixel RP · Portal de información

   La PLANTILLA COMÚN de todas las páginas: fondo, barra superior
   (navbar), menú y pie. Vive solo aquí: cada .html únicamente
   tiene su <head> y un <main> vacío, y este archivo dibuja el resto.

   - Para cambiar la estructura de la barra o del pie → edita
     LAYOUT_TOP / LAYOUT_BOTTOM aquí y cambia en todas las páginas.
   - Para añadir, quitar o reordenar enlaces del menú → edita
     DATA.nav en data.js (no hace falta tocar este archivo).

   Orden de carga: data.js → layout.js → app.js
   ========================================================== */

"use strict";

/* Lo que va ANTES del <main>: fondo, enlace de salto y barra superior. */
const LAYOUT_TOP = `
  <!-- Fondo animado: silueta nocturna de Los Santos (se dibuja en app.js) -->
  <canvas id="bg" class="bg" aria-hidden="true"></canvas>

  <a class="skip-link" href="#contenido">Saltar al contenido</a>

  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="index.html">
        <img src="img/dixel-logo.png" alt="" width="360" height="386">
        <span class="brand-text">
          <span id="brand-title" class="brand-title"></span>
          <span id="brand-subtitle" class="brand-subtitle"></span>
        </span>
      </a>

      <!-- Botón "Discord" (enlace en DATA.site.discord). En escritorio va a la
           derecha del menú; en móvil, junto a la hamburguesa; en pantallas muy
           estrechas pasa al final del menú desplegable. -->
      <a id="discord-cta" class="discord-cta topbar-cta" hidden>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>
        <span>Discord</span>
      </a>

      <!-- Botón hamburguesa (solo visible en móvil) -->
      <button id="menu-toggle" class="menu-toggle" type="button"
              aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">
        <span></span><span></span><span></span>
      </button>

      <nav id="nav" class="nav" aria-label="Secciones del portal">
        <ul id="nav-list" class="nav-list"></ul>
      </nav>
    </div>
  </header>`;

/* Lo que va DESPUÉS del <main>: el pie. */
const LAYOUT_BOTTOM = `
  <footer class="site-footer">
    <div class="container footer-inner">
      <p id="server-status" class="status"></p>
      <ul id="social" class="social" aria-label="Redes de Dixel RP"></ul>
      <p id="copyright" class="copyright"></p>
    </div>
  </footer>`;

/** Dirección del archivo de una sección. */
function pageUrl(id) {
  return id === "inicio" ? "index.html" : id + ".html";
}

/** Dibuja la plantilla alrededor del <main> y la rellena con DATA. */
function renderLayout() {
  const main = document.getElementById("contenido");
  main.insertAdjacentHTML("beforebegin", LAYOUT_TOP);
  main.insertAdjacentHTML("afterend", LAYOUT_BOTTOM);

  document.getElementById("brand-title").textContent = DATA.site.title;
  document.getElementById("brand-subtitle").textContent = DATA.site.subtitle;

  buildNav();

  // Botón de Discord: en la barra y, para pantallas muy estrechas, al final del menú
  if (DATA.site.discord) {
    const cta = document.getElementById("discord-cta");
    cta.href = DATA.site.discord;
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    cta.setAttribute("aria-label", "Entrar al Discord de " + DATA.site.title + " (se abre en otra pestaña)");
    cta.hidden = false;
    const item = el("li", undefined, "nav-cta-item");
    const menuCta = link("Entrar al Discord", DATA.site.discord, "discord-cta", true);
    item.appendChild(menuCta);
    document.getElementById("nav-list").appendChild(item);
  }

  // Pie: estado del servidor y copyright con año dinámico
  const online = DATA.site.serverOnline;
  const status = document.getElementById("server-status");
  status.classList.add(online ? "online" : "offline");
  status.append(document.createTextNode("Servidor "), el("strong", online ? "online" : "offline"));
  const srv = DATA.site.server;
  if (srv) status.append(document.createTextNode(" · " + srv.host + ":" + srv.port));

  // Redes oficiales (DATA.site.social)
  const social = document.getElementById("social");
  (DATA.site.social || []).forEach((s) => social.appendChild(el("li")).appendChild(link(s.label, s.href, undefined, true)));
  document.getElementById("copyright").textContent = "© " + new Date().getFullYear() + " " + DATA.site.title;

  initMenu();
}

/** Menú: enlaces sueltos y un desplegable (<details> nativo) por cada "group". */
function buildNav() {
  const list = document.getElementById("nav-list");
  const navLink = (n) => {
    const a = link(n.label, pageUrl(n.id));
    a.dataset.id = n.id;
    // Dentro de los desplegables, una línea que explica la sección (solo en escritorio)
    if (n.group && n.desc) {
      a.textContent = "";
      a.append(el("span", n.label, "nav-label"), el("span", n.desc, "nav-desc"));
    }
    return a;
  };
  const groups = {};   // nombre del grupo → su <ul>
  DATA.nav.forEach((n) => {
    if (!n.group) {
      list.appendChild(el("li")).appendChild(navLink(n));
      return;
    }
    if (!groups[n.group]) {
      const group = el("details", undefined, "nav-more");
      groups[n.group] = el("ul");
      group.append(el("summary", n.group), groups[n.group]);
      list.appendChild(el("li")).appendChild(group);
    }
    groups[n.group].appendChild(el("li")).appendChild(navLink(n));
  });
}

/** Marca en el menú la sección en la que estamos. */
function setActiveNav(id) {
  document.querySelectorAll("#nav-list a").forEach((a) => {
    if (a.dataset.id === id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  // Marca el desplegable que contiene la sección activa
  navGroups().forEach((g) => g.classList.toggle("current", !!g.querySelector('[aria-current="page"]')));
  closeMenu();
}

/* Menú móvil y desplegables por categoría ("Primeros pasos", "Normas", "Comunidad") */
const mobileNav = window.matchMedia("(max-width: 759px)");   // mismo corte que styles.css
const navGroups = () => document.querySelectorAll("#nav-list .nav-more");

/** En móvil los desplegables van siempre abiertos (su nombre queda como
 *  título del grupo); en escritorio se cierran. */
function syncMore() {
  navGroups().forEach((g) => { g.open = mobileNav.matches; });
}

function closeMenu() {
  syncMore();
  const toggle = document.getElementById("menu-toggle");
  document.getElementById("nav").classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menú");
}

function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
      return;
    }
    navGroups().forEach((g) => {
      if (!g.open) return;
      g.open = false;
      g.querySelector("summary").focus();
    });
  });
  document.addEventListener("click", (e) => {
    // En móvil el nombre del grupo es solo un título: no pliega nada
    if (mobileNav.matches) {
      if (e.target.closest(".nav-more summary")) e.preventDefault();
      return;
    }
    // En escritorio: clic fuera de un desplegable abierto = cerrarlo
    // (también cierra uno al abrir el otro)
    navGroups().forEach((g) => { if (g.open && !g.contains(e.target)) g.open = false; });
  });
  mobileNav.addEventListener("change", syncMore);
  // Al pulsar un enlace del menú, cerrarlo
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
}
