// Deneme anahtarının 12 kelimesini İSTEK ÜZERİNE gösterir, dört durumda
// DOM'dan siler: "Gizle", 30 sn dolması, yeniden üretim, owner anahtarının
// içe aktarılması.
//
// NEDEN AYRI MODÜL: `main.js` içe aktarıldığı anda `document` istiyor, bu
// yüzden Node'da koşamıyor; jsdom da kurulu değil. Mantık buraya çıkınca
// element ve zamanlayıcı ENJEKTE edilebiliyor ve dört durum gerçek bir
// assertion'la sınanabiliyor (`mnemonic-reveal-test.mjs`).
//
// SINIRI: bu modülün testi modülün mantığını kanıtlar, `main.js`'teki
// BAĞLAMAYI kanıtlamaz (hangi butona bağlandığı, içe aktarmanın kapattığı).
// Bağlama yalnız tarayıcıda görülür.
//
// Varsayılan hâl: kelimeler DOM'da YOKTUR. Bulanık metin, nokta maskesi ya da
// kısaltma da yazılmaz — maskenin uzunluğu bile bilgi sızdırır (aynı gerekçe:
// main.js keygen çıktısındaki yorum).

export const AUTO_HIDE_MS = 30_000;

const defaultTimers = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};

// `box`    — kabuk (buton + ızgara). Kapalıyken `hidden`.
// `button` — Göster/Gizle. Metnini bu modül yazar.
// `list`   — kelimelerin kabı. İçine YALNIZ bu modül yazar.
// `doc`    — `createElement` için; testte taklit edilir.
export function createMnemonicReveal({
  box,
  button,
  list,
  doc,
  warningText,
  autoHideMs = AUTO_HIDE_MS,
  timers = defaultTimers,
}) {
  let timer = null;
  let visible = false;

  function clearWords() {
    // SİLME SATIRI. Kelimeler DOM'dan burada kalkar; bu satır kalkarsa
    // `mnemonic-reveal-test.mjs`'in gizle/30 sn/yeniden üret testleri kırılır.
    list.replaceChildren();
  }

  function stopTimer() {
    if (timer !== null) {
      timers.clearTimeout(timer);
      timer = null;
    }
  }

  function hide() {
    // Sıra önemli: önce zamanlayıcı düşer. Düşmezse gizlemeden sonra ateşleyen
    // bir geri çağırma, o sırada başka bir şey yazmış olan alanı ezebilir.
    stopTimer();
    clearWords();
    visible = false;
    button.textContent = 'Göster';
  }

  function show(mnemonic) {
    const words = String(mnemonic ?? '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      // Gösterilecek anahtar yok. Boş bir ızgara açmak yerine kapalı kalır.
      hide();
      return;
    }

    const nodes = [];
    const warning = doc.createElement('p');
    warning.className = 'warn';
    warning.textContent = warningText;
    nodes.push(warning);

    words.forEach((word, i) => {
      const item = doc.createElement('span');
      item.className = 'w';
      item.textContent = `${i + 1} ${word}`;
      nodes.push(item);
    });

    list.replaceChildren(...nodes);
    visible = true;
    button.textContent = 'Gizle';
    stopTimer();
    timer = timers.setTimeout(hide, autoHideMs);
  }

  function toggle(mnemonic) {
    if (visible) hide();
    else show(mnemonic);
  }

  // Yüzeyin kendisini açar/kapatır. `false` yalnız kabuğu gizlemez, kelimeleri
  // de siler ve zamanlayıcıyı düşürür — içe aktarma bunu çağırır.
  function setAvailable(available) {
    hide();
    box.hidden = !available;
  }

  return { show, hide, toggle, setAvailable, isVisible: () => visible };
}
