# ÖN KAYIT — nonce 7, demo yeniden çekimi

> ## ✅ KESİNLEŞTİ: 2026-09-28 08:49:48 UTC · blok 11799423
> md5 kapısındaki **11 dosyanın 11'i** § 6 ile birebir aynı ölçüldü.
> Zincir durumu bu blokta yeniden okundu (§ 1 TARİHLİ EK).
> Beklenen digest iki bağımsız kaynakla yeniden doğrulandı (§ 4).
> **Bundan sonra bu dosya değiştirilmez; yalnız tarihli ek yazılır.**

**Yazıldı:** 27 Eylül 2026 · **Yazan:** Akif
**Şablon:** `docs/evidence/c-nonce6-prerecord.md` ile birebir aynı
**Plan maddesi:** `docs/handoff/2026-09-25-son-5-gun-plani.md:253-266` ("İkinci iş")

> **COMMIT + PUSH SONRASI BU DOSYA DEĞİŞTİRİLMEZ.**
> Sonrasında yalnız **TARİHLİ EK** yazılır; yukarısı silinmez, düzeltilmez.
> Değeri tam olarak bundan geliyor: beklentinin geriye dönük ayarlanmadığı,
> push zamanı ile blok zamanı karşılaştırılarak gösterilir.
>
> `pushed_at` **son** push'u gösterir; **tx'ten önce** oku, ham çıktıyı kanıta
> yaz. Sonraki push'ta kaybolur.

---

## 0. Neden bu koşu var

Demo videosu 27 Eylül'de frontend'in **görsel yenilemesi** yüzünden geçersiz
kaldı: md5 kapısındaki beş dosyadan `index.html` değişti
(`3b701338…` → `01969fe6…`). Devir notunun kuralı gereği
(`docs/handoff/2026-09-27-devir.md` § 2) video yeniden çekilir.

Yenileme aynı gün içinde üç turda yapıldı (koyu tema → lacivert + yerel
fontlar → statik bilgi bölümleri). **Ara turların md5'leri geçersizdir**;
kapı için geçerli olan tek değer § 6'daki son değerdir.

**Bu koşunun ölçüm değeri, video değerinden ayrıdır.** Alıcı ve parametreler
B satırının koşullarıyla **birebir aynı** seçildi, tek değişken nonce
(5 → 7). Yani koşu aynı zamanda gas modelinin **nonce farkını ikinci kez**
taşıyıp taşımadığını sınıyor.

---

## 1. PARAMETRELER

| alan | değer |
|---|---|
| PQWallet | `0x2EafA294C14b6752128bfd4f5873D1EA39f000BB` |
| `execute()` `to` | **`0x7268a7c3d52baa50486930e6ed25d29804d075b6`** |
| `execute()` `value` | `100000000000000` (0,0001 ETH) |
| `execute()` `data` | `0x` |
| `nonce` | **7** |
| chainId | `11155111` |

**Alıcı neden bu adres:** B satırının tahminlerini üreten adresin ta kendisi
(`crypto-tests/sprint4-recorded-demo-run.md:47`). Başka bir adres seçilseydi
adres baytları `z`'yi değiştirir ve karşılaştırma yapılamazdı — nonce 5
koşusunda aynı tuzak aynı yöntemle kapatılmıştı (`:128-133`).
**Kalan tek fark: nonce 5 → 7.**

### Alıcının durumu — ÖLÇÜLDÜ (blok 11793682 · 2026-09-27 13:38:48 UTC)

| kontrol | beklenen | **ölçülen** | |
|---|---|---|---|
| `cast balance` | > 0 | **`47235340130807312`** | ✓ var olan |
| `cast nonce` | > 0 | **8** | ✓ var olan |
| `cast code` | `0x` | **`0x`** | ✓ kod yok, EOA |
| ödeyen hesaptan farklı | ✓ | `0xe0BF2D19…B7351` ≠ `0x7268a7c3…` | ✓ |
| PQWallet'tan farklı | ✓ | `0x2EafA294…f000BB` ≠ `0x7268a7c3…` | ✓ |

**Alıcının bakiyesi nonce 5 koşusundan sonraki değerin birebir aynısı**
(`47235340130807312`, `:301`) — aradan üçüncü taraf işlemi **geçmemiş**.
Koşul B ile aynı: **sıcak + var olan**, boş hesap oluşturma bedeli YOK.

### PQWallet ön durumu — ÖLÇÜLDÜ (aynı blok)

