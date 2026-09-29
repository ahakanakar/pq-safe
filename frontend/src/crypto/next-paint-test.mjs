// nextPaint yarisinin testi — signer.js'teki fonksiyonun TA KENDISI kosulur.
//
// NEDEN BU TEST VAR: sekme gorunur degilken tarayici requestAnimationFrame'i
// atesletmiyor. Eski nextPaint yalniz rAF bekliyordu, bu yuzden gizli sekmede
// keygen/signDigest HIC baslamiyordu. Duzeltme rAF ile bir zaman asimini
// yaristiriyor; asagidaki iki durum yarisin iki ucunu da olcuyor.
//
// WASM KOSMAZ: bu dosya signer.js'i ice aktarir ama yalniz nextPaint'i cagirir.
// ensureWasmInit, keygen ve signDigest cagrilmaz — WASM hic baslatilmaz.
//
// rAF GLOBAL'DEN OKUNUR: signer.js `requestAnimationFrame`e ciplak isimle
// bakiyor, yani cagri aninda globalThis'ten cozuluyor. Taklit bu yuzden
// globalThis'e yazilarak enjekte edilebiliyor; Node'da bu isim bastan yoktur.

import { nextPaint, NEXT_PAINT_TIMEOUT_MS } from './signer.js';

let failures = 0;

function ok(name, cond, detay = '') {
  if (cond) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}${detay ? `\n    ${detay}` : ''}`);
  }
}

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

function rafTakliginiKaldir() {
  delete globalThis.requestAnimationFrame;
}

console.log('=== nextPaint: rAF ile zaman asimi yarisi ===\n');
console.log(`NEXT_PAINT_TIMEOUT_MS = ${NEXT_PAINT_TIMEOUT_MS}\n`);

ok('NEXT_PAINT_TIMEOUT_MS export edildi ve 50', NEXT_PAINT_TIMEOUT_MS === 50,
  `gelen: ${NEXT_PAINT_TIMEOUT_MS}`);

// ── Durum 0: Node guard ─────────────────────────────────────────────────────
// rAF adi hic tanimli degilken nextPaint zaman asimini BEKLEMEDEN doner.
// Guard kalkarsa bu durum, Node'da kosan her testi 50 ms yavaslatirdi.
console.log('\n--- Durum 0: requestAnimationFrame yok (Node) ---');
{
  rafTakliginiKaldir();
  const t0 = Date.now();
  await nextPaint();
  const gecen = Date.now() - t0;
  ok('rAF yokken beklemeden cozuldu', gecen < 10, `gecen: ${gecen} ms`);
}

// ── Durum A: rAF HIC ateslemiyor (gizli sekme) ──────────────────────────────
// Gercek hatanin taklidi. Yaris olmasaydi bu await sonsuza kadar asili kalir,
// test timeout'a duserdi.
console.log('\n--- Durum A: rAF hic ateslemiyor (gizli sekme) ---');
{
  let rafCagrisi = 0;
  globalThis.requestAnimationFrame = () => { rafCagrisi++; /* hic atesleme */ };

  const t0 = Date.now();
  let cozuldu = false;
  const p = nextPaint().then(() => { cozuldu = true; });

  await bekle(Math.floor(NEXT_PAINT_TIMEOUT_MS / 2));
  ok('zaman asimi dolmadan HENUZ cozulmedi', cozuldu === false,
    `${Math.floor(NEXT_PAINT_TIMEOUT_MS / 2)} ms'de cozuldu = ${cozuldu}`);

  // BEKCI: yaris kalkarsa bu promise HIC cozulmez. Bekci olmadan `await p`
  // sessizce asili kalir ve Node testi ✗ basmadan terk eder; hatanin adi
  // ekranda gorunmez. Bekci, asili kalmayi kirmizi bir assertion'a cevirir.
  const sonuc = await Promise.race([
    p.then(() => 'cozuldu'),
    bekle(NEXT_PAINT_TIMEOUT_MS + 450).then(() => 'ASILI KALDI'),
  ]);
  const gecen = Date.now() - t0;
  ok('rAF hic ateslemese de cozuldu', sonuc === 'cozuldu' && cozuldu === true,
    `sonuc: ${sonuc} (bekci ${NEXT_PAINT_TIMEOUT_MS + 450} ms)`);
  ok('rAF gercekten cagrildi (rAF yolu atilmadi)', rafCagrisi === 1,
    `cagri: ${rafCagrisi}`);
  ok('sure zaman asimi kadar bekledi', gecen >= NEXT_PAINT_TIMEOUT_MS - 5,
    `gecen: ${gecen} ms, alt sinir: ${NEXT_PAINT_TIMEOUT_MS - 5} ms`);
  ok('sure zaman asimi + pay icinde kaldi', gecen < NEXT_PAINT_TIMEOUT_MS + 450,
    `gecen: ${gecen} ms, ust sinir: ${NEXT_PAINT_TIMEOUT_MS + 450} ms`);

  rafTakliginiKaldir();
}

