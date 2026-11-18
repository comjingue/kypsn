// KYPSN 공통 스크립트: 메뉴, 모바일 메뉴, 등장 애니메이션, D-day
(function () {
  var nav = document.querySelector('.nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('m-menu');
  if (btn && menu) {
    var setMenu = function (open) {
      btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      menu.setAttribute('aria-hidden', !open); menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open); nav.classList.toggle('scrolled', open || window.scrollY > 40);
    };
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  var dday = document.getElementById('dday');
  if (dday) {
    var k = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })); k.setHours(0, 0, 0, 0);
    var days = Math.round((new Date(2026, 11, 5) - k) / 86400000);
    if (days > 0) dday.textContent = 'D-' + days + ' · 신청 마감 11/20';
    else if (days === 0) dday.textContent = 'D-DAY · 오늘 18:00';
  }

  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });
})();
