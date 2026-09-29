// C13 WASM signer'ı (contracts/lib/sphincs-minus/signer-wasm) tarayıcıya bağlayan
// ince katman. Kriptografik mantığın kendisi WASM tarafında (Rust) — burada
// sadece init + mnemonic üretimi var.

import init, { keygen_from_mnemonic, sign_from_mnemonic } from './wasm-pkg-web/sphincs_c13_signer.js';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { Buffer } from 'buffer';

// bip39 Node'un global Buffer'ını varsayıyor (browser field/ESM yok), tarayıcıda
// polyfill etmezsek "Buffer is not defined" ile patlıyor.
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

// C13 imza uzunluğu (bayt). Şemanın özelliği — bkz. CLAUDE.md, h=22 d=2 a=19 k=7 w=8.
export const C13_SIG_BYTES = 3688;

let initialized = false;

export async function ensureWasmInit() {
  if (!initialized) {
    await init();
    initialized = true;
  }
}

// 12 kelimelik (128-bit entropi) BIP-39 mnemonic üretir. Sadece anahtar
// türetmenin girdisi — WASM tarafındaki keygen_from_mnemonic aynı BIP-39
// standardını kullanarak sk_seed'i türetir (bkz. signer-wasm/src/keygen.rs).
export function generateNewMnemonic() {
  const mnemonic = generateMnemonic(128);
  if (!validateMnemonic(mnemonic)) {
    throw new Error('mnemonic üretimi başarısız (validateMnemonic false döndü)');
  }
  return mnemonic;
}

// Bir karelik cizim firsati bekleyen ust sinir (ms). rAF gelmezse islem bu
// sure sonunda yine baslar.
export const NEXT_PAINT_TIMEOUT_MS = 50;

// WASM cagrisi ana is parcacigini SENKRON bloke ediyor; hemen oncesinde
// tarayiciya bir cizim firsati verilmezse "Imzalaniyor..." gibi mesajlar hic
// gorunmeden bloklama basliyor. Kriptografik hicbir sey degismiyor, yalniz
// bir kare beklenip devam ediliyor.
//
// NEDEN YARIS: sekme gorunur degilken (arka planda ya da kucultulmus)
// tarayici requestAnimationFrame'i ATESLEMIYOR. Tek basina rAF beklenirse
// keygen ve signDigest hic baslamaz; ekranda "Uretiliyor..." / "Imzalaniyor..."
// sonsuza kadar kalir. Bu yuzden rAF ile NEXT_PAINT_TIMEOUT_MS'lik bir zaman
// asimi YARISIR: hangisi once biterse promise bir kez cozulur, kaybeden
// tarafin yaptigi tek sey no-op'tur. Gorunur sekmede kazanan rAF olur ve
// davranis eskisiyle ayni kalir; gizli sekmede zaman asimi devrali.
//
// Node'da requestAnimationFrame yok: guard bu yuzden var, testler etkilenmez.
//
// EXPORT NEDENI: yarisin iki ucu da ancak rAF taklidiyle olculebiliyor
// (`next-paint-test.mjs`). Uretimde bu fonksiyonu yalnizca asagidaki
// keygen/signDigest cagirir.
export async function nextPaint() {
  if (typeof requestAnimationFrame !== 'function') return;
  await new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    // rAF yolu: kare geldikten SONRA 0 ms daha beklenir, boylece cizim
    // gercekten yapilmis olur (eski davranisin ta kendisi).
    requestAnimationFrame(() => setTimeout(done, 0));
    setTimeout(done, NEXT_PAINT_TIMEOUT_MS);
  });
}

export async function keygen(mnemonic, passphrase = '') {
  await ensureWasmInit();
  await nextPaint();
  const json = keygen_from_mnemonic(mnemonic, passphrase);
  const { seed, root, ecdsa_address } = JSON.parse(json);
  return {
    pkSeed: seed,
    pkRoot: root,
    ecdsaAddress: ecdsa_address,
    publicKey: '0x' + seed.replace(/^0x/, '') + root.replace(/^0x/, ''),
  };
}

export async function signDigest(mnemonic, digestHex, passphrase = '') {
  await ensureWasmInit();
  await nextPaint();
  const signature = sign_from_mnemonic(mnemonic, passphrase, digestHex);
  const sigBytes = (signature.length - 2) / 2;
  return { signature, sigBytes };
}