// ── Durum B: rAF hemen atesliyor (gorunur sekme) ────────────────────────────
// Gorunur sekmede kazanan rAF olmali: cozulme zaman asimini BEKLEMEDEN gelir.
// Sonra kaybeden zaman asimi da atesler; cozulmenin bir kez gozlendigi ve
// kaybedenin sessiz kaldigi olculur.
console.log('\n--- Durum B: rAF hemen atesliyor (gorunur sekme) ---');
{
  let rafCagrisi = 0;
  globalThis.requestAnimationFrame = (cb) => { rafCagrisi++; cb(); };

  let cozulmeSayisi = 0;
  const t0 = Date.now();
  await nextPaint().then(() => { cozulmeSayisi++; });
  const gecen = Date.now() - t0;

  ok('rAF hemen ateslerken cozuldu', cozulmeSayisi === 1,
    `cozulme: ${cozulmeSayisi}`);
  ok('kazanan rAF: zaman asimi beklenmedi', gecen < NEXT_PAINT_TIMEOUT_MS / 2,
    `gecen: ${gecen} ms, ust sinir: ${NEXT_PAINT_TIMEOUT_MS / 2} ms`);

  // Kaybeden zaman asiminin ateslemesini bekle. Kaybeden taraf bir istisna
  // atsaydi Node yakalanmayan hatayla duserdi, yani bu bekleme onu da olcer.
  await bekle(NEXT_PAINT_TIMEOUT_MS + 60);
  ok('kaybeden zaman asimi atesledikten sonra cozulme hala bir kez gozlendi',
    cozulmeSayisi === 1, `cozulme: ${cozulmeSayisi}`);
  ok('rAF tek kez cagrildi', rafCagrisi === 1, `cagri: ${rafCagrisi}`);

  rafTakliginiKaldir();
}

// SINIR, OLCULDU (29 Eylul 2026). Yukaridaki "cozulme hala bir kez gozlendi"
// assertion'i `settled` guard'ini KANITLAMIYOR. Guard scratchpad kopyasinda
// kaldirilip test yeniden kosuldu: 11 assertion YESIL kaldi. Sebep, promise'in
// idempotent olmasi — ikinci resolve cagrisi disaridan gozlenemez. Yani tek
// cozulmeyi saglayan sey guard degil promise semantigidir; guard kaybedenin
// bosa is yapmasini engelleyen ACIK bir ifadedir, testin agina girmez.
// Testin gercekten korudugu satir yaristir: o kaldirilinca Durum A kirmizi
// yanar (2 assertion, "ASILI KALDI").

console.log(failures === 0 ? '\nTÜM TESTLER GEÇTİ' : `\n${failures} TEST BAŞARISIZ`);
process.exit(failures === 0 ? 0 : 1);
