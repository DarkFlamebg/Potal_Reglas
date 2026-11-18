/* ==========================================================
   home.js — Animaciones de la página de Inicio (anime.js 3)

   Solo se carga en index.html. app.js dibuja la página y luego
   llama a initHomeMotion(main). Todo es "mejora progresiva":
   - Si anime.js no carga, la portada se ve completa y fija, y el
     índice de capturas sigue funcionando (sin transición).
   - Si el sistema pide menos movimiento, no hay entrada animada,
     ni carrusel, ni contadores: todo aparece directamente.

   Qué se anima:
   1. Entrada  → las esquinas de visor se dibujan, el título sube línea
                 a línea y el resto aparece en cascada.
   2. Carrusel → cada captura entra con una cortinilla y una línea rosa,
                 con un zoom lento mientras se ve. El índice de la derecha
                 marca el progreso y permite saltar a cualquier captura.
                 Se detiene si la portada no se ve o la pestaña está oculta.
   3. Detalles → el punto de "Servidor online" late y la línea de
                 "Explorar" baja en bucle.
   4. Cifras y tarjetas → cuentan y entran escalonadas al aparecer.

   Para ajustar los tiempos, cambia HOME_MOTION.
   ========================================================== */

"use strict";

const HOME_MOTION = {
  slideTime: 7000,    // ms que se ve cada captura
  wipeTime: 1300,     // ms de la cortinilla entre capturas
  zoom: [1.04, 1.12]  // escala al empezar y al terminar cada captura
};