| | |
|---|---|
| `nonce()` | **7** |
| bakiye | **50400000000000000** wei · 0,0504 ETH |
| ödeyen EOA bakiyesi | **46285709934898207** wei |
| `cast code <ödeyen EOA>` | **`0x`** — delegasyon yok |
| uç | `ethereum-sepolia-rpc.publicnode.com` |

### TARİHLİ EK — 28 Eylül 2026 08:49:48 UTC, blok 11799423

Kesinleştirme öncesi zincir yeniden okundu. **Bir değer değişti, üçü sabit:**

| kalem | 27 Eylül (blok 11793682) | **28 Eylül (blok 11799423)** | durum |
|---|---|---|---|
| PQWallet `nonce()` | 7 | **7** | ✓ sabit |
| PQWallet bakiyesi | `50400000000000000` | **`50400000000000000`** | ✓ sabit |
| alıcı `code` | `0x` | **`0x`** | ✓ sabit, hâlâ EOA |
| alıcı `nonce` | 8 | **8** | ✓ sabit |
| **alıcı bakiyesi** | `47235340130807312` | **`97235340130807312`** | ⚠️ **+50000000000000000 (+0,05 ETH)** |
| ödeyen EOA bakiyesi | `46285709934898207` | **`46285709934898207`** | ✓ sabit |

**DURDURMA KURALI TETİKLENMEDİ.** § 2 bu durumu zaten öngörmüştü: *"Alıcının
bakiyesi değiştiyse durdurma sebebi DEĞİLDİR (sıcak + var olan koşulu
bozulmaz), ama § 5'teki mutlak beklenti fark üzerinden doğrulanır ve durum
yazılır."* Adres hâlâ **sıcak + var olan**; gas modeli açısından koşul B ile
aynı, boş hesap oluşturma bedeli yok.

**ÇIKARIM:** araya üçüncü taraf bir transfer girdi (alıcı Hakan'ın EOA'sı,
başka işlerde de kullanılıyor). Bu, **§ 5'teki alıcı bakiyesi beklentisini
mutlak olmaktan çıkarır** — aşağıda düzeltildi.

### Ücret kontrolü — ÖLÇÜM (aynı blok)

| | |
|---|---|
| gas fiyatı | `1438812684` wei |
| tahmini ücret | `218721 × 1438812684` = **`314698549057164`** wei ≈ 0,000315 ETH |
| ödeyen bakiyesi | `46285709934898207` wei ≈ 0,0463 ETH |
| yeterli mi | **EVET** — ~147 katı marj |

PQWallet bakiyesi `0,0504 ETH`, gönderilecek `value` `0,0001 ETH`: yeterli.

---

## 2. 🛑 DURDURMA KURALLARI

> **TX'TEN HEMEN ÖNCE YENİDEN ÖLÇ:**
>
> ```bash
> cast call 0x2EafA294C14b6752128bfd4f5873D1EA39f000BB "nonce()(uint256)" --rpc-url https://ethereum-sepolia-rpc.publicnode.com
> cast balance 0x7268a7c3d52baa50486930e6ed25d29804d075b6 --rpc-url https://ethereum-sepolia-rpc.publicnode.com
> cast code    0x7268a7c3d52baa50486930e6ed25d29804d075b6 --rpc-url https://ethereum-sepolia-rpc.publicnode.com
> ```
>
> - `nonce()` **7 değilse → GÖNDERME, DUR.** Digest geçersizdir.
> - Alıcının `code` değeri `0x` **değilse → GÖNDERME, DUR.** Adres artık EOA
>   değil, koşul B olmaktan çıkmıştır.
> - Alıcının bakiyesi değiştiyse **durdurma sebebi DEĞİLDİR** (sıcak + var olan
>   koşulu bozulmaz), ama § 5'teki mutlak beklenti **fark** üzerinden
>   doğrulanır ve durum yazılır.
>
> **AYNI KURAL DIGEST İÇİN DE GEÇERLİ.** İmzalamadan sonra ekrandaki `digest`
> § 4'teki değerin **birebir aynısı** olmalı. Farklıysa **GÖNDERME, DUR.**

### Frontend kapısı — bu koşuya özel

Video bu beş dosyanın **kayıt anındaki hâlini** gösterir. Çekimden önce
beşinin md5'i § 6'daki değerlerle birebir aynı olmalı. Biri bile farklıysa
çekim ertelenir ve bu ön kayıt geçersiz olur.

---

## 3. GAS TAHMİNİ — TAHMİN, EŞİK YOK, SAPMA RAPORLANACAK

