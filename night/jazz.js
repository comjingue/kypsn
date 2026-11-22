// 호텔 라운지 재즈 (저작권 걱정 없는 즉석 생성 음악, Web Audio)
// 일렉트릭 피아노 코드 + 워킹 베이스 + 브러시. 사회자 말할 때는 duck(true)로 소리를 줄인다
(function () {
  let ctx = null, master = null, duckGain = null, playing = false, timer = null, nextBar = 0, barNo = 0;
  const BPM = 84, BEAT = 60 / BPM;
  // ii-V-I 진행 (F 장조 → D 단조 쪽으로 도는 8마디)
  const PROG = [
    { root: 43, chord: [55, 58, 60, 65] },   // Gm9 (G2 / Bb3 D4 F4 A4 근사)
    { root: 48, chord: [52, 55, 58, 62] },   // C13
    { root: 41, chord: [52, 57, 60, 64] },   // Fmaj9
    { root: 50, chord: [53, 57, 60, 66] },   // Dm9
    { root: 43, chord: [53, 58, 62, 65] },   // Gm7
    { root: 48, chord: [52, 58, 62, 69] },   // C7
    { root: 45, chord: [52, 55, 60, 64] },   // Am7
    { root: 50, chord: [54, 57, 60, 66] }    // D7
  ];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let noiseBuf = null;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.0;
    duckGain = ctx.createGain(); duckGain.gain.value = 1;
    const comp = ctx.createDynamicsCompressor();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5200;
    master.connect(duckGain); duckGain.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function ep(t, midi, dur, vel) {   // 일렉트릭 피아노 비슷한 소리
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o1.type = "sine"; o2.type = "triangle"; o1.frequency.value = hz(midi); o2.frequency.value = hz(midi) * 2.001;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    f.type = "lowpass"; f.frequency.value = 2400;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(f); f.connect(master);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.012); g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function bass(t, midi, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = "triangle"; o.frequency.value = hz(midi); f.type = "lowpass"; f.frequency.value = 600;
    o.connect(f); f.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.42, t + 0.02); g.gain.exponentialRampToValueAtTime(0.06, t + dur * 0.9); g.gain.linearRampToValueAtTime(0, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function brush(t, vel, len) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; f.type = "highpass"; f.frequency.value = 6500;
    s.connect(f); f.connect(g); g.connect(master);
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0005, t + len);
    s.start(t); s.stop(t + len + 0.02);
  }
  function scheduleBar(t, i) {
    const p = PROG[i % PROG.length], nx = PROG[(i + 1) % PROG.length];
    // 워킹 베이스: 근음, 3·5도, 다음 코드로 반음 접근
    const walk = [p.root, p.root + (Math.random() < .5 ? 4 : 3), p.root + 7, nx.root + (Math.random() < .5 ? 1 : -1)];
    walk.forEach((m, k) => bass(t + k * BEAT, m, BEAT * 0.95));
    // 피아노 컴핑: 스윙 박에 코드 두세 번
    const hits = [[0, .9], [1.66, .5], [2.66, .7]];
    if (Math.random() < .5) hits.push([3.66, .35]);
    hits.forEach(([b, v]) => { const tt = t + b * BEAT + (Math.random() * 0.02); p.chord.forEach((m, k) => ep(tt + k * 0.008, m, BEAT * (b === 0 ? 1.8 : 1.1), 0.07 * v)); });
    // 가끔 위쪽 멜로디 한 음
    if (Math.random() < .45) { const m = p.chord[3] + [0, 2, 3, 5, 7][Math.floor(Math.random() * 5)]; ep(t + BEAT * (1 + Math.floor(Math.random() * 2)) + BEAT * .66, m, BEAT * 1.2, 0.05); }
    // 브러시: 2·4박 강조 + 스윙 8분
    for (let k = 0; k < 4; k++) { brush(t + k * BEAT, k % 2 ? 0.05 : 0.03, 0.12); brush(t + (k + 0.66) * BEAT, 0.018, 0.06); }
  }
  // 아이폰은 무음 스위치가 켜져 있으면 Web Audio 소리를 막는다.
  // 미디어 재생으로 분류되게 바꾸고(Safari 17+), 예전 기종은 무음 오디오를 같이 틀어 미디어 채널을 연다
  let unlocked = false;
  function unlockMobile() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    if (unlocked) return; unlocked = true;
    try {
      const sr = 8000, n = sr / 2, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
      const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
      const a = new Audio(URL.createObjectURL(new Blob([buf], { type: "audio/wav" })));
      a.loop = true; a.setAttribute("playsinline", ""); a.volume = 0.01; const p = a.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  // 화면을 다시 켜면(휴대폰 잠금 해제 등) 멈춘 소리를 되살린다
  document.addEventListener("visibilitychange", () => { if (ctx && playing && document.visibilityState === "visible") ctx.resume(); });
  function loop() {
    while (nextBar < ctx.currentTime + 1.2) { scheduleBar(nextBar, barNo++); nextBar += BEAT * 4; }
  }
  const api = {
    get on() { return playing; },
    start() {
      unlockMobile();
      init(); ctx.resume(); if (playing) return; playing = true;
      nextBar = ctx.currentTime + 0.1; master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(api.volume, ctx.currentTime + 2);
      clearInterval(timer); loop(); timer = setInterval(loop, 300);
    },
    stop() {
      if (!playing) return; playing = false;
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => { if (!playing) clearInterval(timer); }, 1600);
    },
    toggle() { playing ? api.stop() : api.start(); return playing; },
    volume: 0.5,
    setVolume(v) { api.volume = Math.max(0, Math.min(1, v)); if (ctx && playing) master.gain.linearRampToValueAtTime(api.volume, ctx.currentTime + 0.3); },
    duck(on) { if (!ctx) return; duckGain.gain.cancelScheduledValues(ctx.currentTime); duckGain.gain.linearRampToValueAtTime(on ? 0.3 : 1, ctx.currentTime + 0.6); }
  };
  window.KJazz = api;
})();