function initHomeMotion(main) {
  if (typeof anime !== "function") return;                       // sin anime.js: página estática
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const hero = main.querySelector(".home-hero");
  const $ = (sel) => hero.querySelector(sel);
  const $$ = (sel) => hero.querySelectorAll(sel);
  const slides = [...$$(".hero-slide")];
  const buttons = [...$$(".hero-index-btn")];
  const fills = buttons.map((b) => b.querySelector(".fill"));
  const wipe = $(".hero-wipe");
  document.documentElement.classList.add("motion");               // estados iniciales (ver styles.css)

  /* ---------- 1. Entrada ---------- */
  anime.timeline({ easing: "easeOutExpo" })
    .add({ targets: $(".hero-slides"), opacity: [0, 1], scale: [1.12, 1], duration: 2200, easing: "easeOutCubic" })
    .add({ targets: $$(".corner"), scale: [0, 1], opacity: [0, 1], duration: 900, delay: anime.stagger(90) }, 300)
    .add({ targets: $(".hero-eyebrow"), opacity: [0, 1], translateY: [10, 0], duration: 900 }, 500)
    .add({ targets: $$(".hero-title .line-in"), translateY: ["105%", "0%"], duration: 1300, delay: anime.stagger(140) }, 600)
    .add({ targets: $(".hero-lead"), opacity: [0, 1], translateY: [14, 0], duration: 1000 }, 1050)
    .add({ targets: $$(".hero-actions > *"), opacity: [0, 1], translateY: [12, 0], duration: 900, delay: anime.stagger(100) }, 1200)
    .add({ targets: $$(".hero-index li"), opacity: [0, 1], translateX: [16, 0], duration: 900, delay: anime.stagger(70) }, 1100)
    .add({ targets: $(".hero-bar"), opacity: [0, 1], duration: 900 }, 1450)
    .add({ targets: $(".hero-rule"), scaleX: [0, 1], duration: 1400, easing: "easeInOutQuart" }, 1450);

  /* ---------- 3. Detalles en bucle ---------- */
  const ring = $(".dot:not(.off) .ring");
  if (ring) anime({ targets: ring, scale: [1, 2.8], opacity: [.6, 0], duration: 1800, easing: "easeOutSine", loop: true });
  anime({
    targets: $(".cue span"), translateY: ["-100%", "100%"],
    duration: 1600, easing: "easeInOutQuart", loop: true, delay: 2000, endDelay: 200
  });

  /* ---------- 2. Carrusel ---------- */
  const loadSlide = (img) => {
    if (!img.dataset.src) return;
    img.sizes = "100vw";
    img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    delete img.dataset.src;
  };
  setTimeout(() => slides.slice(1).forEach(loadSlide), 1500);    // el resto, cuando la primera ya se ve

  let current = 0;
  let kenBurns = null;
  let progress = null;
  let timer = 0;
  let running = false;
  let busy = false;

  // Zoom lento de la captura activa y barra de progreso de su botón
  function startSlide(i) {
    kenBurns = anime({
      targets: slides[i], scale: HOME_MOTION.zoom,
      duration: HOME_MOTION.slideTime + HOME_MOTION.wipeTime, easing: "linear"
    });
    fills.forEach((f, j) => { if (j !== i) f.style.transform = "scaleX(0)"; });
    progress = anime({ targets: fills[i], scaleX: [0, 1], duration: HOME_MOTION.slideTime, easing: "linear" });
    buttons.forEach((b, j) => {
      if (j === i) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  }

  function goTo(i) {
    if (busy || i === current) return;
    busy = true;
    clearTimeout(timer);
    if (kenBurns) kenBurns.pause();
    const prev = slides[current];
    const img = slides[i];
    loadSlide(img);
    current = i;

    // La nueva captura entra de izquierda a derecha por encima de la anterior
    img.style.zIndex = 2;
    prev.style.zIndex = 1;
    img.classList.add("is-active");
    const width = hero.offsetWidth;
    anime({
      targets: img, clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
      duration: HOME_MOTION.wipeTime, easing: "easeInOutQuart",
      complete: () => {
        prev.classList.remove("is-active");
        prev.style.zIndex = "";
        img.style.zIndex = "";
        img.style.clipPath = "";
        busy = false;
      }
    });
    anime({
      targets: wipe, translateX: [0, width], opacity: [{ value: 1, duration: 120 }, { value: 0, duration: 260, delay: HOME_MOTION.wipeTime - 380 }],
      duration: HOME_MOTION.wipeTime, easing: "easeInOutQuart"
    });
    startSlide(i);
    if (running) timer = setTimeout(() => goTo((current + 1) % slides.length), HOME_MOTION.slideTime);
  }

  function play() {
    if (running) return;
    running = true;
    if (!kenBurns) startSlide(0);
    else { kenBurns.play(); progress.play(); }
    const left = HOME_MOTION.slideTime * (1 - progress.progress / 100);
    timer = setTimeout(() => goTo((current + 1) % slides.length), left);
  }
  function pause() {
    if (!running) return;
    running = false;
    clearTimeout(timer);
    if (kenBurns) { kenBurns.pause(); progress.pause(); }
  }

  hero.addEventListener("hero:goto", (e) => goTo(e.detail));

  // Solo se mueve si la portada está a la vista y la pestaña visible
  let heroVisible = true;
  const sync = () => (heroVisible && !document.hidden ? play() : pause());
  new IntersectionObserver((entries) => { heroVisible = entries[0].isIntersecting; sync(); }).observe(hero);
  document.addEventListener("visibilitychange", sync);

  /* ---------- 4. Cifras y tarjetas al aparecer ---------- */
  const reveal = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const t = entry.target;

      if (t.classList.contains("home-stats")) {
        anime({ targets: t.querySelectorAll("li"), opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(90), duration: 900, easing: "easeOutExpo" });
        t.querySelectorAll(".stat-num").forEach((num, i) => {
          const counter = { v: 0 };
          anime({
            targets: counter, v: Number(num.dataset.value), round: 1,
            duration: 1600, delay: 150 + i * 90, easing: "easeOutExpo",
            update: () => { num.textContent = counter.v; }
          });
        });
      } else {
        anime({ targets: t.querySelectorAll(".home-group"), opacity: [0, 1], translateY: [28, 0], delay: anime.stagger(120), duration: 1000, easing: "easeOutExpo" });
        anime({ targets: t.querySelectorAll(".home-group li"), opacity: [0, 1], translateX: [-10, 0], delay: anime.stagger(45, { start: 250 }), duration: 700, easing: "easeOutQuad" });
      }
    });
  }, { threshold: .2 });
  main.querySelectorAll(".home-stats, .home-groups").forEach((n) => reveal.observe(n));
}
