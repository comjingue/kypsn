// KYPSN Night 공용: 픽셀 캐릭터 + 저장소(구글 폼/시트, 없으면 이 브라우저 로컬)
(function () {
  const CFG = window.NIGHT_CONFIG || {};
  // 시험용: 주소 뒤 ?topic=이름 으로 다른 방을 쓸 수 있다
  const TOPIC_Q = new URLSearchParams(location.search).get("topic");
  if (TOPIC_Q && /^[A-Za-z0-9_-]{8,64}$/.test(TOPIC_Q)) CFG.ntfyTopic = TOPIC_Q;
  CFG.joinLink = CFG.joinUrl + (TOPIC_Q ? "?topic=" + encodeURIComponent(TOPIC_Q) : "");
  const NTFY = !!CFG.ntfyTopic;
  const LIVE = NTFY || !!(CFG.formAction && CFG.sheetId);
  const NTFY_URL = "https://ntfy.sh/" + (CFG.ntfyTopic || "");
  const LS_KEY = "kypsn-night-entries";

  // ── 결정적 난수 ─────────────────────────────────────────
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

  // ── 픽셀 캐릭터 (16×20) ────────────────────────────────
  const BODY = [
    "................",
    "................",
    "................",
    "....SSSSSSSS....",
    "....SSSSSSSS....",
    "....SSESSESS....",
    "....SSSSSSSS....",
    ".....SSMMSS.....",
    "......SSSS......",
    "....CCCCCCCC....",
    "...CCCCCCCCCC...",
    "...SCCCCCCCCS...",
    "...SCCCCCCCCS...",
    "....CCCCCCCC....",
    "....PPPPPPPP....",
    "....PPP..PPP....",
    "....PPP..PPP....",
    "....BBB..BBB....",
    "................",
    "................"
  ];
  const WALK = [
    null,
    { 15: "....PPP...PP....", 16: "...PPP....PP....", 17: "...BBB....BB...." },
    { 15: "....PP...PPP....", 16: "....PP....PPP...", 17: "....BB....BBB..." }
  ];
  const HAIR = {
    short: { 1: ".....HHHHHH.....", 2: "....HHHHHHHH....", 3: "....HHHHHHHH....", 4: "....HSSSSSSH...." },
    side:  { 1: "......HHHHH.....", 2: "....HHHHHHHH....", 3: "....HHHHHHHH....", 4: "....HHSSSSSS...." },
    long:  { 1: ".....HHHHHH.....", 2: "....HHHHHHHH....", 3: "...HHHHHHHHHH...", 4: "...HHSSSSSSHH...", 5: "...HSSESSESSH...", 6: "...HSSSSSSSSH...", 7: "...HHSSMMSSHH...", 8: "...HH.SSSS.HH..." },
    bun:   { 0: ".......HH.......", 1: ".....HHHHHH.....", 2: "....HHHHHHHH....", 3: "...HHHHHHHHHH...", 4: "...HHSSSSSSHH...", 5: "...H........H...", 6: "...H........H..." },
    cap:   { 1: ".....KKKKKK.....", 2: "....KKKKKKKK....", 3: "....KKKKKKKKKK..", 4: "....HSSSSSSH...." },
    bob:   { 1: ".....HHHHHH.....", 2: "....HHHHHHHH....", 3: "...HHHHHHHHHH...", 4: "...HHSSSSSSHH...", 5: "...HSSESSESSH...", 6: "...HSSSSSSSSH...", 7: "...HH......HH...", 8: "....H......H...." },
    curly: { 1: "....H.HHHH.H....", 2: "...HHHHHHHHHH...", 3: "...HHHHHHHHHH...", 4: "....HSSSSSSH...." }
  };
  const SKIN = ["#F6D3B3", "#EDBE98", "#D9A27A", "#F1C9A6", "#C88F68"];
  const HAIRC = ["#2A1C12", "#3B2618", "#151515", "#6B4226", "#8A5A2B", "#2E2A4F"];
  const SHIRT = ["#2F55A4", "#B8912A", "#3FA796", "#C25B4E", "#7E57C2", "#E07B39", "#4F7CB8", "#5C8A3A"];
  const PANTS = ["#2B3242", "#38476A", "#4A3F35", "#24324F"];
  const CAPC = ["#1B2A5E", "#B8912A", "#C25B4E", "#3FA796"];

  // 직위에 따라 옷: 임상의는 가운, 산업계는 정장
  function look(pos, sex) { pos = String(pos || ""); let o = null; if (/전공의|전임의|전문의|교수/.test(pos)) o = { coat: true }; else if (/산업계|창업/.test(pos)) o = { coat: false, shirt: "#2B2F45", tie: !/여/.test(sex || "") }; else if (/의대생|대학원생/.test(pos)) o = { coat: false }; if (sex === "남" || sex === "여") { o = o || {}; o.sex = sex; } return o; }
  function spec(key, over) {
    const r = rng(hash(String(key || "kypsn")));
    const pick = a => a[Math.floor(r() * a.length)];
    return { hair: pick(Object.keys(HAIR)), skin: pick(SKIN), hairC: pick(HAIRC), shirt: pick(SHIRT), pants: pick(PANTS), cap: pick(CAPC), coat: r() < 0.35, glasses: r() < 0.3, tie: false };
  }
  const HAIR_M = ["short", "side", "cap", "curly"], HAIR_F = ["long", "bun", "bob"];
  function specOf(key, over) {
    const sp = Object.assign(spec0(key), over || {});
    if (sp.sex) { const set = sp.sex === "여" ? HAIR_F : HAIR_M; sp.hair = set[hash(String(key) + "#hair") % set.length]; sp.blush = sp.sex === "여"; }
    else if (HAIR_F.includes(sp.hair)) sp.blush = true;
    return sp;
  }
  function spec0(key) { return spec(key);
  }
  function grid(sp, frame) {
    const g = BODY.map(s => s.split(""));
    const w = WALK[frame || 0];
    if (w) Object.keys(w).forEach(k => { g[k] = w[k].split(""); });
    if (sp.blush) { // 여성: 치마 + 다리
      const L = [".....SS..SS.....", "....SS...SS.....", ".....SS...SS...."][frame || 0];
      g[14] = "....PPPPPPPP....".split(""); g[15] = "...PPPPPPPPPP...".split(""); g[16] = L.split(""); g[17] = L.replace(/S/g, "B").split("");
    }
    const h = HAIR[sp.hair];
    Object.keys(h).forEach(k => { h[k].split("").forEach((ch, i) => { if (ch !== ".") g[k][i] = ch; else if (+k <= 2) g[k][i] = "."; }); });
    if (sp.blush && sp.hair !== "cap") { g[1][11] = "R"; g[2][11] = "R"; g[2][12] = "R"; }
    if (sp.coat) { [9, 10, 11, 12, 13].forEach(r => { g[r].forEach((ch, i) => { if (ch === "C" && (i <= 5 || i >= 10)) g[r][i] = "W"; }); }); }
    if (sp.glasses) { const row = g[5]; [5, 6, 7, 8, 9, 10].forEach(i => { if (row[i] === "S") row[i] = "G"; }); }
    return g;
  }
  // ctx 위 (ox, oy) 왼쪽 위 기준으로 s배 크기로 그린다
  function paint(ctx, key, ox, oy, s, frame, over) {
    const sp = specOf(key, over), g = grid(sp, frame);
    s = s || 1;
    const col = { S: sp.skin, H: sp.hairC, E: "#1B1B22", M: "#B5524A", C: sp.shirt, W: "#F4F6FA", P: sp.pants, B: "#1E1E24", K: sp.cap, G: "#1B1B22", R: "#E0507A" };
    g.forEach((row, y) => row.forEach((ch, x) => { if (ch !== "." && col[ch]) { ctx.fillStyle = col[ch]; ctx.fillRect(ox + x * s, oy + y * s, s, s); } }));
    if (sp.coat) { ctx.fillStyle = "#C9D1E0"; ctx.fillRect(ox + 7 * s, oy + 10 * s, Math.max(1, s / 2), 4 * s); }
    if (sp.blush) { ctx.fillStyle = "#EE9A92"; ctx.fillRect(ox + 5 * s, oy + 6 * s, s, s); ctx.fillRect(ox + 10 * s, oy + 6 * s, s, s); }
    if (sp.tie) { ctx.fillStyle = "#F4F6FA"; ctx.fillRect(ox + 7 * s, oy + 9 * s, 2 * s, s); ctx.fillStyle = "#C25B4E"; ctx.fillRect(ox + 7 * s, oy + 10 * s, 2 * s, 3 * s); }
  }
  function draw(canvas, key, scale, frame, over) {
    const s = scale || 6;
    canvas.width = 16 * s; canvas.height = 20 * s;
    const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(ctx, key, 0, 0, s, frame, over);
    return canvas;
  }

  // ── 저장소 ─────────────────────────────────────────────
  function localAll() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { return []; } }
  function localAdd(e) { const a = localAll(); a.push(e); try { localStorage.setItem(LS_KEY, JSON.stringify(a)); } catch (x) {} }

  async function submit(entry) {
    entry.ts = entry.ts || new Date().toISOString();
    if (!LIVE) { localAdd(entry); return true; }
    if (NTFY) { const r = await fetch(NTFY_URL, { method: "POST", body: "KN1:" + encodeURIComponent(JSON.stringify(entry)) }); if (!r.ok) throw new Error("ntfy " + r.status); return true; }
    const body = new URLSearchParams();
    Object.keys(CFG.entries).forEach(k => { if (CFG.entries[k] && entry[k] != null) body.append("entry." + CFG.entries[k], entry[k]); });
    await fetch(CFG.formAction, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
    return true;
  }

  // 구글 시트 읽기: JSONP(gviz) — CORS 걱정 없음
  let jsonpN = 0;
  function gviz() {
    return new Promise((resolve, reject) => {
      const cb = "__kn_cb" + (++jsonpN);
      const s = document.createElement("script");
      const t = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, 10000);
      function cleanup() { clearTimeout(t); delete window[cb]; s.remove(); }
      window[cb] = data => { cleanup(); resolve(data); };
      s.onerror = () => { cleanup(); reject(new Error("load")); };
      s.src = "https://docs.google.com/spreadsheets/d/" + CFG.sheetId + "/gviz/tq?tqx=responseHandler:" + cb + (CFG.sheetGid ? "&gid=" + CFG.sheetGid : "") + "&headers=1&t=" + Date.now();
      document.head.appendChild(s);
    });
  }
  async function fetchAll() {
    if (!LIVE) return localAll();
    const json = await gviz();
    const labels = json.table.cols.map(c => (c.label || "").trim().toLowerCase());
    return json.table.rows.map(r => {
      const o = {}; labels.forEach((l, i) => { const c = r.c[i]; o[l] = c ? (c.f != null ? c.f : c.v) : ""; });
      return { kind: o.kind, cid: o.cid, name: o.name, role: o.role, question: o.question, meet: o.meet, target: o.target, ask: o.ask, ts: o.timestamp || o["타임스탬프"] || "" };
    });
  }

  // ntfy 메시지 → 항목
  function fromNtfy(m) { if (!m || m.event !== "message" || typeof m.message !== "string" || m.message.indexOf("KN1:") !== 0) return null; try { const e = JSON.parse(decodeURIComponent(m.message.slice(4))); e._id = m.id; return e; } catch (x) { return null; } }

  // 새 항목이 생길 때마다 onAll(전체 목록)을 부른다
  function listen(onAll, pollMs) {
    if (!NTFY) { const go = async () => { try { onAll(await fetchAll()); } catch (e) {} }; go(); setInterval(go, pollMs || 4000); window.addEventListener("storage", e => { if (e.key === LS_KEY) go(); }); return; }
    const seen = new Map(); let lastId = "all", es = null;
    const add = m => { const e = fromNtfy(m); if (e && !seen.has(e._id)) { seen.set(e._id, e); lastId = e._id; return true; } return false; };
    const emit = () => onAll([...seen.values()]);
    async function poll() {
      const txt = await (await fetch(NTFY_URL + "/json?poll=1&since=" + lastId)).text();
      let ch = false; txt.split("\n").forEach(l => { if (l.trim()) { try { if (add(JSON.parse(l))) ch = true; } catch (x) {} } });
      return ch;
    }
    function stream() {
      if (es) es.close();
      es = new EventSource(NTFY_URL + "/sse?since=" + lastId);
      es.onmessage = ev => { try { if (add(JSON.parse(ev.data))) emit(); } catch (x) {} };
      es.onerror = () => { window.__knErr = (window.__knErr || 0) + 1; };
    }
    if (new URLSearchParams(location.search).has("poll")) { poll().then(emit).catch(() => emit()); setInterval(() => { poll().then(ch => { if (ch) emit(); }).catch(() => {}); }, pollMs || 5000); return; }
    poll().then(emit).catch(() => emit()).finally(stream);
    // 안전망: 1분마다 빠진 것 채우기
    setInterval(() => { poll().then(ch => { if (ch) emit(); }).catch(() => {}); }, 60000);
  }

  function myId() {
    let id = null; try { id = localStorage.getItem("kypsn-night-cid"); } catch (e) {}
    if (!id) { id = "p" + Math.random().toString(36).slice(2, 10); try { localStorage.setItem("kypsn-night-cid", id); } catch (e) {} }
    return id;
  }

  window.KNight = { draw, paint, look, spec, hash, rng, submit, fetchAll, listen, myId, LIVE, NTFY, LS_KEY, CFG };
})();
