(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);

  // Small DOM helper: el("a", { href: "#" }, "text", childNode)
  function el(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") node.className = v;
      else node.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid === null || kid === undefined || kid === false) continue;
      node.append(kid);
    }
    return node;
  }
  const external = (href) => /^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {};

  // ---------- Header, hero, footer ----------
  $("bar-name").textContent = S.name;
  $("hero-name").textContent = S.name;
  $("hero-role").textContent = S.role;

  const heroLinks = [
    ["Email me", "mailto:" + S.email],
    ["GitHub", S.links.github],
    ["LinkedIn", S.links.linkedin],
    ["Résumé", S.links.resume],
  ];
  for (const [label, href] of heroLinks) {
    if (!href) continue;
    $("hero-links").append(el("li", null, el("a", { href, ...external(href) }, label)));
  }

  $("contact-email").textContent = S.email;
  $("contact-email").href = "mailto:" + S.email;
  $("foot-text").textContent = `© ${new Date().getFullYear()} ${S.name}. Built by hand with HTML, CSS, and JavaScript.`;

  // ---------- Live demo window ----------
  const demo = $("demo");
  function openDemo(p) {
    $("demo-title").textContent = p.title;
    $("demo-note").textContent = p.demoNote || "";
    $("demo-note").hidden = !p.demoNote;
    $("demo-open").href = p.links.demo;
    $("demo-iframe").src = p.links.demo;
    demo.showModal();
  }
  function closeDemo() { demo.close(); }
  $("demo-close").addEventListener("click", closeDemo);
  // Clicking the dimmed area outside the window closes it.
  demo.addEventListener("click", (e) => { if (e.target === demo) closeDemo(); });
  // Unload the demo on close so it stops running in the background.
  demo.addEventListener("close", () => { $("demo-iframe").src = "about:blank"; });

  // ---------- Projects ----------
  function tagList(tags) {
    return el("ul", { class: "tags", "aria-label": "Built with" }, tags.map((t) => el("li", null, t)));
  }
  function tryButton(p) {
    if (!p.embed || !p.links || !p.links.demo) return null;
    const b = el("button", { type: "button", class: "try" }, "Try it here");
    b.addEventListener("click", (e) => { e.stopPropagation(); openDemo(p); });
    return b;
  }
  function projectLinks(links, p) {
    const out = [];
    if (links && links.code) out.push(el("a", { href: links.code, ...external(links.code) }, "Source code"));
    if (links && links.demo) out.push(el("a", { href: links.demo, ...external(links.demo) }, p && p.embed ? "Open demo full screen" : "Live demo"));
    return out.length ? el("div", { class: "plinks" }, out) : null;
  }

  const featured = S.projects.find((p) => p.featured);
  const rest = S.projects.filter((p) => p !== featured).sort((a, b) => b.year - a.year);

  if (featured) {
    $("featured").append(
      el("article", { class: "featured" },
        el("div", null,
          el("p", { class: "featured-mark" }, `Featured project, ${featured.year}`),
          el("h3", { class: "title-line" }, featured.title, tryButton(featured)),
          el("p", { class: "summary" }, featured.summary),
          tagList(featured.tags)
        ),
        el("div", null,
          el("p", { class: "details" }, featured.details),
          projectLinks(featured.links, featured)
        )
      )
    );
  }

  const chevron = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("class", "chev");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/>';
    return svg;
  };

  rest.forEach((p, i) => {
    const id = "project-more-" + i;
    // The title is the expand/collapse button; "Try it here" sits beside it as its own button.
    const btn = el("button", { class: "ptitle", type: "button", "aria-expanded": "false", "aria-controls": id }, p.title);
    const row = el("div", { class: "prow" },
      el("span", { class: "pyear" }, String(p.year)),
      el("span", { class: "pmain" },
        el("span", { class: "title-line" }, btn, tryButton(p)),
        el("span", { class: "psum" }, p.summary)),
      tagList(p.tags),
      chevron()
    );
    const more = el("div", { class: "pmore", id },
      el("div", null, el("div", { class: "pmore-inner" }, el("p", null, p.details), projectLinks(p.links, p)))
    );
    const li = el("li", { "data-tags": p.tags.join("|") }, row, more);
    more.inert = true;
    // Clicking anywhere on the row toggles it, same as the title button.
    row.addEventListener("click", (e) => {
      if (e.target.closest(".try")) return;
      const open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      more.inert = !open;
    });
    $("project-list").append(li);
  });

  // Filters: only offer tags that appear on more than one project, so the list stays short.
  const counts = {};
  S.projects.forEach((p) => p.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  let tags = Object.keys(counts).filter((t) => counts[t] > 1);
  if (tags.length < 2) tags = Object.keys(counts).slice(0, 6);
  tags.sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

  function applyFilter(tag) {
    // Keep the chosen filter in the URL so a filtered list can be shared.
    const url = new URL(location.href);
    if (tag === "All") url.searchParams.delete("tag"); else url.searchParams.set("tag", tag);
    history.replaceState(null, "", url);
    document.querySelectorAll("#filters button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.tag === tag)));
    let shown = 0;
    document.querySelectorAll("#project-list > li").forEach((li) => {
      const match = tag === "All" || li.dataset.tags.split("|").includes(tag);
      li.hidden = !match;
      if (match) shown++;
    });
    const fShow = !featured || tag === "All" || featured.tags.includes(tag);
    $("featured").hidden = !fShow;
    $("projects-empty").hidden = shown > 0 || fShow;
  }
  ["All", ...tags].forEach((t) => {
    const b = el("button", { type: "button", "data-tag": t, "aria-pressed": String(t === "All") }, t);
    b.addEventListener("click", () => applyFilter(t));
    $("filters").append(b);
  });
  const startTag = new URLSearchParams(location.search).get("tag");
  if (startTag && tags.includes(startTag)) applyFilter(startTag);

  // ---------- Experience ----------
  S.experience.forEach((x) => {
    $("timeline").append(
      el("li", null,
        el("p", { class: "tl-when" }, `${x.start} – ${x.end}`),
        el("h3", null, x.role, el("span", { class: "tl-org" }, `, ${x.org}`)),
        x.points && x.points.length ? el("ul", null, x.points.map((pt) => el("li", null, pt))) : null,
        x.link ? el("div", { class: "plinks" }, el("a", { href: x.link.href, ...external(x.link.href) }, x.link.label)) : null
      )
    );
  });

  // ---------- About, education, skills ----------
  S.about.forEach((para) => $("about-text").append(el("p", null, para)));
  S.education.forEach((e) => {
    $("education").append(
      el("div", { class: "edu" },
        el("strong", null, e.school),
        el("span", null, `${e.degree}, ${e.dates}`),
        e.notes ? el("span", null, e.notes) : null
      )
    );
  });
  for (const [group, items] of Object.entries(S.skills)) {
    $("skills").append(el("dt", null, group), el("dd", null, items.join(", ")));
  }

  // ---------- Theme toggle ----------
  // Point both theme-color tags at the chosen theme so the browser chrome matches the page.
  function syncThemeColor() {
    const t = document.documentElement.dataset.theme;
    const color = t === "dark" ? "#10131C" : t === "light" ? "#F2F4F7" : null;
    $("tc-light").content = color || "#F2F4F7";
    $("tc-dark").content = color || "#10131C";
  }
  syncThemeColor();
  $("theme").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    syncThemeColor();
    life.recolor();
  });

  // ---------- Game of Life ----------
  const life = (function () {
    const canvas = $("life");
    const ctx = canvas.getContext("2d");
    const CELL = 14;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cols = 0, rows = 0, grid, next, mine; // `mine` marks cells the visitor drew
    let running = !reduce, visible = true, last = 0, colors = {};

    function recolor() {
      const cs = getComputedStyle(document.documentElement);
      colors = { cell: cs.getPropertyValue("--cell").trim(), mine: cs.getPropertyValue("--accent").trim() };
      draw();
    }

    function glider(x, y) {
      [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]].forEach(([dx, dy]) => set(x + dx, y + dy, 1, 0));
    }
    function set(x, y, v, m) {
      x = (x + cols) % cols; y = (y + rows) % rows;
      grid[y * cols + x] = v; mine[y * cols + x] = m;
    }

    function seed() {
      grid.fill(0); mine.fill(0);
      for (let i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.16 ? 1 : 0;
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = Math.ceil(r.width / CELL), rw = Math.ceil(r.height / CELL);
      if (c === cols && rw === rows) return draw();
      cols = c; rows = rw;
      grid = new Uint8Array(cols * rows); next = new Uint8Array(cols * rows); mine = new Uint8Array(cols * rows);
      seed(); draw();
    }

    function step() {
      let alive = 0;
      const nextMine = new Uint8Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        const up = ((y - 1 + rows) % rows) * cols, mid = y * cols, dn = ((y + 1) % rows) * cols;
        for (let x = 0; x < cols; x++) {
          const l = (x - 1 + cols) % cols, r = (x + 1) % cols;
          const n = grid[up + l] + grid[up + x] + grid[up + r] + grid[mid + l] + grid[mid + r] +
                    grid[dn + l] + grid[dn + x] + grid[dn + r];
          const i = mid + x;
          const v = n === 3 || (n === 2 && grid[i]) ? 1 : 0;
          next[i] = v;
          if (v) {
            alive++;
            // A cell stays highlighted if it was drawn or born next to drawn cells.
            nextMine[i] = mine[i] || (!grid[i] && (mine[up + l] | mine[up + x] | mine[up + r] | mine[mid + l] |
                          mine[mid + r] | mine[dn + l] | mine[dn + x] | mine[dn + r])) ? 1 : 0;
          }
        }
      }
      [grid, next] = [next, grid];
      mine = nextMine;
      // Keep the board from going quiet.
      if (alive < cols * rows * 0.03) {
        for (let k = 0; k < 4; k++) glider((Math.random() * cols) | 0, (Math.random() * rows) | 0);
      }
    }

    function draw() {
      if (!grid) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const pass of ["cell", "mine"]) {
        ctx.fillStyle = colors[pass];
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (grid[i] && (pass === "mine") === !!mine[i]) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
          }
        }
      }
    }

    function loop(t) {
      if (running && visible && t - last > 110) { step(); draw(); last = t; }
      requestAnimationFrame(loop);
    }

    // Drawing with the pointer
    let drawing = false;
    function paint(e) {
      const r = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) / CELL), y = Math.floor((e.clientY - r.top) / CELL);
      if (x < 0 || y < 0 || x >= cols || y >= rows) return;
      set(x, y, 1, 1); set(x + 1, y, 1, 1); set(x, y + 1, 1, 1);
      draw();
    }
    canvas.addEventListener("pointerdown", (e) => { drawing = true; paint(e); });
    canvas.addEventListener("pointermove", (e) => { if (drawing) paint(e); });
    window.addEventListener("pointerup", () => (drawing = false));
    canvas.addEventListener("pointercancel", () => (drawing = false));

    const toggle = $("life-toggle");
    function setRunning(v) { running = v; toggle.textContent = v ? "Pause" : "Play"; }
    toggle.addEventListener("click", () => setRunning(!running));
    $("life-reset").addEventListener("click", () => { seed(); draw(); });
    setRunning(running);

    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);
    document.addEventListener("visibilitychange", () => (visible = !document.hidden));
    new ResizeObserver(resize).observe(canvas);
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", recolor);

    recolor(); resize();
    requestAnimationFrame(loop);
    return { recolor };
  })();
})();