> ### ⚠ Bu bölüm bir BEKLENTİDİR, ölçüm değildir.
> **Eşik yok, "yaklaşık tuttu" denmeyecek.** Ölçülen `gasUsed` ne çıkarsa
> yazılır, tahminden farkı **olduğu gibi raporlanır**. Tutmazsa hipotez
> çürümüştür ve öyle yazılır — sayı yuvarlanmaz, terim uydurulmaz
> (`plans/2026-09-14-sprint4-demo-measurement-report.md:1099-1103`).

### Koşul karşılaştırması — B ile BİREBİR AYNI MI

| parametre | B (nonce 5) | bu koşu (nonce 7) | aynı mı |
|---|---|---|---|
| alıcı adresi | `0x7268a7c3…075b6` | `0x7268a7c3…075b6` | ✓ **aynı** |
| `value` | `100000000000000` | `100000000000000` | ✓ **aynı** |
| `data` | `0x` | `0x` | ✓ **aynı** |
| alıcı sıcak + var olan | ✓ | ✓ (§ 1'de ölçüldü) | ✓ **aynı** |
| PQWallet nonce yazımı | 5 → 6, SSTORE_RESET | 7 → 8, SSTORE_RESET | ✓ **aynı** |
| **nonce** | **5** | **7** | ✗ **TEK FARK** |

Nonce slotu iki koşuda da **sıfırdan farklı**, yani ikisi de `SSTORE_RESET`.
İlk nonce yazımının 17.100 gas'lık bedeli (`docs/handoff/2026-09-27-devir.md`
§ 4) burada **yok** — o yalnız `0 → 1` geçişine ait.

### Farkın tek taşıyıcısı: `z`

Nonce digest'i değiştirir → imza gövdesi değişir → calldata'daki **sıfır bayt
sayısı `z`** değişir. Yön ve büyüklük **bilinmiyor**; `z` tx'ten sonra
zincirden sayılacak.

### Tahminin kaynağı — ÖLÇÜM, dosya:satır

| değer | ne | kaynak |
|---|---|---|
| **218.781** | B satırının ters çözümü, taban (`z` = 205) | `crypto-tests/sprint4-recorded-demo-run.md:117-118` |
| **218.721** | nonce 5'te **ÖLÇÜLEN** `gasUsed` (`z` = 210) | aynı dosya **`:124-127`** |
| düzeltme katsayısı | **−12 gas / ek sıfır bayt** | `sprint4-gas-table-and-second-tx.md:1122`, `:1131` |
| `n` (calldata uzunluğu) | **3908** bayt | `c-nonce6-prerecord.md:250` |

### Beklenti

```
gasUsed_nonce7  =  218.781  −  12 · (z_ölçülen − 205)
```

| | değer | koşul |
|---|---|---|
| `z` = 210 çıkarsa | **218.721** | nonce 5 ile **birebir aynı sayı** |
| `z` başka çıkarsa | `218.781 − 12·(z − 205)` | `z` zincirden sayılacak |

> **`z` İMZADAN ÖNCE BİLİNEMEZ.** Sıfır bayt sayısı imza gövdesinden geliyor
> ve imza ancak tx hazırlanırken üretiliyor. Bu yüzden beklenti tek bir sayı
> DEĞİL, bir formüldür: `218.721 + 12 × (210 − z)`. Formül değişmedi, yeni
> sayı eklenmedi. `z` tx'ten sonra calldata'dan sayılacak.

**En bilgilendirici tek sonuç `z` = 210'dur:** o durumda nonce 5 → 7
geçişinde `z` hiç değişmemiş olur ve iki koşunun `gasUsed`'ı **eşit** çıkar.
Bu, gas modelinin nonce'a bağlı tek değişkeninin gerçekten `z` olduğunu
gösteren en temiz kanıt olur. **Ama beklenti bu değildir** — `z` imza
gövdesinden geliyor ve SPHINCS⁻ imzası nonce'la tamamen değişiyor; nonce 2 → 5
geçişinde `z` 205'ten 210'a çıkmıştı (+5). Tekrar değişmesi **normaldir**.

> **ŞERH:** `218.721` ile karşılaştırma ancak `z` uzlaştırıldıktan sonra
> "aynı koşul, aynı maliyet" diye yorumlanabilir. `z` farklı çıkarsa iki
> `gasUsed` doğrudan karşılaştırılmaz; formülün sapması raporlanır.

---

## 4. BEKLENEN DIGEST — hesaplandı ve iki kaynakla doğrulandı

Formül **dondurulmuş** (`CLAUDE.md`):

```
DOMAIN_SEPARATOR = keccak256(abi.encode(keccak256("PQSAFE_V1"), block.chainid, address(this)))
digest           = keccak256(abi.encode(DOMAIN_SEPARATOR, nonce, to, value, keccak256(data)))
```

