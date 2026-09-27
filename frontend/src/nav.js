// Sayfa içi gezinme: yumuşak kaydırma, aktif bölüm vurgusu, ilerleme çizgisi,
// dar ekranda menü.
//
// main.js'ten TAMAMEN BAĞIMSIZ: onu import etmez, onun hiçbir id'sine
// dokunmaz, çıktı kutularına yazmaz. index.html'de ayrı bir <script type=
// "module"> ile yüklenir. Tamamı try/catch içinde — burada bir şey patlarsa
// sayfanın demo akışı etkilenmemeli, panel çalışmaya devam etmeli.

try {
  const bar = document.querySelector('.top');
  const menuBtn = document.querySelector('.menu-btn');
  const links = Array.from(document.querySelectorAll('.links a, .rail a'));

  // Kaydırma hedefleri: üst bardaki altı bölüm + panelin dört adımı.
  const sectionIds = ['tehdit', 'urun', 'surec', 'panel', 'sonuc', 'sss'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sabit barın altına 12px boşluk bırakarak hedefe kaydır. Bar yüksekliği
  // her çağrıda yeniden okunuyor: dar ekranda menü açılınca bar büyüyor.
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = (bar ? bar.offsetHeight : 0) + 12;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: reduceMotion ? 'instant' : 'smooth' });
    closeMenu();
  };

  const closeMenu = () => {
    if (!bar) return;
    bar.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  };

  // Tek dinleyici, delegasyonla. Yalnızca sayfada KARŞILIĞI OLAN çapaları
  // ele geçirir; dış bağlantılar ve bilinmeyen hedefler tarayıcıya bırakılır.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    scrollToId(id);
  });

  if (menuBtn && bar) {
    menuBtn.addEventListener('click', () => {
      const open = bar.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const progress = document.querySelector('.progress i');

  // Aktif bölüm: viewport'un üst %30 çizgisini geçmiş SON bölüm.
  const spy = () => {
    const line = (bar ? bar.offsetHeight : 0) + window.innerHeight * 0.3;
    let current = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) current = s.id;
    }
    for (const a of links) {
      const target = a.getAttribute('href');
      a.classList.toggle('active', !!current && target === '#' + current);
    }
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h) : 0);
    }
  };

  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();
} catch (err) {
  // Gezinme süsü; demo akışını düşürmesin.
  console.warn('[nav] devre dışı:', err);
}
