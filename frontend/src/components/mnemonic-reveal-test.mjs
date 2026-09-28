// mnemonicReveal.js — dört silme durumunun testi.
//
// DOM taklidi ELLE yazıldı: jsdom kurulu değil ve kod donmadan önce yeni
// bağımlılık eklenmiyor. Taklit yalnız modülün kullandığı yüzeyi taşıyor —
// `createElement`, `className`, `textContent`, `hidden`, `replaceChildren`.
//
// BU TESTİN SINIRI: modülün mantığını kanıtlar, `main.js`'teki bağlamayı
// (butonun hangi değişkeni okuduğu, içe aktarmanın yüzeyi kapattığı)
// kanıtlamaz. O yalnız tarayıcıda görülür — elle kontrol listesine bakın.

import { createMnemonicReveal, AUTO_HIDE_MS } from './mnemonicReveal.js';

// Gerçek bir anahtar DEĞİL: BIP-39 listesinin ilk kelimeleri, yalnız sayma ve
// sızıntı taraması için.
const WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident',
];
const MNEMONIC = WORDS.join(' ');

let failures = 0;

function check(name, actual, expected) {
  if (actual === expected) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}\n    beklenen: ${expected}\n    gelen   : ${actual}`);
  }
}

// ── DOM taklidi ─────────────────────────────────────────────────────────────
function makeEl(tag = 'div') {
  return {
    tag,
    className: '',
    textContent: '',
    hidden: false,
    children: [],
    replaceChildren(...nodes) {
      this.children = nodes;
    },
  };
}

const doc = { createElement: (tag) => makeEl(tag) };

function makeTimers() {
  const pending = new Map();
  let next = 1;
  return {
    setTimeout(fn, ms) {
      const id = next++;
      pending.set(id, { fn, ms });
      return id;
    },
    clearTimeout(id) {
      pending.delete(id);
    },
    pendingCount: () => pending.size,
    lastDelay: () => [...pending.values()].map((t) => t.ms).pop(),
    fireAll() {
      const jobs = [...pending.values()];
      pending.clear();
      jobs.forEach((t) => t.fn());
    },
  };
}

function setup() {
  const box = makeEl('div');
  const button = makeEl('button');
  const list = makeEl('div');
  const timers = makeTimers();
  const reveal = createMnemonicReveal({
    box,
    button,
    list,
    doc,
    warningText: 'Deneme anahtarı: bu kelimeleri gerçek varlık için kullanmayın.',
    timers,
  });
  return { box, button, list, timers, reveal };
}

// DOM'daki kelime sayısı: yalnız kelime düğümleri sayılır, uyarı satırı değil.
const wordCount = (list) => list.children.filter((n) => n.className === 'w').length;
// Sızıntı taraması: kaptaki TÜM metin. Kelime burada geçiyorsa DOM'dadır.
const domText = (list) => list.children.map((n) => n.textContent).join(' ');
const leakedWords = (list) => WORDS.filter((w) => domText(list).includes(w)).length;

console.log('=== mnemonicReveal — göster/gizle ve dört silme durumu ===\n');

console.log('--- Durum 0: varsayılan, hiç gösterilmedi ---');
{
  const { list, button } = setup();
  check('kelime yok', wordCount(list), 0);
  check('metin boş', domText(list), '');
  check('buton metnine dokunulmadı', button.textContent, '');
}

console.log('\n--- Durum 1: Göster ---');
{
  const { list, button, timers, reveal } = setup();
  reveal.show(MNEMONIC);
  check("DOM'da 12 kelime", wordCount(list), 12);
  check('12 kelimenin hepsi metinde', leakedWords(list), 12);
  check('uyarı satırı ilk düğüm', list.children[0].className, 'warn');
  check('uyarı metni yazıldı', list.children[0].textContent.startsWith('Deneme anahtarı'), true);
  check('1. kelime numaralı', list.children[1].textContent, '1 abandon');
  check('12. kelime numaralı', list.children[12].textContent, '12 accident');
  check('buton "Gizle" oldu', button.textContent, 'Gizle');
  check('zamanlayıcı kuruldu', timers.pendingCount(), 1);
  check('gecikme 30.000 ms', timers.lastDelay(), AUTO_HIDE_MS);
  check('isVisible true', reveal.isVisible(), true);
}

console.log('\n--- Silme 1: "Gizle" ---');
{
  const { list, button, timers, reveal } = setup();
  reveal.show(MNEMONIC);
  reveal.hide();
  check('0 kelime', wordCount(list), 0);
  check('hiçbir kelime metinde yok', leakedWords(list), 0);
  check('buton "Göster" oldu', button.textContent, 'Göster');
  check('zamanlayıcı düştü', timers.pendingCount(), 0);
  check('isVisible false', reveal.isVisible(), false);
  // Gizlemeden sonra ateşleyen bir geri çağırma kalmamalı: kalsaydı kullanıcı
  // tekrar göstermişken 30 sn'yi eski zamanlayıcı kapatırdı.
  timers.fireAll();
  check('geç ateşleyen zamanlayıcı yok', wordCount(list), 0);
}

console.log('\n--- Silme 2: 30 sn doldu ---');
{
  const { list, button, timers, reveal } = setup();
  reveal.show(MNEMONIC);
  check('süre dolmadan 12 kelime', wordCount(list), 12);
  timers.fireAll();
  check('0 kelime', wordCount(list), 0);
  check('hiçbir kelime metinde yok', leakedWords(list), 0);
  check('buton "Göster" oldu', button.textContent, 'Göster');
}

console.log('\n--- Silme 3: yeniden "Yeni çift üret" ---');
{
  const { list, box, reveal } = setup();
  reveal.show(MNEMONIC);
  // main.js üretime başlarken önce yüzeyi kapatır, sonra başarılıysa açar.
  reveal.setAvailable(false);
  reveal.setAvailable(true);
  check('0 kelime', wordCount(list), 0);
  check('hiçbir kelime metinde yok', leakedWords(list), 0);
  check('kap yeniden açık', box.hidden, false);
}

console.log('\n--- Silme 4: owner anahtarı içe aktarıldı ---');
{
  const { list, box, timers, reveal } = setup();
  reveal.show(MNEMONIC);
  reveal.setAvailable(false);
  check('0 kelime', wordCount(list), 0);
  check('hiçbir kelime metinde yok', leakedWords(list), 0);
  check('Göster butonu görünmüyor (kap hidden)', box.hidden, true);
  check('zamanlayıcı düştü', timers.pendingCount(), 0);
  // Yüzey kapalıyken toggle çağrılsa bile kelime yazılmamalı: main.js
  // butonu gizliyor, ama koruma tek bir görünürlük bayrağına bırakılmıyor —
  // main.js `trialMnemonic`'i null'a çektiği için gösterilecek değer de yok.
  reveal.toggle(null);
  check('kapalıyken toggle kelime yazmadı', wordCount(list), 0);
}

console.log('\n--- toggle: iki basış ---');
{
  const { list, reveal } = setup();
  reveal.toggle(MNEMONIC);
  check('birinci basış → 12 kelime', wordCount(list), 12);
  reveal.toggle(MNEMONIC);
  check('ikinci basış → 0 kelime', wordCount(list), 0);
}

console.log('\n--- Boş/eksik mnemonic ---');
{
  const { list, button, reveal } = setup();
  reveal.show(null);
  check('null → 0 kelime', wordCount(list), 0);
  check('null → buton "Göster"', button.textContent, 'Göster');
  reveal.show('   ');
  check('boşluk → 0 kelime', wordCount(list), 0);
  check('boşluk → isVisible false', reveal.isVisible(), false);
}

console.log(failures === 0 ? '\nTÜM TESTLER GEÇTİ' : `\n${failures} TEST BAŞARISIZ`);
process.exit(failures === 0 ? 0 : 1);
