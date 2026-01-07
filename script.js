/* Turbo Aural — CLEAN v1
   - Anywhere practice: link-out audio/paper
   - Match Code (7 chars): same prompts across devices
   - Insane-speed marking: tap 10 big buttons
   - Competitive score: time + penalties, personal best saved
*/

(function () {
  "use strict";

  // --------- Link-outs (verified pages) ----------
  const EDUCATEPLUS_AUDIO_PAGE =
    "https://www.educateplus.ie/examaudio/leaving-cert-spanish-higher-level-and-ordinary-level";
  const paperUrlFor = (year, paperLevel) =>
    `https://exams.ie/papers/leaving-cert/spanish/${paperLevel}/${year}/aural/`;

  // --------- Years ----------
  const YEARS = Array.from({ length: 19 }, (_, i) => 2007 + i); // 2007–2025

  // --------- Prompts (copyright-safe; exam-style) ----------
  const POOL_1_3 = [
    "Catch ONE number (price/date/age/time).",
    "Who is speaking? (role/job/relationship).",
    "Where are they / where is it happening?",
    "What is the topic (1 short phrase)?",
    "What is the plan for today/tomorrow?",
    "Give ONE reason (porque/para/debido a).",
    "Write ONE key noun you heard (place/person/thing).",
    "What is being offered/advertised?",
    "Weather: ONE detail (region/temp/time).",
    "News: what happened (1 sentence).",
    "What is requested (instruction/action)?",
    "Is the speaker positive or negative? Give ONE clue word.",
    "Pick one detail that was repeated or emphasised.",
    "Write ONE time reference (hoy/mañana/ayer/esta tarde…).",
    "Identify one restriction (not allowed / prohibited).",
  ];

  const POOL_4_7 = [
    "Summarise the main point (1 sentence).",
    "Give TWO separate details (2 bullet points).",
    "Identify a contrast (pero/sin embargo/aunque) and both sides.",
    "Find cause → effect (why + what happened).",
    "Extract ONE key name/place and ONE number.",
    "Interview: TWO background details about the person.",
    "Dialogue: what is the problem/disagreement?",
    "Advice given: TWO points.",
    "Weather: two regions + what will happen.",
    "News: who is affected + how?",
    "What changed (before vs now)?",
    "Main benefit + main drawback.",
    "What is the next step / decision?",
    "Spot one uncertainty (maybe/possibly/it depends…).",
    "Write ONE connector you heard (primero/luego/por eso…).",
  ];

  const POOL_8_10 = [
    "Infer what the speaker really thinks + one clue word.",
    "Give a timeline (sequence of events in order).",
    "Purpose AND audience (who it’s for).",
    "Find a corrected detail (something clarified/adjusted).",
    "Summarise using connectors: primero… luego… finalmente…",
    "Weather: compare today vs tomorrow (two differences).",
    "News: cause + effect + reaction (3-part chain).",
    "Condition (if/when) and what happens then.",
    "Extract three distinct details (rapid notes).",
    "Explain the speaker’s motivation (why they care).",
    "Give two supporting details for one claim.",
    "Identify tone (sarcasm/serious/enthusiastic) + evidence.",
    "Summarise in 12–15 words exactly.",
    "Pick the most important number and explain why it matters.",
    "State the conclusion + one justification.",
  ];

  function poolForLevel(level) {
    if (level <= 3) return POOL_1_3;
    if (level <= 7) return POOL_4_7;
    return POOL_8_10;
  }

  // Difficulty knobs
  function penaltyForLevel(level) { return 15 + level * 3; }               // L1=18s ... L10=45s
  function sprintCapForLevel(level) { return Math.max(45, 78 - level * 3); } // L1~75s ... L10~45s

  // --------- Seeded RNG ----------
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleInPlace(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // --------- Formatting ----------
  const $ = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2, "0");

  function fmtTime(ms) {
    const t = Math.max(0, ms);
    const totalSec = t / 1000;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const d = Math.floor((totalSec - Math.floor(totalSec)) * 10);
    return `${pad2(m)}:${pad2(s)}.${d}`;
  }

  // --------- Match Code (7 chars) ----------
  // Format: [Y][L][P][M][S][S][C]
  // Y: year index 0..18 (2007..2025) in base36
  // L: level 1..10 in base36
  // P: H/O
  // M: C/S/V/R
  // SS: seed 0..1295 in base36 (00..ZZ)
  // C: checksum base36
  function base36(n) { return n.toString(36).toUpperCase(); }
  function fromBase36(ch) { return parseInt(ch, 36); }

  function modeToChar(mode) {
    return ({ classic: "C", sprint: "S", survival: "V", relay: "R" }[mode] || "C");
  }
  function charToMode(ch) {
    return ({ C: "classic", S: "sprint", V: "survival", R: "relay" }[ch] || "classic");
  }
  function paperToChar(p) { return p === "ordinary" ? "O" : "H"; }
  function charToPaper(ch) { return ch === "O" ? "ordinary" : "higher"; }

  function checksum36(nums) {
    let sum = 0;
    for (const n of nums) sum = (sum + (n | 0)) % 36;
    return base36(sum);
  }

  function makeMatchCode({ year, level, paperLevel, mode, seed }) {
    const y = Math.max(0, Math.min(18, year - 2007));
    const l = Math.max(1, Math.min(10, level));
    const p = paperToChar(paperLevel);
    const m = modeToChar(mode);
    const s = Math.max(0, Math.min(1295, seed));

    const ych = base36(y);
    const lch = base36(l);
    const sch = base36(s).padStart(2, "0");

    const c = checksum36([
      y,
      l,
      p === "H" ? 17 : 29,
      m.charCodeAt(0) % 36,
      s % 36,
      Math.floor(s / 36),
    ]);

    return `${ych}${lch}${p}${m}${sch}${c}`;
  }

  function parseMatchCode(raw) {
    const code = (raw || "").toUpperCase().replace(/\s+/g, "");
    if (code.length !== 7) return null;

    const y = fromBase36(code[0]);
    const l = fromBase36(code[1]);
    const p = code[2];
    const m = code[3];
    const s = fromBase36(code.slice(4, 6));
    const c = code[6];

    if (!Number.isFinite(y) || y < 0 || y > 18) return null;
    if (!Number.isFinite(l) || l < 1 || l > 10) return null;
    if (!["H", "O"].includes(p)) return null;
    if (!["C", "S", "V", "R"].includes(m)) return null;
    if (!Number.isFinite(s) || s < 0 || s > 1295) return null;

    const expected = checksum36([
      y,
      l,
      p === "H" ? 17 : 29,
      m.charCodeAt(0) % 36,
      s % 36,
      Math.floor(s / 36),
    ]);
    if (expected !== c) return null;

    return {
      year: 2007 + y,
      level: l,
      paperLevel: charToPaper(p),
      mode: charToMode(m),
      seed: s,
      code,
    };
  }

  // --------- Result Code (6 chars) ----------
  // Format: [P][L][W][HHH]
  function makeResultCode({ paperLevel, level, wrong, year, mode, seed, scoreRounded }) {
    const P = paperToChar(paperLevel);
    const L = base36(Math.max(1, Math.min(10, level)));
    const W = base36(Math.max(0, Math.min(35, wrong)));

    let mix =
      (year * 97) ^
      (level * 131) ^
      ((P === "H" ? 17 : 29) * 997) ^
      (modeToChar(mode).charCodeAt(0) * 23) ^
      (seed * 1009) ^
      (scoreRounded * 3) ^
      (wrong * 11);

    mix = Math.abs(mix) % (36 ** 3);
    const HHH = base36(mix).padStart(3, "0");
    return `${P}${L}${W}${HHH}`;
  }

  // --------- Build prompts ----------
  function sectionBadge(i) {
    // Just a friendly structure (not claiming it's the official format)
    if (i <= 1) return "Intro / Ad";
    if (i <= 3) return "Dialogue";
    if (i <= 5) return "Interview";
    if (i <= 7) return "Descriptivo";
    if (i === 8) return "Weather";
    return "News";
  }

  function buildRound({ year, level, seed }) {
    const pool = poolForLevel(level);
    const rng = mulberry32(seed + level * 9991 + year * 13);

    const idx = Array.from({ length: pool.length }, (_, i) => i);
    shuffleInPlace(idx, rng);

    const chosen = idx.slice(0, 10).map((k) => pool[k]);
    return chosen.map((text, i) => ({
      n: i + 1,
      badge: sectionBadge(i),
      text,
    }));
  }

  // --------- Local storage (PB + rounds) ----------
  function setupKey(s) {
    return `taural_pb_${s.year}_${s.paperLevel}_${s.level}_${s.mode}`;
  }
  const ROUNDS_KEY = "taural_rounds_total";

  function loadPB(state) {
    try {
      const raw = localStorage.getItem(setupKey(state));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.bestScore !== "number") return null;
      return obj;
    } catch {
      return null;
    }
  }

  function savePBIfBetter(state, scoreSec, wrong, timeMs) {
    const key = setupKey(state);
    const current = loadPB(state);
    const entry = {
      bestScore: scoreSec,
      bestWrong: wrong,
      bestTimeMs: timeMs,
      at: Date.now(),
    };

    if (!current || scoreSec < current.bestScore - 0.0001) {
      localStorage.setItem(key, JSON.stringify(entry));
      return true;
    }
    return false;
  }

  function incRounds() {
    const n = parseInt(localStorage.getItem(ROUNDS_KEY) || "0", 10);
    const next = Number.isFinite(n) ? n + 1 : 1;
    localStorage.setItem(ROUNDS_KEY, String(next));
    return next;
  }

  function getRounds() {
    const n = parseInt(localStorage.getItem(ROUNDS_KEY) || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }

  // --------- State ----------
  const state = {
    year: 2024,
    paperLevel: "higher",
    level: 1,
    mode: "classic",
    seed: 0,
    matchCode: "",

    prompts: [],
    answers: Array(10).fill(""),
    wrong: Array(10).fill(false),

    idx: 0,
    relayTurn: "A",

    startedAt: 0,
    elapsedMs: 0,
    timerHandle: null,
  };

  // --------- Elements ----------
  const el = {
    pillYear: $("pillYear"),
    pillPaper: $("pillPaper"),
    pillMode: $("pillMode"),

    home: $("screenHome"),
    game: $("screenGame"),
    results: $("screenResults"),

    yearSelect: $("yearSelect"),
    paperSelect: $("paperSelect"),
    levelSelect: $("levelSelect"),
    modeSelect: $("modeSelect"),

    openAudioBtn: $("openAudioBtn"),
    openPaperBtn: $("openPaperBtn"),

    matchInput: $("matchInput"),
    joinBtn: $("joinBtn"),
    newMatchBtn: $("newMatchBtn"),
    soloBtn: $("soloBtn"),
    matchPreview: $("matchPreview"),
    copyMatchBtn: $("copyMatchBtn"),

    pbOut: $("pbOut"),
    roundsOut: $("roundsOut"),

    gameTitle: $("gameTitle"),
    tagMatch: $("tagMatch"),
    tagPenalty: $("tagPenalty"),
    tagCap: $("tagCap"),
    timer: $("timer"),
    paperQuickBtn: $("paperQuickBtn"),
    audioQuickBtn: $("audioQuickBtn"),
    quitBtn: $("quitBtn"),

    promptArea: $("promptArea"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    submitBtn: $("submitBtn"),
    modeHint: $("modeHint"),

    timeOut: $("timeOut"),
    wrongOut: $("wrongOut"),
    scoreOut: $("scoreOut"),
    codeOut: $("codeOut"),

    markGrid: $("markGrid"),
    allCorrectBtn: $("allCorrectBtn"),
    blanksWrongBtn: $("blanksWrongBtn"),
    expandBtn: $("expandBtn"),
    answersWrap: $("answersWrap"),

    copyBtn: $("copyBtn"),
    playAgainBtn: $("playAgainBtn"),
    homeBtn: $("homeBtn"),
    pbBanner: $("pbBanner"),
  };

  // --------- UI helpers ----------
  function labelMode(m) {
    return ({ classic: "Classic", sprint: "Sprint", survival: "Survival", relay: "Relay" }[m] || "Classic");
  }

  function syncPills() {
    el.pillYear.textContent = `Year: ${state.year}`;
    el.pillPaper.textContent = `Paper: ${state.paperLevel === "higher" ? "HL" : "OL"}`;
    el.pillMode.textContent = `Mode: ${labelMode(state.mode)}`;
  }

  function showScreen(which) {
    el.home.classList.toggle("hidden", which !== "home");
    el.game.classList.toggle("hidden", which !== "game");
    el.results.classList.toggle("hidden", which !== "results");
  }

  function syncHomeStats() {
    const pb = loadPB(state);
    if (!pb) {
      el.pbOut.textContent = "—";
    } else {
      el.pbOut.textContent = `${pb.bestScore.toFixed(1)}s (wrong ${pb.bestWrong})`;
    }
    el.roundsOut.textContent = String(getRounds());
  }

  function openAudio() {
    window.open(EDUCATEPLUS_AUDIO_PAGE, "_blank", "noopener,noreferrer");
  }
  function openPaper() {
    window.open(paperUrlFor(state.year, state.paperLevel), "_blank", "noopener,noreferrer");
  }

  // --------- Timer ----------
  function stopTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function startTimer() {
    stopTimer();
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    el.timer.textContent = "00:00.0";

    const capMs = sprintCapForLevel(state.level) * 1000;

    state.timerHandle = setInterval(() => {
      state.elapsedMs = performance.now() - state.startedAt;

      if (state.mode === "sprint" && state.elapsedMs >= capMs) {
        state.elapsedMs = capMs;
        el.timer.textContent = fmtTime(state.elapsedMs);
        submit();
        return;
      }
      el.timer.textContent = fmtTime(state.elapsedMs);
    }, 80);
  }

  // --------- Round start ----------
  function resetRun() {
    state.prompts = [];
    state.answers = Array(10).fill("");
    state.wrong = Array(10).fill(false);
    state.idx = 0;
    state.relayTurn = "A";
  }

  function startRound(seed, matchCode) {
    resetRun();
    state.seed = seed;
    state.matchCode = matchCode || "";

    state.prompts = buildRound({ year: state.year, level: state.level, seed: state.seed });

    syncPills();
    renderGame();
    showScreen("game");
    startTimer();
  }

  function startSolo() {
    const seed = Math.floor(Math.random() * 1296);
    el.matchPreview.textContent = "Match: (solo)";
    startRound(seed, "");
  }

  function generateMatch() {
    const seed = Math.floor(Math.random() * 1296);
    const code = makeMatchCode({
      year: state.year,
      level: state.level,
      paperLevel: state.paperLevel,
      mode: state.mode,
      seed,
    });
    state.matchCode = code;
    el.matchPreview.textContent = `Match: ${code}`;
    alert(`Match Code: ${code}\n\nShare it. Everyone joins to get the same 10 prompts.`);
    startRound(seed, code);
  }

  function joinMatch() {
    const parsed = parseMatchCode(el.matchInput.value);
    if (!parsed) {
      alert("Invalid Match Code (must be 7 characters).");
      return;
    }

    state.year = parsed.year;
    state.level = parsed.level;
    state.paperLevel = parsed.paperLevel;
    state.mode = parsed.mode;

    el.yearSelect.value = String(state.year);
    el.paperSelect.value = state.paperLevel;
    el.levelSelect.value = String(state.level);
    el.modeSelect.value = state.mode;

    el.matchPreview.textContent = `Match: ${parsed.code}`;
    startRound(parsed.seed, parsed.code);
  }

  async function copyMatch() {
    const txt = (state.matchCode || el.matchPreview.textContent || "").trim();
    if (!txt || txt.includes("—")) return;
    try {
      await navigator.clipboard.writeText(txt.replace(/^Match:\s*/i, ""));
      alert("Match copied!");
    } catch {
      alert("Copy failed on this browser/device.");
    }
  }

  // --------- Game render ----------
  function renderGame() {
    const pen = penaltyForLevel(state.level);
    el.tagMatch.textContent = state.matchCode ? `Match: ${state.matchCode}` : "Match: (solo)";
    el.tagPenalty.textContent = `Penalty: +${pen}s per wrong`;
    el.tagCap.textContent = state.mode === "sprint" ? `Sprint cap: ${sprintCapForLevel(state.level)}s` : "Sprint cap: —";

    el.gameTitle.textContent =
      `${state.paperLevel === "higher" ? "Higher" : "Ordinary"} · ${state.year} · Level ${state.level} · ${labelMode(state.mode)}`;

    el.modeHint.textContent =
      state.mode === "sprint"
        ? `Sprint: auto-submits at ${sprintCapForLevel(state.level)} seconds.`
        : state.mode === "survival"
          ? "Survival: aim for 0 wrong (blanks count)."
          : state.mode === "relay"
            ? `Relay: Player ${state.relayTurn} (${state.relayTurn === "A" ? "Prompts 1–5" : "Prompts 6–10"})`
            : "";

    el.promptArea.innerHTML = "";

    if (state.mode === "sprint") {
      el.prevBtn.classList.add("hidden");
      el.nextBtn.classList.add("hidden");
      el.submitBtn.classList.remove("hidden");

      state.prompts.forEach((p, i) => el.promptArea.appendChild(promptCard(p, i)));
      return;
    }

    el.prevBtn.classList.remove("hidden");
    el.nextBtn.classList.remove("hidden");

    const isLast = state.idx === 9;
    el.submitBtn.classList.toggle("hidden", !isLast);
    el.nextBtn.classList.toggle("hidden", isLast);

    el.prevBtn.disabled = state.idx === 0;

    el.promptArea.appendChild(promptCard(state.prompts[state.idx], state.idx));
  }

  function promptCard(p, i) {
    const wrap = document.createElement("div");
    wrap.className = "prompt";

    const top = document.createElement("div");
    top.className = "promptTop";

    const title = document.createElement("div");
    title.className = "promptTitle";
    title.textContent = `Prompt ${p.n}`;

    const badge = document.createElement("div");
    badge.className = "promptBadge";
    badge.textContent = p.badge;

    top.appendChild(title);
    top.appendChild(badge);

    const text = document.createElement("div");
    text.className = "promptText";
    text.textContent = p.text;

    const ta = document.createElement("textarea");
    ta.placeholder = "Your answer / notes…";
    ta.value = state.answers[i] || "";
    ta.addEventListener("input", () => { state.answers[i] = ta.value; });

    wrap.appendChild(top);
    wrap.appendChild(text);
    wrap.appendChild(ta);

    return wrap;
  }

  function goPrev() {
    state.idx = Math.max(0, state.idx - 1);
    renderGame();
  }

  function goNext() {
    // relay handoff after prompt 5
    if (state.mode === "relay" && state.relayTurn === "A" && state.idx === 4) {
      state.relayTurn = "B";
      state.idx = 5;
      renderGame();
      return;
    }
    state.idx = Math.min(9, state.idx + 1);
    renderGame();
  }

  // --------- Scoring ----------
  function computeWrongCount() {
    let wrong = 0;
    for (let i = 0; i < 10; i++) {
      const blank = !String(state.answers[i] || "").trim();
      if (blank) state.wrong[i] = true;
      if (state.wrong[i]) wrong++;
    }
    return wrong;
  }

  function computeScore() {
    const pen = penaltyForLevel(state.level);
    const wrong = computeWrongCount();
    const timeSec = state.elapsedMs / 1000;
    const score = timeSec + wrong * pen;
    return { pen, wrong, timeSec, score };
  }

  // --------- Results ----------
  function submit() {
    stopTimer();
    showScreen("results");
    el.pbBanner.classList.add("hidden");
    renderResults(true);
  }

  function renderResults(firstRender) {
    const { wrong, score } = computeScore();

    el.timeOut.textContent = fmtTime(state.elapsedMs);
    el.wrongOut.textContent = String(wrong);
    el.scoreOut.textContent = `${score.toFixed(1)}s`;

    const code = makeResultCode({
      paperLevel: state.paperLevel,
      level: state.level,
      wrong,
      year: state.year,
      mode: state.mode,
      seed: state.seed,
      scoreRounded: Math.round(score),
    });
    el.codeOut.textContent = code;

    renderMarkGrid();
    if (firstRender) {
      renderAnswers(false);
    }

    // PB check only once per submission
    if (firstRender) {
      const becamePB = savePBIfBetter(state, score, wrong, state.elapsedMs);
      incRounds();
      syncHomeStats();
      if (becamePB) el.pbBanner.classList.remove("hidden");
    }
  }

  function renderMarkGrid() {
    el.markGrid.innerHTML = "";

    for (let i = 0; i < 10; i++) {
      const blank = !String(state.answers[i] || "").trim();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "markBtn";

      btn.textContent = String(i + 1);

      if (blank) btn.classList.add("blank");
      btn.classList.add(state.wrong[i] ? "bad" : "good");

      btn.addEventListener("click", () => {
        state.wrong[i] = !state.wrong[i];
        renderResults(false);
      });

      el.markGrid.appendChild(btn);
    }
  }

  function renderAnswers(show) {
    el.answersWrap.innerHTML = "";

    for (let i = 0; i < 10; i++) {
      const item = document.createElement("div");
      item.className = "answerItem";

      const head = document.createElement("div");
      head.className = "answerHead";

      const left = document.createElement("div");
      left.innerHTML = `<b>Prompt ${i + 1}</b> <span class="tag" style="margin-left:8px;">${sectionBadge(i)}</span>`;

      const right = document.createElement("button");
      right.type = "button";
      right.className = `btn tiny ${state.wrong[i] ? "primary" : "ghost"}`;
      right.textContent = state.wrong[i] ? "Wrong" : "Right";
      right.addEventListener("click", () => {
        state.wrong[i] = !state.wrong[i];
        renderResults(false);
        if (!el.answersWrap.classList.contains("hidden")) renderAnswers(true);
      });

      head.appendChild(left);
      head.appendChild(right);

      const prompt = document.createElement("div");
      prompt.className = "answerBody";
      prompt.innerHTML = `<em>${state.prompts[i].text}</em>`;

      const ans = document.createElement("div");
      ans.className = "answerBody";
      const txt = String(state.answers[i] || "").trim();
      ans.textContent = txt ? txt : "(blank — counts as wrong)";

      item.appendChild(head);
      item.appendChild(prompt);
      item.appendChild(ans);

      el.answersWrap.appendChild(item);
    }

    el.answersWrap.classList.toggle("hidden", !show);
    el.expandBtn.textContent = show ? "Hide answers" : "Show answers";
  }

  function markAllCorrect() {
    state.wrong = Array(10).fill(false);
    // blanks will be re-flagged automatically
    renderResults(false);
  }

  function markBlanksWrong() {
    for (let i = 0; i < 10; i++) {
      const blank = !String(state.answers[i] || "").trim();
      if (blank) state.wrong[i] = true;
    }
    renderResults(false);
  }

  async function copyResult() {
    const { wrong, score } = computeScore();

    const txt =
      `Turbo Aural (${state.paperLevel === "higher" ? "HL" : "OL"}) ${state.year}\n` +
      `Level ${state.level} | Mode: ${labelMode(state.mode)}\n` +
      `Match: ${state.matchCode || "(solo)"}\n` +
      `Time: ${fmtTime(state.elapsedMs)} | Wrong: ${wrong} | Score: ${score.toFixed(1)}s\n` +
      `Result Code: ${el.codeOut.textContent.trim()}`;

    try {
      await navigator.clipboard.writeText(txt);
      alert("Copied!");
    } catch {
      alert("Copy failed on this browser/device.");
    }
  }

  // --------- Init ----------
  function fillSelects() {
    el.yearSelect.innerHTML = YEARS.slice().reverse().map(y => `<option value="${y}">${y}</option>`).join("");
    el.yearSelect.value = String(state.year);

    el.levelSelect.innerHTML = Array.from({ length: 10 }, (_, i) => {
      const n = i + 1;
      return `<option value="${n}">Level ${n}</option>`;
    }).join("");
    el.levelSelect.value = String(state.level);

    el.paperSelect.value = state.paperLevel;
    el.modeSelect.value = state.mode;
  }

  function wireEvents() {
    el.yearSelect.addEventListener("change", () => {
      state.year = parseInt(el.yearSelect.value, 10);
      syncPills();
      syncHomeStats();
    });
    el.paperSelect.addEventListener("change", () => {
      state.paperLevel = el.paperSelect.value;
      syncPills();
      syncHomeStats();
    });
    el.levelSelect.addEventListener("change", () => {
      state.level = parseInt(el.levelSelect.value, 10);
      syncPills();
      syncHomeStats();
    });
    el.modeSelect.addEventListener("change", () => {
      state.mode = el.modeSelect.value;
      syncPills();
      syncHomeStats();
    });

    el.openAudioBtn.addEventListener("click", openAudio);
    el.openPaperBtn.addEventListener("click", openPaper);
    el.audioQuickBtn.addEventListener("click", openAudio);
    el.paperQuickBtn.addEventListener("click", openPaper);

    el.soloBtn.addEventListener("click", startSolo);
    el.newMatchBtn.addEventListener("click", generateMatch);
    el.joinBtn.addEventListener("click", joinMatch);
    el.matchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") joinMatch();
    });
    el.copyMatchBtn.addEventListener("click", copyMatch);

    el.prevBtn.addEventListener("click", goPrev);
    el.nextBtn.addEventListener("click", goNext);
    el.submitBtn.addEventListener("click", submit);

    el.quitBtn.addEventListener("click", () => {
      stopTimer();
      showScreen("home");
    });

    el.allCorrectBtn.addEventListener("click", markAllCorrect);
    el.blanksWrongBtn.addEventListener("click", markBlanksWrong);
    el.expandBtn.addEventListener("click", () => {
      const show = el.answersWrap.classList.contains("hidden");
      renderAnswers(show);
    });

    el.copyBtn.addEventListener("click", copyResult);
    el.playAgainBtn.addEventListener("click", () => showScreen("home"));
    el.homeBtn.addEventListener("click", () => showScreen("home"));
  }

  function boot() {
    fillSelects();
    syncPills();
    syncHomeStats();

    el.matchPreview.textContent = "Match: —";
    showScreen("home");
    wireEvents();
  }

  boot();
})();
