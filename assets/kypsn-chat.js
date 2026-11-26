/* KYPSN 안내 챗봇 위젯
   각 페이지 </body> 앞에 한 줄:
   <script src="/assets/kypsn-chat.js" data-endpoint="https://kypsn-chat.<계정>.workers.dev" defer></script>
   색은 사이트 팔레트(assets/style.css)와 같다: 네이비 #1B2A5E · 골드 #B8912A */
(function () {
  const me = document.currentScript;
  const ENDPOINT = me && me.dataset.endpoint;
  if (!ENDPOINT) return console.warn("[kypsn-chat] data-endpoint 가 없습니다.");
  const HKEY = "kypsn-chat-history";

  const css = `
  .kc-root{--kc-navy:#1B2A5E;--kc-deep:#0F1838;--kc-gold:#B8912A;--kc-gold-soft:#E9D9AE;--kc-line:#DFE3EA;--kc-mist:#EEF2F8;--kc-ink:#121829;--kc-muted:#5E6576;font-family:inherit}
  .kc-btn{position:fixed;right:20px;bottom:20px;height:52px;padding:0 18px 0 14px;border-radius:26px;border:0;display:flex;align-items:center;gap:8px;
    background:var(--kc-navy);color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(15,24,56,.28);z-index:9998}
  .kc-btn svg{width:22px;height:22px}
  .kc-btn:hover{background:var(--kc-deep)}
  .kc-box{position:fixed;right:20px;bottom:84px;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 110px));
    background:#fff;border:1px solid var(--kc-line);border-radius:16px;box-shadow:0 16px 40px rgba(15,24,56,.22);
    display:none;flex-direction:column;overflow:hidden;z-index:9999}
  .kc-box.open{display:flex}
  .kc-head{background:var(--kc-navy);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}
  .kc-head .kc-t{flex:1;line-height:1.3}
  .kc-head b{display:block;font-size:15px}
  .kc-head small{font-size:12px;color:var(--kc-gold-soft)}
  .kc-head button{background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:4px}
  .kc-dot{width:8px;height:8px;border-radius:50%;background:var(--kc-gold)}
  .kc-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;font-size:14px;line-height:1.6;background:#FBFAF7}
  .kc-m{max-width:86%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere}
  .kc-u{align-self:flex-end;background:var(--kc-navy);color:#fff;border-bottom-right-radius:4px}
  .kc-a{align-self:flex-start;background:#fff;color:var(--kc-ink);border:1px solid var(--kc-line);border-bottom-left-radius:4px}
  .kc-a a{color:var(--kc-navy);font-weight:700}
  .kc-wait{color:var(--kc-muted)}
  .kc-wait i{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:var(--kc-muted);animation:kcb 1s infinite alternate}
  .kc-wait i:nth-child(2){animation-delay:.2s}.kc-wait i:nth-child(3){animation-delay:.4s}
  @keyframes kcb{from{opacity:.2}to{opacity:1}}
  .kc-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 10px;background:#FBFAF7}
  .kc-chips button{border:1px solid var(--kc-gold);color:var(--kc-navy);background:#fff;border-radius:999px;padding:5px 11px;font:inherit;font-size:12.5px;cursor:pointer}
  .kc-chips button:hover{background:var(--kc-gold-soft)}
  .kc-form{display:flex;border-top:1px solid var(--kc-line);background:#fff}
  .kc-in{flex:1;border:0;padding:13px 14px;font:inherit;font-size:16px;outline:none;min-width:0}
  .kc-send{border:0;background:var(--kc-gold);color:#fff;padding:0 18px;cursor:pointer;font:inherit;font-weight:700}
  .kc-send:disabled{opacity:.5}
  .kc-foot{font-size:11px;color:var(--kc-muted);padding:6px 14px 9px;background:#fff}
  @media (max-width:480px){.kc-btn span{display:none}.kc-btn{padding:0 14px}}`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.className = "kc-root";
  wrap.innerHTML = `
  <button class="kc-btn" type="button" aria-label="KYPSN 안내 챗봇 열기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>무엇이든 물어보세요</span></button>
  <div class="kc-box" role="dialog" aria-label="KYPSN 안내 챗봇">
    <div class="kc-head"><span class="kc-dot"></span><div class="kc-t"><b>KYPSN 안내</b><small>회원 · 프로그램 · 행사</small></div><button type="button" aria-label="닫기">×</button></div>
    <div class="kc-log" aria-live="polite"></div>
    <div class="kc-chips"></div>
    <form class="kc-form"><input class="kc-in" maxlength="800" placeholder="궁금한 점을 물어보세요" autocomplete="off" aria-label="질문"><button class="kc-send" type="submit">전송</button></form>
    <div class="kc-foot">AI가 답하며 틀릴 수 있습니다. 정확한 안내는 office@kypsn.org</div>
  </div>`;
  document.body.appendChild(wrap);

  const $ = s => wrap.querySelector(s);
  const box = $(".kc-box"), log = $(".kc-log"), input = $(".kc-in"), chips = $(".kc-chips"), send = $(".kc-send");
  let history = [];
  try { history = JSON.parse(sessionStorage.getItem(HKEY) || "[]").slice(-10); } catch (e) { history = []; }
  const save = () => { try { sessionStorage.setItem(HKEY, JSON.stringify(history.slice(-10))); } catch (e) {} };
  let busy = false;

  function esc(t) { return t.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function linkify(t) {
    return esc(t)
      .replace(/(https?:\/\/[^\s)<]+[^\s)<.,])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/([\w.+-]+@kypsn\.org)/g, '<a href="mailto:$1">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "$1");
  }
  function add(role, text) {
    const d = document.createElement("div");
    d.className = "kc-m " + (role === "user" ? "kc-u" : "kc-a");
    if (role === "user") d.textContent = text; else d.innerHTML = linkify(text);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  async function ask(q) {
    q = (q || "").trim();
    if (busy || !q) return;
    busy = true; send.disabled = true; chips.style.display = "none";
    add("user", q); history.push({ role: "user", content: q });
    const pending = add("assistant", "");
    pending.classList.add("kc-wait"); pending.innerHTML = "<i></i><i></i><i></i>";
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
      const r = await fetch(ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) }), signal: ctl.signal,
      });
      clearTimeout(to);
      const d = await r.json().catch(() => ({}));
      const text = d.reply || d.error || "오류가 발생했습니다. office@kypsn.org로 문의해 주세요.";
      pending.classList.remove("kc-wait"); pending.innerHTML = linkify(text);
      if (d.reply) history.push({ role: "assistant", content: d.reply }); else history.pop();
    } catch (e) {
      pending.classList.remove("kc-wait");
      pending.textContent = "연결이 잠시 끊겼습니다. 다시 시도하거나 office@kypsn.org로 문의해 주세요.";
      history.pop();
    }
    save();
    busy = false; send.disabled = false; log.scrollTop = log.scrollHeight;
  }

  ["회원 가입은 어떻게 하나요?", "어떤 프로그램이 있나요?", "12월 5일 행사 안내"].forEach(q => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = q;
    b.onclick = () => ask(q); chips.appendChild(b);
  });
  add("assistant", "안녕하세요. KYPSN 안내 챗봇입니다. 회원, 프로그램, 12월 5일 행사에 대해 물어보세요.");
  history.forEach(m => add(m.role, m.content));
  if (history.length) chips.style.display = "none";

  $(".kc-btn").onclick = () => { box.classList.toggle("open"); if (box.classList.contains("open") && window.innerWidth > 480) input.focus(); };
  $(".kc-head button").onclick = () => box.classList.remove("open");
  $(".kc-form").onsubmit = e => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); };
})();
