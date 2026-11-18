/* ==========================================================
   data.js — Dixel RP · Portal de información

   TODO el contenido editable del portal está en el objeto DATA.
   Se carga antes que app.js, que es quien lo dibuja.
   Los textos entre [CORCHETES] son placeholders a reemplazar.

   Si añades una sección nueva:
   1. Ponla en DATA.nav (aparece sola en el menú de todas las páginas)
      y en DATA.pages.
   2. Crea su archivo <id>.html copiando el de otra sección y cambia
      el título, la descripción, las direcciones (canonical y og:url)
      y data-page="<id>".
   3. Añade su dirección a sitemap.xml.
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. DATOS EDITABLES

   Tipos de bloque para "blocks":
   - { type: "text" | "intro" | "heading" | "notice", text }
   - { type: "list",  items: ["..."] }                      lista simple
   - { type: "rules", items: ["..."] }                      reglas numeradas 01, 02…
   - { type: "cards", items: [{ title, text }] }
   - { type: "table", headers: [...], rows: [[...]] }
   - { type: "links", items: [{ label, text, href? }] }
   - { type: "faq",   items: [{ q, a, links?: [{ label, href }] }] }
   - { type: "glossary",  groups: [{ title, items: [{ term, name, text, example? }] }] }
   - { type: "sanctions", groups: [{ title, note?, items: [[nombre, nivel 1-5, duración, descripción?, enlaceEjemplo?]] }] }
   - { type: "server" }                                     recuadro con la IP (DATA.site.server) y botones Conectar / Copiar IP
   - { type: "downloads", items: [{ title, status?, performance?, contains?[], note?, video?, image?, link }] }
   ---------------------------------------------------------- */