### Sabitler — ÖLÇÜM

| | |
|---|---|
| `keccak256("PQSAFE_V1")` | `0x2b5183369e211b22c659fbb16b053826a633cf1ec619ff23c7c67552f9998548` |
| **DOMAIN_SEPARATOR** | **`0xa6238098b5d49d6e94eb134fa1e5ce7f888c5a9f870626079776fb42874c228b`** |
| `keccak256(0x)` | `0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470` |

DOMAIN_SEPARATOR nonce'a bağlı değil; nonce 5 ve nonce 6 ön kayıtlarındaki
değerle **birebir aynı** çıktı (`c-nonce6-prerecord.md:179`).

### Hesaplama komutu

```bash
cast keccak $(cast abi-encode "f(bytes32,uint256,address,uint256,bytes32)" \
  0xa6238098b5d49d6e94eb134fa1e5ce7f888c5a9f870626079776fb42874c228b \
  7 \
  0x7268a7c3d52baa50486930e6ed25d29804d075b6 \
  100000000000000 \
  0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470)
```

### İkinci, bağımsız kaynak — kontratın kendisi

```bash
cast call 0x2EafA294C14b6752128bfd4f5873D1EA39f000BB \
  "_computeDigest(address,uint256,bytes)(bytes32)" \
  0x7268a7c3d52baa50486930e6ed25d29804d075b6 100000000000000 0x \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

Kontrat MEVCUT on-chain nonce'u kendi okur — bu çağrı **nonce 7 geçerliyken**
doğru cevabı verir. Nonce değişmişse iki kaynak ayrışır, ki bu da başlı başına
bir uyarıdır.

### BEKLENEN DIGEST

```
0xa879c05a62212e28b373d4d31625a366ddc16676132389b1974051d348664e19
```

| | |
|---|---|
| elle `cast` ile hesaplanan | `0xa879c05a62212e28b373d4d31625a366ddc16676132389b1974051d348664e19` |
| kontratın `_computeDigest`'i | `0xa879c05a62212e28b373d4d31625a366ddc16676132389b1974051d348664e19` |
| **iki kaynak eşleşti mi** | **EVET** ✓ |
| hesaplandığı an | blok **11793682** · **2026-09-27 13:38:48 UTC** |

**İmzalamadan sonra ekranda bu değer görünmeli. Farklıysa DUR** (§ 2).

---

## 5. KESİN BEKLENTİLER — tahmin değil

Bunlar tutmazsa bir şey yanlış gitmiştir.

| kalem | ön kayıt |
|---|---|
| `nonce()` | **7 → 8** |
| PQWallet bakiyesi | `50400000000000000` → **`50300000000000000`** wei · 0,0503 ETH |
| alıcı bakiyesi | **fark ile doğrulanır: `+100000000000000`** (28 Eylül ölçümü `97235340130807312`; adres üçüncü taraf hareketine açık, mutlak değer bağlayıcı değil) |
| alıcı `nonce` | **8** kalır (alıcı bu tx'i göndermiyor) |
| alıcı `code` | **`0x`** kalır |
| `receipt.status` | **1** |
| tx tipi | **`0x2`** |
| tx `to` | **PQWallet** `0x2EafA294…f000BB` (`execute()`'un alıcısı değil) |
| `authorizationList` | **YOK** |
| `n` | **3908** |
| `cast code <ödeyen EOA>` (tx sonrası) | **`0x`** — delegasyon kurulmadı |

Gas **EOA'dan** ödenir, PQWallet'tan değil — cüzdanın bakiye düşüşü tam olarak
`value` kadar olmalı.

> **Alıcının mutlak değeri şartlı:** adres bir EOA ve üçüncü taraf etkisine
> açık. Araya işlem girerse mutlak değer tutmaz; doğrulama **fark** üzerinden
> yapılır (`+100000000000000`) ve durum yazılır. Bu, § 2'nin durdurma
> kuralını **tetiklemez** — sıcak + var olan koşulu bozulmaz.

### Ödeyen EOA bakiyesi yetiyor mu — ÖLÇÜM

```
ödeyen bakiyesi     = 46285709934898207 wei
nonce 5'te ödenen   =   553007484849726 wei  (218.721 × 2.528.369.406)
```

Gas fiyatı değişken; **yaklaşık iki büyüklük mertebesi marj var**, yetiyor.
Kesin sayı tx sonrası ölçülecek.

### §12'den devralınan ön koşullar (aynen geçerli)

1. Onay ekranında **"Added protection" İŞARETSİZ**
2. `Interacting with` satırı **PQWallet adresini** gösteriyor
3. "Account update" / "Smart account" / "Upgrade" ibaresi görülürse **Cancel**
4. *Account details → Smart account → Sepolia* şalteri **kapalı**

---

## 6. KAYIT ANINDAKİ BEŞ DOSYANIN md5'i

Videonun hangi koda ait olduğunu bağlayan kapı. **27 Eylül 2026'da ölçüldü.**

```
index.html                 a454d4b97c30177a1b7850a1c39d5ca1   ← DEĞİŞTİ (okunabilirlik + kum saati)
src/nav.js                 66605710d1d8be4c0e478e05a715ea4a   ← YENİ, kapıya eklendi
src/main.js                9cfc76918a54af4cdf8c59fa72a41f42   ← DEĞİŞTİ (dört class="busy", metinler aynı)
src/crypto/signer.js       80c314909283d7923ad0c6aa5c4c28a3   ← YENİ, kapıya eklendi (nextPaint)
src/tx/sendTransaction.js  250014298ea216e667344eca24c16984   ← sabit
src/crypto/digest.js       fd93a71edd1f27b664414195c0cbaf3f   ← sabit
src/tx/buildTransaction.js c4a061dedc27b7339738d2bc42eb3038   ← sabit
```

Ölçüm komutu (`frontend/` içinden):

```bash
md5 -q index.html src/main.js src/tx/sendTransaction.js src/crypto/digest.js src/tx/buildTransaction.js
```

### Yazı tipi dosyaları — kapıya EKLENDİ

Görsel katman artık iki yerel `woff2`'ye de bağlı. Bunlar değişirse sayfanın
görüntüsü değişir, yani videonun kapsamına girerler:

```
public/fonts/SchibstedGrotesk.woff2        309c3aae5d3a5fa8f6d5643ace4ac697
public/fonts/InstrumentSerif.woff2         8e5c3e2324b82fb27b827155cea48b94
public/fonts/InstrumentSerif-Italic.woff2  50d12a8bf343e266bc880bcb5ac55cf2
public/fonts/JetBrainsMono.woff2           0bf12397cb83ce4e9f4d52ad202f5ff0
```

```bash
md5 -q index.html src/nav.js public/fonts/*.woff2
```

**İmza yolunda değişiklik YOK.** `main.js`, `sendTransaction.js`, `digest.js`
ve `buildTransaction.js` nonce 5 ve nonce 6 koşularındaki değerlerle birebir
aynı — digest hesabı ve gönderim mantığı bu çekimde de hiç değişmedi.
Değişen yalnız görsel katman: `index.html` ve iki font dosyası.

### Lacivert temanın ölçülen yeşil tabanı (27 Eylül 2026)

| kontrol | sonuç |
|---|---|
| 30 seçici (24 id + 6 sınıf) | **HEPSİ BULUNDU** |
| `src/format-test.mjs` | **8** ✓ |
| `src/tx/build-transaction-test.mjs` | **21** ✓ |
| `src/tx/send-transaction-test.mjs` | **99** ✓ |
| `vite build` | 191 modül, **187 ms** |
| fontlar ağdan yükleniyor | `wOF2` imzası + `Content-Type: font/woff2` ✓ |
| `<html lang="tr">` | var — büyük harfte `i → İ` doğrulandı |

---

## 7. KAYITTAN SONRA

Ölçülen değerler `demo-run-sheet.md` § 4'ün şablonuna yazılır, karşılaştırma
bu dosyaya karşı yapılır.

**Commit sırası (kural):**

1. Bu dosya **commit + PUSH**
2. Push'un GitHub'a ulaştığı doğrulanır (`pushed_at`), ham çıktı kanıta yazılır
3. Tx atılır
4. Ölçüm sonuçları **ayrı** commit'le yazılır
5. Push saati ile blok saati karşılaştırılır — push **önde** olmalı

---

## DURUM

- [x] Alıcı belirlendi, **sıcak + var olan** olduğu ölçüldü (§ 1)
- [x] Koşulun B ile birebir aynı olduğu tablo hâlinde gösterildi (§ 3)
- [x] PQWallet ön durumu okundu: `nonce()` 7, bakiye `50400000000000000`
- [x] Beklenen digest hesaplandı, iki kaynak **eşleşti** (§ 4)
- [x] Kesin beklentiler yazıldı (§ 5)
- [x] Gas tahmini kaynağıyla yazıldı, **eşik yok** (§ 3)
- [x] Kayıt anındaki beş md5 yazıldı (§ 6)
- [ ] **Commit + PUSH** ← tek kalan
- [ ] `pushed_at` okundu ve kaydedildi
- [ ] Tx atıldı