const DATA = {
  site: {
    title: "Dixel RP",
    subtitle: "Portal de información",
    // Estado mostrado en el pie. Es un valor fijo: cámbialo a mano.
    serverOnline: true,
    // ID de medición de Google Analytics 4 (formato "G-XXXXXXXXXX").
    // Vacío = no se carga Analytics.
    analyticsId: "",
    // Dirección del servidor de juego (se muestra en Cómo empezar)
    server: { host: "S1.DIXEL-RP.COM", port: 7777 },
    // Invitación al Discord de la comunidad
    discord: "https://discord.gg/D8T9nZ4",
    // Redes oficiales: aparecen en el pie de todas las páginas
    social: [
      { label: "Discord", href: "https://discord.gg/D8T9nZ4" },
      { label: "YouTube", href: "https://www.youtube.com/DixelYT" },
      { label: "Twitch", href: "https://www.twitch.tv/dixelito" },
      { label: "Instagram", href: "https://www.instagram.com/dixelrp/" },
      { label: "Facebook", href: "https://www.facebook.com/DixelRP/" },
      { label: "X (Twitter)", href: "https://twitter.com/Dixel_Oficial" }
    ]
  },

  // Texto de la página de inicio
  home: {
    eyebrow: "Dixel RP · Servidor de rol SA:MP",
    // Título de la portada: una entrada por línea. La línea highlightLine va en rosa.
    title: ["Rolea en", "Los Santos."],
    highlightLine: 1,
    // Capturas de la portada (img/hero/<nombre>-800.webp y -1600.webp), en orden.
    // caption: nombre que aparece en el índice de la derecha.
    slides: [
      { src: "img/hero/carretera", caption: "Autopista de Los Santos" },
      { src: "img/hero/control", caption: "Zona restringida" },
      { src: "img/hero/soldados", caption: "Ejército en formación" },
      { src: "img/hero/moto", caption: "Ruta por la montaña" },
      { src: "img/hero/noche", caption: "Patrulla nocturna" }
    ],
    text: "El portal de Dixel RP, servidor de rol de GTA San Andreas. Todo lo que necesitas para jugar: cómo empezar, normas, sanciones, facciones, descargas y contacto con el Staff."
  },

  // Enlaces de la barra superior, en el orden en que se muestran (el id es también el #hash).
  // Los que comparten "group" se juntan en un desplegable con ese nombre,
  // colocado donde aparece el primero del grupo.
  nav: [
    // Categorías del menú:
    //   Primeros pasos → todo lo necesario para empezar a jugar
    //   Normas         → reglas, sanciones y conceptos de rol
    //   Comunidad      → facciones, Staff y enlaces externos
    { id: "inicio", label: "Inicio" },
    { id: "empezar", label: "Cómo empezar", group: "Primeros pasos", desc: "IP del servidor y los pasos para entrar por primera vez." },
    { id: "descargas", label: "Descargas", group: "Primeros pasos", desc: "Versiones de GTA optimizadas, listas para jugar." },
    { id: "faq", label: "Preguntas frecuentes", group: "Primeros pasos", desc: "Dudas habituales: IP, requisitos, compras, reportes y más." },
    { id: "servidor", label: "Normas del servidor", group: "Normas", desc: "Reglas del juego de rol dentro del servidor." },
    { id: "rol", label: "Conceptos de rol", group: "Normas", desc: "Glosario de siglas (DM, PG, MG…) con buscador." },
    { id: "sanciones", label: "Sanciones", group: "Normas", desc: "Tiempos de jail y penalizaciones por cada falta." },
    { id: "discord", label: "Reglas de Discord", group: "Normas", desc: "Las 12 reglas de convivencia del Discord." },
    { id: "ciberacoso", label: "Ciberacoso", group: "Normas", desc: "Qué se considera ciberacoso y cómo denunciarlo." },
    { id: "facciones", label: "Facciones", group: "Comunidad", desc: "Facciones legales, bandas, mafias y cómo postular." },
    { id: "staff", label: "Staff y contacto", group: "Comunidad", desc: "A quién escribir y por qué vía según lo que necesites." },
    { id: "enlaces", label: "Enlaces", group: "Comunidad", desc: "Foro, tienda, catálogos, guías y redes sociales." }
  ],

  // Captura de fondo de la cabecera de cada sección, según su categoría
  // (ruta sin "-800.webp" / "-1600.webp", igual que en home.slides)
  groupImages: {
    "Primeros pasos": "img/hero/carretera",
    "Normas": "img/hero/control",
    "Comunidad": "img/hero/soldados"
  },

  /* PÁGINAS — una por enlace del menú (menos Inicio) */
  pages: {
    empezar: {
      title: "Cómo empezar",
      blocks: [
        { type: "intro", text: "Los pasos para entrar a Dixel RP por primera vez." },
        // Recuadro con la IP y los botones Conectar / Copiar IP (usa DATA.site.server)
        { type: "server" },
        { type: "rules", items: [
          "Consigue el juego. Necesitas GTA San Andreas para PC; no hace falta que sea original. Si no lo tienes, elige una versión en la sección Descargas.",
          "Instala SA-MP. Te recomendamos una versión actualizada; cualquier versión compatible te permite entrar al servidor.",
          "Añade el servidor a tus favoritos de SA-MP con la dirección S1.DIXEL-RP.COM:7777, o pulsa Conectar en el recuadro de arriba.",
          "Crea tu cuenta al entrar. [Indica aquí el formato de nombre que exige el servidor, por ejemplo Nombre_Apellido.]",
          "Entra al Discord de la comunidad. Es obligatorio usar allí tu nombre IC.",
          "Lee las reglas de Discord, las normas del servidor y los conceptos de rol antes de jugar. Así evitas sanciones por desconocimiento."
        ]},
        { type: "links", items: [
          { label: "Discord", text: "Únete al Discord de Dixel RP", href: "https://discord.gg/D8T9nZ4" }
        ]},
        { type: "heading", text: "Requisitos del PC" },
        { type: "text", text: "Los mismos que GTA San Andreas, o incluso menos: en la sección Descargas hay versiones optimizadas y estables (FPS Up y Low) pensadas para PC de bajos recursos." },
        { type: "heading", text: "Recluta a un amigo" },
        { type: "text", text: "Invita a tus amigos a Dixel RP y ganad Dix los dos:" },
        { type: "list", items: [
          "Cuando un amigo que invitaste llega a nivel 15, los dos recibís 1 Dix.",
          "Recibes 1 Dix por cada compra de 40 Dix o más que haga tu invitado."
        ]},
        { type: "links", items: [
          { label: "Más información", text: "Recluta a un amigo", href: "https://rol.dixel-rp.com/recluta-a-un-amigo/" }
        ]},
        { type: "heading", text: "Si algo falla" },
        { type: "text", text: "Revisa las preguntas frecuentes. Si tu duda no está ahí, abre un ticket en Discord: en la sección Staff y contacto se explica cuál elegir." }
      ]
    },

    facciones: {
      title: "Facciones",
      blocks: [
        { type: "intro", text: "Las facciones del servidor y cómo entrar en una." },
        { type: "notice", text: "[Pendiente: las descripciones de las facciones legales son de ejemplo; añade las que falten.]" },
        { type: "heading", text: "Facciones legales" },
        { type: "cards", items: [
          { title: "SAAR", text: "[Describe aquí la facción: a qué se dedica, requisitos y quién la lidera.]" },
          { title: "CNN", text: "[Describe aquí la facción: a qué se dedica, requisitos y quién la lidera.]" },
          { title: "Mecánicos", text: "[Describe aquí la facción: a qué se dedica, requisitos y quién la lidera.]" },
          { title: "Abogados", text: "[Describe aquí la facción: a qué se dedica, requisitos y quién la lidera.]" }
        ]},
        { type: "heading", text: "Bandas y facciones ilegales" },
        { type: "text", text: "Estas son las bases (HQ) activas ahora mismo. Para entrar a una HQ en estado Fortaleza hace falta el número mínimo de oficiales de la ley que se indica." },
        // photo: imagen de la HQ guardada en img/bases/ (1280×720 recomendado).
        // Una entrada por base. color: celeste, negro, verde, rosa o rojo (ver styles.css).
        // Los huecos libres son { empty: true }: sustitúyelos por una base nueva.
        { type: "bases", items: [
          { kind: "Banda", name: "The OWL'S", leader: "Florencia Holland", color: "celeste", colorName: "Celeste", status: "Fortaleza", officers: 5, photo: "img/bases/owls.jpg" },
          { kind: "Mafia", name: "Italian Gang", leader: "Homer Bonucci", color: "negro", colorName: "Negro", status: "Fortaleza", officers: 5, photo: "img/bases/italian-gang.jpg" },
          { kind: "Banda", name: "Grove Street Families", leader: "Carl Jhonson", color: "verde", colorName: "Verde", status: "Fortaleza", officers: 5, photo: "img/bases/grove-street.jpg" },
          { kind: "Banda", name: "12 G4NG", leader: "Tania Kim", color: "rosa", colorName: "Rosa claro", status: "Fortaleza", officers: 5, photo: "img/bases/12-gang.jpg" },
          { kind: "Mafia", name: "+57MAFIA †", leader: "Connor Mclean", color: "rojo", colorName: "Rojo", status: "Fortaleza", officers: 5, photo: "img/bases/57-mafia.jpg" },
          { empty: true },
          { empty: true }
        ]},
        { type: "heading", text: "Cómo postular" },
        { type: "text", text: "Cada facción decide cuándo abre sus convocatorias. Espera a que abran y sigue las instrucciones. Esta guía te explica cómo hacer el CV." },
        { type: "links", items: [
          { label: "Guía", text: "Cómo hacer un CV", href: "https://rol.dixel-rp.com/foro/index.php?topic=44168.0" }
        ]},
        { type: "heading", text: "Faltas propias de las facciones" },
        { type: "text", text: "El Team Kill (TK), invadir una base enemiga sin el mínimo de usuarios (IHQ) y el abuso de facción (FA) se sancionan. Los tiempos están en la sección Sanciones." }
      ]
    },

    staff: {
      title: "Staff y contacto",
      blocks: [
        { type: "intro", text: "A quién escribir y por qué vía, según lo que necesites." },
        { type: "heading", text: "Tickets en Discord" },
        { type: "text", text: "Casi todo se gestiona con un ticket en el canal de tickets de Discord. Elige la opción que corresponda." },
        { type: "links", items: [
          { label: "Compra Dix", text: "Compraste Dix en la web y no los has recibido." },
          { label: "Solicitar Admin", text: "Encontraste un bug o necesitas la ayuda de un administrador." },
          { label: "Queja Staff", text: "Un miembro del Staff cometió una falta o abusa de su poder. También sirve para denunciar ciberacoso. Incluye pruebas." }
        ]},
        { type: "heading", text: "Reportes de usuarios" },
        { type: "text", text: "Las faltas de rol de otros usuarios se reportan en el foro, con pruebas y con el formato obligatorio." },
        { type: "links", items: [
          { label: "Foro", text: "Apartado de reportes a usuarios", href: "https://rol.dixel-rp.com/foro/index.php?board=55.0" },
          { label: "Formato", text: "Formato obligatorio para reportes", href: "https://rol.dixel-rp.com/foro/index.php?topic=53637.0" }
        ]},
        { type: "heading", text: "Denuncias de ciberacoso" },
        { type: "text", text: "Además del ticket de Queja Staff, puedes escribir directamente a Dreak Vasiliev o Raquel Ficcuchi. Las denuncias son anónimas." },
        { type: "heading", text: "Rangos del Staff" },
        { type: "text", text: "De menor a mayor rango. La lista actualizada de miembros está en el canal de Discord dedicado al equipo." },
        { type: "table",
          headers: ["Rango", "Función", "Tareas"],
          rows: [
            ["Ayudante", "Apoya a los jugadores nuevos, resuelve dudas y asiste a los moderadores.", "Responder preguntas frecuentes, asegurar las reglas básicas y dar soporte inicial."],
            ["Soporte", "Apoya a los jugadores, resuelve solicitudes y asiste a los moderadores.", "Soporte a usuarios y comandos de ayuda a usuarios."],
            ["Moderador", "Mantiene el orden, aplica sanciones leves (kick/mute) y revisa reportes.", "Aplicar sanciones temporales y asistir a los operadores."],
            ["Operador", "Moderación avanzada, bans y problemas técnicos. Supervisa a ayudantes y moderadores.", "Bans temporales o permanentes, soporte técnico y supervisión."],
            ["Administrador", "Toma las decisiones críticas, supervisa al Staff y desarrolla las políticas.", "Control de la conducta del Staff y seguimiento de los casos graves."],
            ["Desarrollador (Dev)", "Scripts, sistemas y resolución técnica, en colaboración con los administradores.", "Desarrollo y mantenimiento de las mecánicas del servidor."]
          ]
        },
        { type: "heading", text: "Encargados" },
        { type: "text", text: "Cargos con un área concreta a su cargo dentro del Staff." },
        { type: "table",
          headers: ["Cargo", "Responsabilidad"],
          rows: [
            ["Director General", "Encargado general del servidor. Subdueño."],
            ["Encargado General", "Supervisor general de las gerencias y del Staff."],
            ["Encargado de Staff", "Supervisa el estado activo del Staff."],
            ["Gerencia Administrativa", "Gestiones internas del Staff."],
            ["Gerencia Operativa", "Soporte a las gestiones internas del Staff."],
            ["Supervisores", "Supervisan al Staff de rango Moderador y Ayudante."],
            ["Encargado de Facciones", "Coordina las facciones y supervisa sus reglas."],
            ["Encargado de Tickets de Discord", "Gestión del soporte y de sus prioridades."],
            ["Encargado de Moderadores", "Capacitación y revisión de decisiones."],
            ["Encargado de Ayudantes", "Gestión y feedback de los ayudantes."],
            ["Encargado de Marketing", "Campañas, redes y promoción."]
          ]
        }
      ]
    },

    enlaces: {
      title: "Enlaces",
      blocks: [
        { type: "intro", text: "Los sitios de Dixel RP fuera de este portal." },
        { type: "heading", text: "Comunidad" },
        { type: "links", items: [
          { label: "Web", text: "Página principal de Dixel RP", href: "https://rol.dixel-rp.com/" },
          { label: "Foro", text: "Foro de Dixel RP", href: "https://rol.dixel-rp.com/foro/" },
          { label: "Discord", text: "Servidor de Discord de la comunidad", href: "https://discord.gg/D8T9nZ4" },
          { label: "Noticias", text: "Novedades y eventos del servidor", href: "https://rol.dixel-rp.com/noticias/" },
          { label: "Log de cambios", text: "Actualizaciones del servidor", href: "https://rol.dixel-rp.com/log-cambios/" },
          { label: "Recluta a un amigo", text: "Gana Dix invitando a tus amigos", href: "https://rol.dixel-rp.com/recluta-a-un-amigo/" }
        ]},
        { type: "heading", text: "Redes sociales" },
        { type: "links", items: [
          { label: "YouTube", text: "DixelYT", href: "https://www.youtube.com/DixelYT" },
          { label: "Twitch", text: "dixelito", href: "https://www.twitch.tv/dixelito" },
          { label: "Instagram", text: "@dixelrp", href: "https://www.instagram.com/dixelrp/" },
          { label: "Facebook", text: "DixelRP", href: "https://www.facebook.com/DixelRP/" },
          { label: "X (Twitter)", text: "@Dixel_Oficial", href: "https://twitter.com/Dixel_Oficial" }
        ]},
        { type: "heading", text: "Tienda y catálogos" },
        { type: "links", items: [
          { label: "Tienda", text: "Página principal de la tienda", href: "https://rol.dixel-rp.com/control/tienda/index.html" },
          { label: "Vehículos", text: "Catálogo de vehículos", href: "https://rol.dixel-rp.com/control/tienda/catalogo-vehiculos.html" },
          { label: "Skins", text: "Catálogo de skins", href: "https://rol.dixel-rp.com/control/tienda/catalogo-skins.html" },
          { label: "Bases", text: "Catálogo de bases", href: "https://rol.dixel-rp.com/control/tienda/catalogo-bases.html" }
        ]},
        { type: "heading", text: "Foro: reportes y solicitudes" },
        { type: "links", items: [
          { label: "Reportes", text: "Apartado de reportes a usuarios", href: "https://rol.dixel-rp.com/foro/index.php?board=55.0" },
          { label: "Formato", text: "Formato obligatorio para reportes", href: "https://rol.dixel-rp.com/foro/index.php?topic=53637.0" },
          { label: "Mapeos", text: "Solicitudes de mapeo de garajes", href: "https://rol.dixel-rp.com/foro/index.php?board=53.0" }
        ]},
        { type: "heading", text: "Guías del foro" },
        { type: "links", items: [
          { label: "CV", text: "Cómo hacer un CV para postular a una facción", href: "https://rol.dixel-rp.com/foro/index.php?topic=44168.0" },
          { label: "Imágenes", text: "Cómo colocar imágenes en un tema", href: "https://rol.dixel-rp.com/foro/index.php?topic=4248.0" }
        ]}
      ]
    },

    rol: {
      title: "Conceptos de rol",
      blocks: [
        { type: "intro", text: "Guía de los conceptos de rol más usados en el servidor, para que puedas jugar sin inconvenientes. Si falta alguno, avisa al Staff." },
        { type: "glossary", groups: [
          { title: "Fundamentos", items: [
            { term: "IC", name: "In Character", text: "Medio de información accesible que tiene tu personaje." },
            { term: "OOC", name: "Out Of Character", text: "Medio de información accesible del jugador." },
            { term: "MG", name: "Meta Gaming", text: "Usar información OOC en beneficio IC, o al revés." },
            { term: "CC", name: "Confundir Canales", text: "Confundir los canales IC con los OOC." },
            { term: "PG", name: "Power Gaming", text: "Realizar acciones imposibles en la vida real o que nunca harías." },
            { term: "PG2", name: "Forzar rol", text: "Forzar el rol y hacerlo en beneficio propio.", example: "Mentirle a un usuario sobre lo que llevas encima para salvar algo, mientras te está haciendo un rol de revisión." },
            { term: "NIP", name: "Nula Interpretación del Personaje", text: "Nulo rol a la hora de interpretar una acción.", example: "Siendo SAPD/SAFA, colocar un cepo a un vehículo sin rol alguno." },
            { term: "AFK", name: "Away From Keyboard", text: "Estar lejos de tu PC o teclado." },
            { term: "AVP", name: "AFK en Vía Pública", text: "Estar fuera del juego pero conectado en una zona pública.", example: "Estar AFK en la comisaría." }
          ]},
          { title: "No rolear", items: [
            { term: "NRA", name: "No Rolear Arma", text: "No rolear recargar, sacar, quitar el seguro, recoger o tirar un arma." },
            { term: "NRE", name: "No Rolear Entorno", text: "No rolear el entorno que rodea a tu personaje.", example: "Sacar un arma en la comisaría de Los Santos." },
            { term: "NRH", name: "No Rolear Heridas", text: "No rolear la herida cuando te disparan, te pegan o te clavan algo." },
            { term: "NRC", name: "No Rolear Choque", text: "No hacer el rol al chocar.", example: "Chocar a 100 km/h y seguir de largo." }
          ]},
          { title: "Combate y muerte", items: [
            { term: "DM", name: "Death Match", text: "Pegar o asesinar sin razón a alguien, con un arma o con los puños." },
            { term: "NVVPJ", name: "No Valorar la Vida de tu Personaje", text: "Hacer cualquier cosa que arriesgue la vida de tu PJ.", example: "Meterte en medio de un tiroteo sin armas." },
            { term: "ER", name: "Evadir Rol", text: "Desconectarte, forzar un crash o usar /morir (hay más formas) para evadir un rol que te están haciendo." },
            { term: "EK", name: "Evadir Kill", text: "Desconectarte o usar un comando que te beneficie, como teletransportarte, para evitar que tu PJ termine abatido.", example: "En facciones legales como SAFA: /castigar [ID] [Tiempo]." },
            { term: "ZZ", name: "Zig Zag", text: "Hacer zigzag para que no te peguen las balas." },
            { term: "RK", name: "Revenge Kill", text: "Ir a asesinar o dañar a quien te asesinó después de haber muerto en un rol." },
            { term: "MK", name: "Meta Kill", text: "Asesinar a alguien IC por motivos OOC." },
            { term: "SK", name: "Spawn Kill", text: "Asesinar a un usuario que entra o sale de un lugar. Al entrar o salir hay que esperar 5 segundos a que se descongele la pantalla." },
            { term: "PK", name: "Player Kill", text: "Se aplica cuando el personaje muere de forma involuntaria, sin que el jugador tuviera intención de que muriera. Se interpreta que quien murió fue otra persona (un NPC) y el personaje original pierde los hechos que provocaron la muerte." },
            { term: "CK2", name: "Character Kill", text: "Muerte definitiva del personaje más ban de cuenta. Ambos bandos deben estar de acuerdo para hacer este rol." }
          ]},
          { title: "Vehículos", items: [
            { term: "CJ", name: "Car Jacked", text: "Robar vehículos sin rol (básicamente pulsando F o Enter)." },
            { term: "CK", name: "Car Kill", text: "Matar o atropellar con un auto a un usuario del servidor." },
            { term: "HK", name: "Helicopter Kill", text: "Matar con las hélices del helicóptero." },
            { term: "BD", name: "Bad Driving", text: "Manejar mal, por el carril contrario o por la acera." },
            { term: "DB", name: "Drive-By", text: "Disparar con armas desde el asiento del conductor." },
            { term: "BPC", name: "Bad Parking Car", text: "Estacionar tu vehículo de forma antiroleplay." },
            { term: "BJ/BH", name: "Bunny Jump / Bunny Hop", text: "Saltar repetidas veces para llegar más rápido a un lugar." },
            { term: "BH2/BBH", name: "Bike Bunny Hop", text: "Saltar repetidas veces con la bicicleta." }
          ]},
          { title: "Facciones", items: [
            { term: "TK", name: "Team Kill", text: "Asesinar a miembros de tu facción o banda." },
            { term: "HQ", name: "Head Quarters", text: "La base de una facción." },
            { term: "IHQ", name: "Invasion Head Quarters", text: "Invadir la base de una facción enemiga con menos de 4/5 usuarios (depende del servidor)." },
            { term: "AA", name: "Admin Abuser", text: "Cuando un rango superior abusa de su posición con comandos, beneficios, etc." },
            { term: "LA2/FA", name: "Faction Abuser", text: "Abusar siendo líder de una facción." }
          ]},
          { title: "Abusos", items: [
            { term: "BA", name: "Bug Abuser", text: "Abusar de un bug en beneficio propio." },
            { term: "NA", name: "Noob Abuser", text: "Abusar de un jugador nuevo en el servidor. Los nuevos están protegidos al menos 2 o 3 horas (depende del servidor)." },
            { term: "LA", name: "Lag Abuser", text: "Abusar del lag de un usuario o del servidor.", example: "Ir a un tiroteo con 600 de ping." }
          ]},
          { title: "Canales y chat", items: [
            { term: "IOOC", name: "Insulter Out Of Character", text: "Insultar a otra persona en el canal OOC. Puedes ser enviado a jail por esto." },
            { term: "AIOOC", name: "Admin Insult Out Of Character", text: "Insultar a la administración o a un administrador por el canal OOC." },
            { term: "MUD", name: "Mal Uso de /duda", text: "Usar mal el canal /duda.", example: "/duda nombrando a un usuario para pedirle su ubicación." },
            { term: "MUR", name: "Mal Uso de /reportar", text: "Usar mal el comando /reportar.", example: "Pedir cosas que puedes conseguir fácilmente por vía IC." },
            { term: "SPAM", name: "Spam", text: "Promocionar otro servidor en este servidor. Es motivo de ban." },
            { term: "FLOOD", name: "Flood", text: "Repetir varias veces un mismo mensaje." },
            { term: "MA", name: "Mal Anuncio", text: "Hacer un anuncio IC incorrecto." }
          ]}
        ]}
      ]
    },

    discord: {
      title: "Reglas de Discord",
      blocks: [
        { type: "intro", text: "Buenas, usuario de Dixel RP. Estas son las reglas de convivencia de nuestro servidor de Discord. Última actualización conocida: 17/02/2022." },
        { type: "rules", items: [
          "Evita hacer “Copy and paste” solo por “joder”; esto puede ocasionarte un muteo o la sanción que la administración vea necesaria.",
          "No están permitidos los mensajes cuyo contenido sea pornográfico, insultante y/o discriminatorio por raza, país de origen, sexo, religión, gustos, forma de pensar o cualquier índole similar.",
          "Las discusiones personales con cualquier otro usuario deben realizarse por PM. De no acatar esta regla se aplicará una sanción que puede ir de un muteo a un baneo permanente, dependiendo de la gravedad.",
          "Evita el MUC (Mal Uso de Canal). Antes de decir algo, asegúrate de escribirlo en el canal que corresponde.",
          "No se permite hacer SPAM.",
          "El canal de Noticias es de uso exclusivo para los Administradores, ya que por ahí se informará de lo que suceda en el servidor.",
          "No se permite poner links de canales de YouTube o de terceros, links de descargas o programas ajenos a Dixel RP.",
          "Se prohíbe la falta de respeto hacia los demás usuarios y hacia los administradores. Cada uno es libre de dar su opinión sobre algo, PERO sin ofender directamente a los demás.",
          "El reglamento puede ser alterado sin previo aviso, quedando bajo responsabilidad de cada usuario estar atento a cualquier cambio.",
          "Al ingresar al servidor de Discord aceptas de manera automática nuestras reglas.",
          "Es obligatorio tener el nombre IC en Discord.",
          "Está prohibido publicar información personal de usuarios (fotos, redes sociales, etc.) sin su consentimiento o en forma de burla. Esto se sanciona con ban."
        ]},
        { type: "notice", text: "El incumplimiento de una o más de las reglas expuestas otorga a cualquier STAFF el derecho de aplicar la sanción que mejor se acomode a la situación." }
      ]
    },

    servidor: {
      title: "Normas del servidor",
      blocks: [
        { type: "intro", text: "Normas específicas para el juego de rol dentro del servidor." },
        { type: "notice", text: "[Contenido provisional: estas normas son de ejemplo. Sustitúyelas por el reglamento oficial del servidor.]" },
        { type: "rules", items: [
          "Separa siempre lo IC (en personaje) de lo OOC (fuera de personaje).",
          "No uses información que tu personaje no conoce (Meta Gaming).",
          "No realices acciones imposibles ni fuerces el rol a tu favor (Power Gaming).",
          "Valora la vida de tu personaje en todo momento.",
          "Las decisiones del Staff durante una escena son finales; discútelas después por ticket.",
          "[Añade aquí más normas del servidor.]"
        ]}
      ]
    },

    ciberacoso: {
      title: "Ciberbullying y ciberacoso",
      blocks: [
        { type: "intro", text: "El ciberbullying está totalmente prohibido en Dixel RP. El ciberbullying y el ciberacoso se tratan con el mismo peso." },
        { type: "notice", text: "Quien reincida en actos de ciberbullying recibirá un baneo de foro y de cuenta." },
        { type: "heading", text: "Normativas detalladas" },
        { type: "cards", items: [
          { title: "Conversaciones no consensuadas", text: "Está prohibida cualquier interacción sin consentimiento mutuo claro: mensajes no deseados, solicitudes inapropiadas y cualquier otra comunicación que la otra persona no haya aceptado." },
          { title: "Acoso en todas sus formas", text: "Está terminantemente prohibido el acoso, la discriminación y la intimidación. Incluye comentarios ofensivos, insultos, difamación y cualquier acto que cause malestar a otro miembro de la comunidad." },
          { title: "Divulgación de información personal", text: "Compartir información personal fuera del servidor es responsabilidad de cada usuario. Sé cauteloso al dar tus datos personales." },
          { title: "Difusión de contenido sensible", text: "Está prohibido publicar, compartir o difundir contenido sensible (imágenes, vídeos o información privada) sin el consentimiento expreso de la persona afectada." }
        ]},
        { type: "text", text: "Estas reglas se aplican a todos los miembros, desde los usuarios hasta el Staff." },
        { type: "heading", text: "Cómo denunciar" },
        { type: "text", text: "Las denuncias son anónimas: la información queda registrada como anónima." },
        { type: "links", items: [
          { label: "Ticket", text: "Abre un ticket en el canal Queja Staff" },
        ]}
      ]
    },

    sanciones: {
      title: "Sanciones",
      blocks: [
        { type: "intro", text: "Reglas y penalizaciones dentro del servidor. Los tiempos son minutos de jail, salvo que se indique otra cosa. Las definiciones de cada sigla están en la sección Conceptos de rol." },
        { type: "heading", text: "Cómo se suman los tiempos" },
        { type: "text", text: "Si se acumulan varias faltas, la primera suma 60 minutos y cada falta adicional suma 50 minutos." },
        { type: "notice", text: "Ejemplo: PG (60 min) + NRE (50 min) + IOOC (50 min) = 160 minutos." },

        // Cada sanción: [nombre, nivel 1-5, duración, descripción?, enlace de ejemplo?]
        // El nivel es solo una referencia interna de gravedad: no se muestra en la página.
        { type: "sanctions", groups: [
          { title: "Faltas con advertencia", note: "Estas faltas llevan advertencia. En algunos casos también se aplica jail.", items: [
            ["BJ: Bunny Jump", 1, "Advertencia"],
            ["CC: Confundir Canales", 1, "Advertencia"],
            ["ZZ: Zig Zag", 1, "Advertencia"],
            ["MG: Meta Gaming", 1, "Advertencia", "Según el caso, también se aplica jail."],
            ["BD: Bad Driving", 1, "Advertencia", "En cualquier nivel. Según el caso, también se aplica jail."],
            ["MUR: Mal Uso de /reportar", 1, "Advertencia", "Si se sigue después del jail, se procede a un kick."],
            ["FLOOD", 1, "Advertencia", "Repetir más de 3 veces el mismo mensaje."]
          ]},
          { title: "Jails directos", items: [
            ["DM: Death Match (nivel 10 o menos)", 3, "150 min"],
            ["DM: Death Match (nivel 11 o más)", 3, "250 min"],
            ["DM a CNN", 4, "500 min", "En directo."],
            ["DM a mecánicos", 3, "200 min", "El mecánico debe estar en duty y sin arma."],
            ["NRE: No Rolear Entorno", 2, "60 min"],
            ["NRA: No Rolear Arma", 2, "60 min"],
            ["MUVT: Mal Uso de Vehículo de Trabajo", 2, "60 min", "[Descripción incompleta en el original: “Usar tu vehículo de trabajo para…”]"],
            ["PG: Power Gaming", 2, "60 min"],
            ["IOOC: Insultar Fuera de Personaje", 2, "60 min"],
            ["NA: Noob Abuser", 2, "60 min"],
            ["SK: Spawn Kill", 2, "60 min"],
            ["CK: Car Kill", 2, "60 min"],
            ["RK: Revenge Kill", 2, "60 min"],
            ["MK: Meta Kill", 2, "60 min"],
            ["LA: Lag Abuse", 2, "60 min"],
            ["HK: Helicopter Kill", 2, "60 min"],
            ["TK: Team Kill", 2, "60 min"],
            ["NIP: Nula Interpretación del Personaje", 2, "60 min"],
            ["NVVPJ: No Valorar la Vida de tu Personaje", 2, "60 min"],
            ["Evadir Sistema", 2, "60 min", "Cualquier intento de hacer las cosas más rápido de lo que se debería."],
            ["Joder en CNN", 2, "60 min · masivo 150", "Quedarse en la HQ molestando a los miembros de la facción CNN."],
            ["SK Masivo", 2, "60 min", "Molestar de forma indebida en la zona de aparición (spawn) de otros jugadores."],
            ["IHQ: Invadir facción enemiga", 2, "60 min"],
            ["ER: Evadir Rol", 2, "60 min"],
            ["EK: Evadir Kill", 2, "60 min"],
            ["PP: Player Paused", 2, "60 min", "Quedarse en pausa para evitar cualquier tipo de rol."],
            ["FC: Force Crash", 2, "60 min", "Forzar el cierre del juego para evitar una situación de rol."],
            ["FLOOD Masivo", 2, "60 min", "Repetir varias veces un mismo mensaje."],
            ["Troll", 2, "80 min", "Molestar de forma irrespetuosa en eventos o a otros usuarios."],
            ["AIOOC: Insultar Fuera de Personaje al Staff", 2, "100 min"],
            ["BE: Bugear Esposas", 2, "100 min", "Hacer que se te quiten las esposas de forma irregular."],
            ["ADI: Abuso de Interiores", 3, "150 min", "Quedarse dentro, o entrar y salir repetidamente, para evitar situaciones."],
            ["BA: Bugear Animación", 3, "150 min"],
            ["Slide Bug", 3, "300 min"],
            ["C-Bug", 4, "900 min"]
          ]},
          { title: "Abuso de comandos (AC)", note: "La sanción depende del comando que se haya usado de forma indebida.", items: [
            ["AC2: Floodear un comando", 3, "150 min · masivo 200", "Floodear un comando hasta que el servidor te expulse (kick)."],
            ["AC: /parar para salir de un vehículo", 4, "400 min"],
            ["AC: /parar para evadir el daño de caída", 4, "500 min"],
            ["AC: disparar con /parar", 4, "700 min"],
            ["AC: /saludar o /vender", 4, "900 min", "Con cualquier objeto."]
          ]},
          { title: "Abuso de facción (FA)", note: "Algunas faltas, como HK, NVVPJ, NIP, TK y CK, tienen aquí un tiempo distinto al del jail directo.", items: [
            ["FA: abuso de skins", 3, "60 a 300 min"],
            ["FA: abuso de controles", 4, "900 min", "", "https://i.imgur.com/9neTr8L.gif"],
            ["FA: abuso de cargos", 3, "150 min"],
            ["FA: aplicar cargos por tab", 3, "250 min"],
            ["FA: abuso de maleteros", 3, "300 min"],
            ["HK", 3, "150 min", "", "https://i.imgur.com/0oWukkZ.gif"],
            ["NVVPJ", 3, "120 min", "", "https://i.imgur.com/DdmkoPF.gif"],
            ["NIP", 3, "200 min", "", "https://i.imgur.com/HnJUj7t.gif"],
            ["TK", 3, "120 min", "", "https://i.imgur.com/lu44DKS.gif"],
            ["CK", 3, "120 min", "", "https://i.imgur.com/F7YPov0.gif"]
          ]},
          { title: "Jails extras", items: [
            ["AB: Abusar de un bug", 5, "Ban de cuenta", "Cualquier bug aprovechado para obtener beneficio económico o ventaja sobre otros.", "https://i.imgur.com/yesGJz6.gif"],
            ["Robar maleteros sin rol de forma masiva", 4, "500 min", "Se cataloga como Troll masivo. Si se repite, ban de cuenta.", "https://imgur.com/RNoWJvF.png"],
            ["Objetos troll", 3, "150 min", "Si sigue con el objeto, jail de 200 minutos. Al tercer aviso, se le fuerza a vender el vehículo.", "https://imgur.com/0f4Y4Ry.png"]
          ]}
        ]},

        { type: "heading", text: "Mal uso de /duda" },
        { type: "table",
          headers: ["Nivel", "Falta leve", "Falta grave"],
          rows: [
            ["1 a 10", "200 minutos (advertir a los niveles 1 y 2)", "400 minutos"],
            ["10 en adelante", "500 minutos", "800 minutos"]
          ]
        },
        { type: "text", text: "En cualquier nivel, los insultos, el bardo, explicar un bug o MNP y evadir un mute se sancionan con 999 minutos." },

        { type: "heading", text: "Apelaciones" },
        { type: "text", text: "Si crees que una sanción es injusta, contacta con el staff en [canal / correo] en un plazo de [X días]." }
      ]
    },

    faq: {
      title: "Preguntas frecuentes",
      blocks: [
        { type: "faq", items: [
          { q: "¿Cuál es la IP del servidor?",
            a: "La dirección es S1.DIXEL-RP.COM con el puerto 7777 (S1.DIXEL-RP.COM:7777). Añádela a tus favoritos de SA-MP. En la sección Cómo empezar tienes los pasos completos." },
          { q: "¿Qué PC necesito para jugar?",
            a: "Los mismos requisitos que GTA San Andreas, o incluso menos: en la sección Descargas hay versiones optimizadas y estables pensadas para PC de bajos recursos." },
          { q: "¿Qué versión de SA-MP necesito?",
            a: "Te recomendamos una versión actualizada de SA-MP. Cualquier versión compatible te permite entrar al servidor." },
          { q: "¿Dónde está el Discord del servidor?",
            a: "Puedes unirte con este enlace de invitación. Recuerda que es obligatorio usar tu nombre IC en Discord.",
            links: [{ label: "Unirse al Discord de Dixel RP", href: "https://discord.gg/D8T9nZ4" }] },
          { q: "¿Qué gano si invito a un amigo?",
            a: "Cuando un amigo que invitaste llega a nivel 15, los dos recibís 1 Dix. Además, recibes 1 Dix por cada compra de 40 Dix o más que haga tu invitado.",
            links: [{ label: "Recluta a un amigo", href: "https://rol.dixel-rp.com/recluta-a-un-amigo/" }] },
          { q: "Compré Dix en la página web del servidor y no los he recibido. ¿Qué debo hacer?",
            a: "En raros casos la compra tarda en entregarse. El sistema es automático, pero puede pasar que la entidad financiera todavía no haya validado el pago. Si es tu caso, entra al canal de tickets de Discord y abre un ticket de “Compra Dix”." },
          { q: "Presencié a un usuario cometiendo una falta de rol. ¿Qué puedo hacer?",
            a: "Los reportes contra usuarios se hacen en el foro, con pruebas que demuestren la falta y con el formato que corresponda al tipo de reporte.",
            links: [
              { label: "Apartado del foro para reportes a usuarios", href: "https://rol.dixel-rp.com/foro/index.php?board=55.0" },
              { label: "Formato obligatorio para reportes", href: "https://rol.dixel-rp.com/foro/index.php?topic=53637.0" },
              { label: "Guía para colocar imágenes en un tema", href: "https://rol.dixel-rp.com/foro/index.php?topic=4248.0" }
            ] },
          { q: "He encontrado un bug que puede afectar al juego de muchos. ¿Cómo lo reporto?",
            a: "Si no perdiste nada, abre un ticket en el canal de tickets de Discord, en la opción “Solicitar Admin”. Así el equipo administrativo estará pendiente del bug y podrá controlarlo. Si perdiste algo, se te devolverá según el caso." },
          { q: "Creo que un miembro del Staff cometió una falta o está abusando de su poder. ¿Qué puedo hacer?",
            a: "Debes hacer el reporte con un ticket en el canal de tickets de Discord, en la opción “Queja Staff”. Incluye las pruebas y usa el formato que corresponde a un reporte de esta gravedad." },
          { q: "Quiero mapear el garaje de mi propiedad. ¿Con quién debo contactar?",
            a: "Los Mapper reciben las solicitudes de mapeo de garajes por el foro. Completa un formulario sencillo con lo que buscas y te darán un precio aproximado, según la complejidad del mapeo.",
            links: [{ label: "Formato obligatorio para mapeos", href: "https://rol.dixel-rp.com/foro/index.php?board=53.0" }] },
          { q: "Quiero postular a una facción, pero no sé cómo enviar mi CV.",
            a: "Cada facción decide cuándo abre sus convocatorias. Espera a que abran y sigue las instrucciones. Esta guía te explica cómo hacer el CV.",
            links: [{ label: "Guía para hacer un CV", href: "https://rol.dixel-rp.com/foro/index.php?topic=44168.0" }] },
          { q: "Quiero desmapear una propiedad de un usuario inactivo.",
            a: "Las limpiezas se hacen solo cuando la administración lo considera necesario." },
          { q: "¿Quiénes forman parte del equipo de Staff?",
            a: "Puedes ver a los miembros del Staff en el canal de Discord dedicado al equipo." }
        ]}
      ]
    },

    descargas: {
      title: "Descargas de GTA",
      blocks: [
        { type: "intro", text: "Versiones de GTA para jugar en Dixel RP, cada una con su vídeo de referencia cuando lo hay. Los archivos se descargan desde MediaFire." },
        { type: "text", text: "Las versiones FPS Up y Low están optimizadas para PC de bajos recursos: piden incluso menos que el GTA San Andreas original." },
        { type: "downloads", items: [
          { title: "GTA Rojo Low", status: "Revisado",
            video: "https://youtu.be/hYJj4PpO_-o",
            link: "https://www.mediafire.com/file/ij0id4199ec23yw/GTA+Red+Urdaneta.rar/file" },
          { title: "GTA Virgen (DreakRek)", status: "Revisado",
            contains: ["Es el GTA base, sin mods ni SA-MP."],
            link: "https://www.mediafire.com/file/gm4edzepenpt2d7/Gta_Virgen_By_DreakRek.7z/file" },
          { title: "GTA Purple FPS Up Urdaneta", status: "Revisado",
            video: "https://youtu.be/LNoDPbprcAQ",
            link: "https://www.mediafire.com/file/zf6e1e9e6ijs2yc/GTA_Psycho.rar/file" },
          { title: "GTA Royauté", status: "Revisado",
            performance: "FPS Up. Para PC de bajos recursos.",
            video: "https://youtu.be/94TGae-HyNg",
            link: "https://www.mediafire.com/file/wbwd5u948ge6rq2/GTA_Royaut%C3%A9.rar/file" },
          { title: "GTA Detroit Blanco/Cromado/Nieve FPS Up Urdaneta", status: "Revisado",
            performance: "FPS Up. Low para subir el rendimiento. Para PC de bajos recursos.",
            contains: ["CLEO para mejorar el rendimiento", "MoonLoader y ModLoader", "GameFixer compatible con el chat de voz"],
            video: "https://youtu.be/w-Bu-SFOUPk",
            link: "https://www.mediafire.com/file/eighjtitfmfsdyh/GTA_Detroit.rar/file" },
          { title: "GTA Verde Ultra Low", status: "Revisado",
            performance: "FPS Up. Para PC de bajos recursos.",
            contains: ["CLEO para mejorar el rendimiento", "MoonLoader y ModLoader", "Texturas ultra low"],
            video: "https://youtu.be/EfEwbkD44mk",
            link: "https://www.mediafire.com/file/mxbrgpo8c28abec/GTA_Verde_Ultra_Low.rar/file" },
          { title: "GTA L'Elegance", status: "Revisado",
            performance: "FPS Up. Para PC de recursos bajos a medios; consume algo más.",
            contains: ["CLEO para mejorar el rendimiento", "MoonLoader y ModLoader"],
            video: "https://youtu.be/n8Mt9NGIyUQ",
            link: "https://www.mediafire.com/file/3brxh6yily087dy/GTA_LElegance.rar/file" },
          { title: "GTA Pink Urdaneta", status: "Revisado",
            performance: "FPS Up. Low para subir el rendimiento.",
            contains: ["CLEO para mejorar el rendimiento", "MoonLoader y ModLoader"],
            video: "https://youtu.be/ChX7o4HovOA",
            link: "https://www.mediafire.com/file/l0xur8wk7heq1ky/PINK_GTA_URDANETA.rar/file" },
          { title: "GTA Voice Dova", status: "Revisado",
            performance: "FPS Up.",
            contains: [
              "SAMPFUNCS",
              "CLEO: anticrasher, arreglo de objetos al apuntar con sniper, uso máximo de memoria RAM y StatDisplay (muestra FPS, zona, tu ping y el de los demás al apuntarles; se configura con /sd)",
              "ModLoader",
              "MoonLoader: GameFixer compatible con el chat de voz (/gmenu)",
              "Chat de voz",
              "SA-MP 0.3.7 R1",
              "SensFix.asi",
              "Optimización (incluye sonidos y todas las texturas)"
            ],
            image: { src: "img/gta-voice-dova.webp", alt: "Captura de referencia de GTA Voice Dova: personaje sobre una azotea con el mapa y el HUD del juego.", width: 512, height: 287 },
            link: "https://www.mediafire.com/file/kopu3w0mo64uby5/Aporte+Optimizado+Voice+Dova.rar/file" },
          { title: "GTA Blessed con ReShade Urdaneta", status: "Revisado",
            performance: "Bajo a medio. Puede ser Low o FPS Up según las opciones del ReShade que actives o desactives.",
            contains: ["CLEO para mejorar el rendimiento", "MoonLoader y ModLoader"],
            note: "Viene con ajustes de ReShade pensados para PC sin gráfica. Para activar los efectos llamativos, hazlo al abrir el GTA, como se muestra en el vídeo. Si lo usas como GTA Low, puedes dejar solo el color isolation o borrar el ReShade.",
            video: "https://youtu.be/wirAHwMOLtQ",
            link: "https://www.mediafire.com/file/x3agm0ryc1kgrya/GTA_Blessed.rar/file" }
        ]}
      ]
    }
  }
};
