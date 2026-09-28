# PQ-SAFE — Ethereum üzerinde kuantum-güvenli akıllı kontrat cüzdanı

**Durum:** İSKELET (R1, 28 Eylül 2026). Bölüm gövdeleri R2'de yazılacak.
**Şablon:** henüz yok. Kurumsal şablon/şartname geldiğinde bu başlıklar
şablonun başlıklarına taşınır; bölüm→kanıt haritası korunur.

## Bu belgenin kuralları

1. **Yeni sayı yok.** Rapordaki her sayı bir depo dosyasına `dosya:satır`
   ile dayanır. Dayanağı olmayan sayı yazılmaz.
2. **Her iddia etiketli:** **ÖLÇÜM** (gözlendi/okundu) · **HESAP** (ölçülen
   sayılardan aritmetikle çıktı) · **ÇIKARIM** (modele veya spec sabitine
   dayanıyor, doğrudan ölçülmedi).
3. **Hipotez rapora girmez.** Sebebi ölçülmemiş açıklamalar "ölçülmedi"
   diye yazılır, tahminle kapatılmaz.
4. **Sınır, sonucun yanında durur.** Bir ölçümün koşulu ve geçerlilik
   sınırı sayıdan ayrı bir bölüme sürülmez.

---

## Bölüm haritası ve bütçe

| # | Bölüm | Sahibi | Bütçe |
|---|---|---|---|
| 0 | Yönetici özeti | Akif | ~25 satır |
| 1 | Problem ve tehdit | Akif | ~45 |
| 2 | Çözüm ve mimari | **Hakan** | ~70 |
| 3 | SPHINCS-/C13 seçimi ve bedeli | Akif | ~70 |
| 4 | Ölçüm yöntemi | Akif | ~55 |
| 5 | Sonuçlar | Akif | ~110 |
| 6 | Nonce 7 canlı demosu | Akif | ~15 → ~60 |
| 7 | Tekrar üretilebilirlik | Akif | ~45 |
| 8 | Sınırlar ve açık kalemler | Akif | ~70 |
| 9 | Güvenlik notları | Akif | ~55 |
| — | Kaynakça | Akif | ~12 |
| A | Ek A — kanıt dizini | Akif | ~45 |

Toplam ≈ 605 satır. **Şablon sınırı gelmeden bağlayıcı değil.**

---

## 0. Yönetici özeti

**Amaç:** jürinin ne inşa edildiğini, üç ölçülmüş sayıyı ve en önemli sınırı
30 saniyede görmesi.

**Sahibi:** Akif · **Bütçe:** ~25 satır

**Üç sayı (R2'de gövdeye geçecek):**

| sayı | ne | etiket | dayanak |
|---|---|---|---|
| **106.672 gas** | C13 doğrulayıcısının çıplak referans maliyeti | ÖLÇÜM | `docs/evidence/gas-reports/sprint0-c13-verifier-gas.md` · `CLAUDE.md` |
| **216.269 gas** | `PQWallet.execute()` kalıcı rejimde, uçtan uca gerçek tx (sıcak + var olan alıcı) | ÖLÇÜM | `docs/evidence/crypto-tests/sprint4-gas-table-and-second-tx.md:1547` |
| **3.688 bayt** | bir C13 imzasının boyutu | ÖLÇÜM | `docs/ARCHITECTURE.md:65,81` · `docs/FRONTEND-KURULUM.md:178-181` |

**Tek cümlelik sınır:** C13 resmi FIPS 205 setlerinden biri değil, aynı
ailenin bir araştırma varyantıdır (ePrint 2025/2203) ve standart setler
kadar incelenmemiştir — bu, maliyet lehine bilinçli olarak verilmiş bir
ödündür.

**Kaynak (özet paragrafı için):** `docs/RAPOR_HAM_ICERIK.md:12-23`

> YAZILACAK — R2

---

## 1. Problem ve tehdit

**Amaç:** ECDSA'nın kuantum bir saldırgan karşısında neden düştüğünü, hash
tabanlı imzanın neden ayakta kaldığını ve ikisi arasındaki farkın neden
*derece* değil *tür* farkı olduğunu göstermek.

**Sahibi:** Akif · **Bütçe:** ~45 satır

**Dayanaklar — literatür (bkz. Kaynakça):**

- Shor'un algoritması ayrık logaritmayı polinom zamanda çözer → secp256k1
  açık anahtarından özel anahtar hesaplanabilir. → **Kaynakça [1]**
- Ethereum'da açık anahtar zaten imzadan kurtarılabilir (`ECRECOVER`), yani
  bir kez işlem yapmış her hesabın açık anahtarı fiilen açıktır.
  → **Kaynakça [3]**
- Grover'ın algoritması hash fonksiyonlarına karşı yalnızca karekök
  hızlanma verir; hash tabanlı imzalar bu yüzden parametre büyütmeyle
  savunulabilir. → **Kaynakça [2]**
- NIST'in standartlaştırdığı hash tabanlı imza ailesi (SLH-DSA) bu
  yaklaşımın resmî hâlidir. → **Kaynakça [4]**

> **NOT — R2 için.** Bu bölüm literatüre dayanır, projenin tanıtım
> sayfasına değil. `frontend/index.html`'den alıntı yapılmaz.

> YAZILACAK — R2

---

## 2. Çözüm ve mimari

**Amaç:** `PQWallet` + `Migration` + `SPHINCSVerifier` + WASM imzalayıcının
nasıl tek bir "eski cüzdanını kanıtla → kuantum-güvenli cüzdana geç"
akışına bağlandığını anlatmak.

**Sahibi:** **HAKAN** · **Bütçe:** ~70 satır

**Kanıt listesi:**

| konu | dayanak |
|---|---|
| Ne inşa edildi (jüriye 1 paragraf) | `docs/RAPOR_HAM_ICERIK.md:12-23` |
| Yetkilendirme modeli (`msg.sender`'a bakmıyor, relayer'a açık, ERC-4337 değil) | `docs/RAPOR_HAM_ICERIK.md:27-31` |
| Replay koruması — nonce, `nonce++` dış çağrıdan önce | `docs/RAPOR_HAM_ICERIK.md:32-36` · `contracts/src/PQWallet.sol:42-44` |
| Digest formülü (dondurulmuş) | `docs/RAPOR_HAM_ICERIK.md:37-43` · `docs/GOREV_SINIRLARI.md:144-171` |
| Migration tasarımı, `personal_sign` / EIP-191 | `docs/RAPOR_HAM_ICERIK.md:44-48` |
| `IPQVerifier`'ın şemadan bağımsızlığı — şema değişti, kontratlar değişmedi | `docs/RAPOR_HAM_ICERIK.md:49-53` · `docs/INTERFACE.md` |
| Genel-amaçlı `call`, hedef kısıtlaması yok | `docs/RAPOR_HAM_ICERIK.md:54-56` |
| Uç durum testleri (jüri sorularına hazır cevaplar) | `docs/RAPOR_HAM_ICERIK.md:58-70` |
| Genel akış şeması | `docs/ARCHITECTURE.md:16-53` |

> **HAKAN YAZACAK.**
>
> Ham malzeme `docs/RAPOR_HAM_ICERIK.md`'de hazır. Task 11 Adım 3 uyarınca bu
> bölüm **yerleştirilir, redakte edilmez**; redaksiyon ayrı bir turda yapılır.

---

## 3. SPHINCS-/C13 seçimi ve bedeli

**Amaç:** neden resmî FIPS 205 seti değil de bir araştırma varyantı
seçildiğini, bunun ölçülmüş kazancını ve ödenen bedeli açıkça yazmak.

**Sahibi:** Akif · **Bütçe:** ~70 satır

**Dayanaklar:**

| konu | etiket | dayanak |
|---|---|---|
| C13 nedir, parametreler `h=22 d=2 a=19 k=7 w=8` | — | `docs/ARCHITECTURE.md:54-75` |
| C13 doğrulayıcı maliyeti **106.672 gas** | ÖLÇÜM | `docs/evidence/gas-reports/sprint0-c13-verifier-gas.md` |
| Eski hedef SLH-DSA-SHA2-128-24 maliyeti (ölçülen aralığın en düşüğü) | ÖLÇÜM | `docs/evidence/gas-reports/sprint0-reference-verifier-gas.md` |
| Sarmalayıcımızın maliyeti **111.074 gas**, çıplak referansın ~%4 üzerinde | ÖLÇÜM | `docs/evidence/gas-reports/sprint1-sphincsverifier-wrapper-gas.md:67` · `docs/DECISIONS.md:323` |
| İmza boyutu **3.688 bayt** | ÖLÇÜM | `docs/ARCHITECTURE.md:65,81` · `docs/FRONTEND-KURULUM.md:178-181` |
| Şema değişikliği kararı ve onayı (19 Ağustos 2026) | — | `docs/DECISIONS.md` |
| `@noble/post-quantum` neden kullanılamadı (FIPS 205 setleri dışına çıkmıyor) | ÖLÇÜM | `docs/evidence/crypto-tests/sprint0-noble-post-quantum-risk-test.md` |
| **Bedel:** güvenlik incelemesi bulguları C13-X-f2 (~2^133 iş), C13-X-f3 (reuse direnci ispatlanmamış) | — | `docs/ARCHITECTURE.md:110-143` |
| İnceleme bağımsız profesyonel denetim **değil**, en iyi çaba mühendislik incelemesi | — | `docs/ARCHITECTURE.md:112-115` |

> **DİKKAT — R2 için.** `frontend/index.html:1144` imza boyutlarını **ters**
> yazmış ("3.688 bayt yerine 3.856 bayt"). Doğrusu: C13 = 3.688 bayt, eski
> SLH-DSA referansı = 3.856 bayt (`docs/evidence/gas-reports/sprint0-reference-verifier-gas.md:30`).
> Rapor sayfadan kopyalamaz. Sayfanın düzeltilmesi ayrı bir iş.

> YAZILACAK — R2

---

## 4. Ölçüm yöntemi

**Amaç:** bu raporun sayılarının neden tahmin değil ölçüm olduğunu
gösterecek yöntemi anlatmak: beklenti işlemden **önce** yazılıp
zincire çivilendi.

**Sahibi:** Akif · **Bütçe:** ~55 satır

**Yöntem zinciri:** ön kayıt yazılır → commit + push → `pushed_at` okunur
(tx'ten önce) → tx gönderilir → sonuç ön kayda **tarihli ek** olarak
yazılır, ön kaydın kendisi değiştirilmez.

**Dayanaklar:**

| konu | dayanak |
|---|---|
| Ön kayıt örneği (nonce 7), kesinleşme damgası ve blok | `docs/evidence/demo-nonce7-prerecord.md` |
| Ön kayıt örneği (nonce 5, B satırı) | `docs/evidence/demo-nonce5-prerecord.md` |
| Ön kayıt örneği (nonce 6, C satırı) | `docs/evidence/c-nonce6-prerecord.md` |
| Ön kayıtlı `gasUsed` formülü `216.305 − 12·(z − 203)` | `docs/evidence/crypto-tests/sprint4-gas-table-and-second-tx.md:1005,1214` |
| Ön kayıt koşullarının tx'ten önce sağlanması | aynı dosya `:1359` |
| Belirsizlikte tahmin yasağı ("emin değilsen sor", stub kuralı) | `docs/GOREV_SINIRLARI.md:206-225` |
| "Bitti" tanımı — çalışıyor + kanıtı var + commit'li | `docs/GOREV_SINIRLARI.md:226-241` |
| Kabul edilen kanıt türleri (gas ölçümü = `forge test --gas-report`) | `docs/GOREV_SINIRLARI.md:234-241` |

> **AÇIK — belgelenmemiş kural.** **ÖLÇÜM / HESAP / ÇIKARIM** etiket
> disiplininin depoda yazılı bir kaynağı **yok** (ÖLÇÜM 28 Eylül 2026:
> `CLAUDE.md`, `docs/GOREV_SINIRLARI.md` ve ön kayıtta arandı — tanımı hiçbir
> yerde geçmiyor). Kanıt notlarında **uygulanıyor** ama tanımlanmamış; ör.
> `docs/evidence/demo-nonce7-prerecord.md` dört ÖLÇÜM ve bir ÇIKARIM etiketi
> taşıyor. Rapor bu etiketleri kullanacağı için tanımı bu belgenin
> "Bu belgenin kuralları" bölümünde **kendisi veriyor**. Kuralın
> `CLAUDE.md`'ye veya `GOREV_SINIRLARI.md`'ye taşınması Akif'in kararı.

> YAZILACAK — R2

---

## 5. Sonuçlar

**Amaç:** ölçülmüş gas sonuçlarını, her birinin koşuluyla ve uzlaştırmasıyla
vermek. Bu bölüm raporun sayısal çekirdeğidir.

**Sahibi:** Akif · **Bütçe:** ~110 satır

### 5.1 Task 7 tablosu — üç satır, üç alıcı koşulu

Tablo **üç satırdır**. Alıcı koşulu satırı belirler; EIP-2929'da erişim
listesi her tx'te sıfırlandığı için cüzdan dışındaki bir alıcı ilk erişimde
**soğuktur**.

| satır | alıcı koşulu | `gasUsed` | `z` | intrinsic | yürütme |
|---|---|---|---|---|---|
| A | sıcak + var olan (kendine iade) | **216.269** | 206 | 81.056 | 135.213 |
| B | **soğuk** + var olan | **218.721** | 210 | 81.008 | 137.713 |
| C | **soğuk** + boş | **243.817** | 202 | 81.104 | 162.713 |

Etiket: **ÖLÇÜM** (üçü de zincirden) · Dayanak:
`docs/evidence/crypto-tests/sprint4-gas-table-and-second-tx.md:1546-1548`

**Ayrı satır — tabloya girmez:**

| tx | `gasUsed` | ne |
|---|---|---|
| 7 Eylül 2026, `0xd62b812e…631ad9` | **233.429** | **ilk tx, nonce 0→1, ilk nonce yazımı** |

Dayanak: aynı dosya `:1549` · `docs/evidence/tx-hashes.md:30`

### 5.2 İki ön kayıtlı tahmin, sıfır fark

B ve C satırları işlemden **önce** yazılmış beklentilerle ölçüldü ve ikisi
de sıfır farkla tuttu.

| satır | ön kayıtlı beklenti | ölçülen | fark |
|---|---|---|---|
| B (nonce 5) | ön kayıtta yazılı | 218.721 | **0** |
| C (nonce 6) | ön kayıtta yazılı | 243.817 | **0** |

Etiket: **ÖLÇÜM** · Dayanak: `…sprint4-gas-table-and-second-tx.md:1295-1296` ·
`docs/evidence/crypto-tests/sprint4-recorded-demo-run.md` ·
`docs/evidence/crypto-tests/sprint4-c-row-measurement.md` ·
`docs/evidence/tx-hashes.md:35-50`

### 5.3 EIP-2929 / EIP-3529 uzlaştırması — yürütme farkları tam oturuyor

**Başlık sayısı uzlaştırılmış olandır.** İki ayrı büyüklük, iki ayrı satır:

| büyüklük | B − A | C − B | C − A | etiket |
|---|---|---|---|---|
| **z-uzlaştırmalı yürütme farkı** (intrinsic arındırılmış) | **2.500** | **25.000** | **27.500** | ÖLÇÜM + HESAP |
| spesifikasyonun beklediği | 2.500 | 25.000 | 27.500 | — |
| **sapma** | **0** | **0** | **0** | — |
| ham `gasUsed` farkı (intrinsic dahil, `z`'ler farklı) | 2.452 | 25.096 | 27.548 | HESAP |

Kalemler: `+2.500` = soğuk hesap erişimi (2.600 − 100) · `+25.000` = boş
hesap oluşturma.

Dayanak: yürütme farkları ve sıfır sapma
`…sprint4-gas-table-and-second-tx.md:1644-1650`; kalemlerin türetilmesi
aynı dosya `:162-163`; ham `gasUsed` farkları § 5.1'in üç satırından
aritmetikle.

> **Neden ham fark da yazılıyor:** üç satır üç **farklı alıcıda** ölçüldü,
> dolayısıyla `z`'leri farklı ve ham farklar spesifikasyonun kesin
> sayılarına oturmaz. Oturması için intrinsic'in arındırılması gerekir.
> İki büyüklüğü aynı satırda göstermek, "sayılar tutmadı" izlenimini
> önlüyor.

> **Rapora GİRMEYEN kalem.** `eth_estimateGas` farkları (`+2.520`, `+25.198`)
> ve bunları açıklayan `est()` çarpanı (`×1,0079`) rapora alınmıyor —
> § 5.3 ölçümler üzerinden kurulduğu için gerekmiyor. Kaynağı duruyor:
> aynı dosya `:292-294` (tahmin tablosu) · `:302-327` (eps ölçümü) ·
> `:1652-1660` (sapmanın kaynağı).

### 5.4 `233.429` → `216.269` köprüsü

17.160 gas farkının tamamı kalansız kapanıyor: 17.100 ilk nonce yazımı
(`SSTORE_SET` − `SSTORE_RESET`) + 60 calldata.

Etiket: uçlar **ÖLÇÜM**, bölme **ÇIKARIM** (SPEC sabitlerine dayanıyor,
ayrıca ölçülmedi — "hesaplanmış eşleşme").
Dayanak: `…sprint4-gas-table-and-second-tx.md:1765-1826` (28 Eylül 2026
tarihli ek); ekin kendi kaynağı `docs/handoff/2026-09-27-devir.md:192-222`.

### 5.5 `216.221` ile `216.269` çelişmiyor

İki **ayrı** işlem, farklı bloklar. 48 gas fark = 4 sıfır bayt × 12 gas,
kalansız. README'nin `216.221`'i doğrudur ve düzeltilmeyecek.

Etiket: iki `gasUsed` **ÖLÇÜM**; `z(216.221) = 210` **ÇIKARIM** (ham
calldata hiçbir uçtan okunamadı).
Dayanak: aynı dosya `:1680-1760`

### 5.6 `88.247` nedir — Foundry tablosu ile canlı ölçüm neden 2,5 kat ayrı

`docs/RAPOR_HAM_ICERIK.md` Böl. 5'teki `88.247`, canlı ölçümle
karşılaştırılabilir bir sayı değildir. Böl. 5'in kendisi üç sınırını
yazmış: doğrulama **sıfır** sayılmış (`MockVerifier`), intrinsic (21.000)
**dahil değil**, calldata **dahil değil**. Ayrıca `88.247` **Max** kolonudur,
tipik değer değil.

Etiket: ÖLÇÜM (suite çıktısı) · Dayanak: `docs/RAPOR_HAM_ICERIK.md:111-126` ·
`docs/evidence/gas-reports/sprint2.txt` ·
`docs/evidence/gas-reports/sprint3-execute-real-gas.md` ·
`docs/handoff/2026-09-27-devir.md:176-190` (260 çağrının 260'ı `hex"00"`
sahte imza — ölçüldü)

> YAZILACAK — R2

---

## 6. Nonce 7 canlı demosu

**Amaç:** ön kayıtlı bir beklentinin jüri önünde canlı bir işlemle
kapatıldığını göstermek.

**Sahibi:** Akif · **Bütçe:** ~15 satır şimdi, ~60 çekimden sonra

> ## ⚠ ÇEKİM SONRASI DOLDURULACAK
>
> Ön kayıt **kesinleşti** 28 Eylül 2026 08:49:48 UTC, blok 11799423 —
> `docs/evidence/demo-nonce7-prerecord.md`. Çekim henüz yapılmadı
> (ÖLÇÜM 28 Eylül: `PQWallet.nonce()` = 7).
>
> Çekimden sonra buraya girecekler: tx hash · blok · `gasUsed` ·
> `z` (calldata'dan sayılmış) · formülle karşılaştırma ve fark ·
> videonun SHA-256'sı. Hepsi ön kayda **tarihli ek** olarak da yazılır;
> ön kaydın üstü silinmez.

---

## 7. Tekrar üretilebilirlik

**Amaç:** jürinin ve üçüncü bir tarafın bu raporun her iddiasını kendi
makinesinde ve kendi zincir sorgusuyla yeniden üretebilmesi.

**Sahibi:** Akif · **Bütçe:** ~45 satır

### 7.1 Kontrat adresleri (Sepolia, hepsi Etherscan'de "Verified")

| kontrat | adres |
|---|---|
| SPHINCSVerifier | [`0x143Db127BE77FdE689629b18F9F415014C514a2E`](https://sepolia.etherscan.io/address/0x143db127be77fde689629b18f9f415014c514a2e) |
| Migration | [`0x93e2938A04AE4FbC59a5FDe59D7683667eDD5536`](https://sepolia.etherscan.io/address/0x93e2938a04ae4fbc59a5fde59d7683667edd5536) |
| PQWallet | [`0x2EafA294C14b6752128bfd4f5873D1EA39f000BB`](https://sepolia.etherscan.io/address/0x2eafa294c14b6752128bfd4f5873d1ea39f000bb) |
| SphincsC13Asm (referans) | [`0x9565aFbbD79bCc685a1AEe598385f892cD32Fe68`](https://sepolia.etherscan.io/address/0x9565afbbd79bcc685a1aee598385f892cd32fe68) |

Dayanak: `docs/evidence/tx-hashes.md:9-19`

### 7.2 İşlem hash'leri

**Deploy (1 Eylül 2026, toplam 1.256.479 gas):**

| tx | ne |
|---|---|
| [`0x65ef52d5…6e6e84d`](https://sepolia.etherscan.io/tx/0x65ef52d56600b345ec4283c952893b972b2f16d5376613e85e3f475fa6e6e84d) | SPHINCSVerifier (+ SphincsC13Asm aynı tx'te) |
| [`0xde3080fe…d7e8a2`](https://sepolia.etherscan.io/tx/0xde3080fe110bdad2e475bc25f975b0f2451651d5c20bc21d1bdad92ebfd7e8a2) | Migration |
| [`0xaaf4f218…41680a`](https://sepolia.etherscan.io/tx/0xaaf4f2188457be383aea9d6c60ad13f2461bbb772b512d93567239992e41680a) | PQWallet |

**Gerçek işlemler:**

| tx | ne | `gasUsed` |
|---|---|---|
| [`0x1ccc11f1…c75a609`](https://sepolia.etherscan.io/tx/0x1ccc11f14c8eaaad4fd0cb8e346234dc6256576c9e9c900c3632d4c32c75a609) | `Migration.proveOwnership()`, gerçek ECDSA `personal_sign` | 73.753 |
| [`0xd62b812e…631ad9`](https://sepolia.etherscan.io/tx/0xd62b812e6a0e0c31d79d4a85c1bd61c738e02368fe51490c57a19ea6ca631ad9) | ilk `execute()`, nonce 0→1 | 233.429 |
| [`0x320e03d9…e50da`](https://sepolia.etherscan.io/tx/0x320e03d98cec857bbae8ecb49bcb0736c960287d76a19f2fad39b471b09e50da) | `execute()`, kendine iade | 216.221 |
| [`0x0fd4b9b3…c3e71c`](https://sepolia.etherscan.io/tx/0x0fd4b9b3c992053c7a3c8b3133cfbfdcefacf0242e42b88750b921c718c3e71c) | **A satırı**, nonce 4 | 216.269 |
| [`0x6b8bbecd…cd312ff`](https://sepolia.etherscan.io/tx/0x6b8bbecd0bc7fefc36ed5120d09410af7aff970950599652510828c28cd312ff) | **B satırı**, nonce 5, kayıtlı demo | 218.721 |
| [`0x222556c3…b11475`](https://sepolia.etherscan.io/tx/0x222556c3e0f9d2f5ff8661a1affcd8aa03d2b4120a539c65ea98a64044b11475) | **C satırı**, nonce 6 | 243.817 |

Dayanak: `docs/evidence/tx-hashes.md:27-33`; A satırı
`docs/evidence/crypto-tests/sprint4-gas-table-and-second-tx.md:1547,1699`.

> **Receipt sorgusu arşiv düğümü gerektirir.**
> `cast rpc eth_getTransactionReceipt <hash>` (`cast receipt` budanmış
> receipt'te süresiz asılır, kullanılmaz) ücretsiz public Sepolia uçlarında
> ~8.000–10.000 blok (≈30 saat) sonra `null` döner; `eth_getTransactionByHash`
> tx'i vermeye devam eder. **Bu bir kusur değil, ağ gerçeğidir** — ücretsiz
> düğümler arşiv geçmişi tutmaz. `--rpc-url` bir **arşiv** ucuna verilmelidir.
> Ham JSON tutanakları `docs/evidence/chain/` altında. Tutanak bir
> kolaylık kopyasıdır, kriptografik kanıt değil: tx hash ve blok numarası
> **herhangi bir arşiv düğümüyle** yeniden doğrulanabilir.
> Ölçüm: `docs/evidence/crypto-tests/sprint4-screen-consistency.md` § 7.1 ·
> `docs/evidence/sprint4-ok2-clean-clone.md:105-115`

### 7.3 Repodan çalıştırma — temiz klonla ölçüldü

**ÖLÇÜM.** Temiz klon testi iki kez koştu ve geçti: 17 Eylül 2026 (çalışma
ağacının kopyası) ve **18 Eylül 2026 (ağdan taze klon)**.

| adım | sonuç | etiket |
|---|---|---|
| `npm i` → `cp .env.example .env` → `npx vite build` | **142 ms**'de geçti | ÖLÇÜM |
| `src/crypto/wasm-signer-test.mjs` | keygen + sign geçti, imza **3.688 bayt**, sign **7,5 sn**, çıkış 0 | ÖLÇÜM |
| tarayıcıda WASM yükü | `sphincs_c13_signer_bg.wasm` · 200 · 228 kB | ÖLÇÜM |

Dayanak: `docs/evidence/sprint4-ok2-clean-clone.md:13-19` (SONUÇ) · `:59-70`
(kurulum sırası) · `:279` · `:305-365` (ağdan taze klon) · `:349` · `:508-515`
Kurulum adımlarının tamamı: `docs/FRONTEND-KURULUM.md`

**Koşulu:** WASM çıktısı depoya konuldu (17 Eylül 2026, Akif kararı — seçenek
C, `docs/evidence/sprint4-ok2-clean-clone.md:236-264`), böylece Rust ön koşulu
kalktı. Kararın koşulu **cross-machine determinizmin ölçülmemiş olmasıydı**
(`:240-251`) — bkz. § 8.

> YAZILACAK — R2

---

## 8. Sınırlar ve açık kalemler

**Amaç:** jürinin sorabileceği her zayıf noktayı bizim önce söylememiz.
Bu bölüm gizlenmez ve kısaltılmaz.

**Sahibi:** Akif · **Bütçe:** ~70 satır

| # | sınır | etiket | dayanak |
|---|---|---|---|
| 1 | **Her satır tek koşu.** A/B/C birer kez ölçüldü; ikinci koşu farklı çıkarsa tablo değişir | SINIR | `…sprint4-gas-table-and-second-tx.md:1582-1600` |
| 2 | **Trace alınmadı.** Yürütme bileşeni aritmetikle türetildi (`gasUsed − intrinsic`), frame bazında ölçülmedi | SINIR | aynı, `:1596-1600` |
| 3 | `nonce++` maliyeti üç koşuda **aynı varsayıldı**, ayrı ölçülmedi | ÇIKARIM | aynı, `:1586-1591` |
| 4 | **5.000 gas açıklanmadan kalıyor** (`147.313 + 81.116 = 228.429` vs ölçülen `233.429`); `vm.cool` üretemedi | ÖLÇÜLMEDİ | `docs/evidence/gas-reports/sprint3-execute-real-gas.md:90,97-98,117-120` · `docs/handoff/2026-09-27-devir.md:181,236` |
| 5 | **EIP teyitleri açık — 5 satır**, hiçbiri spec metnine karşı doğrulanmadı (EIP-2929/3529/7623 sabitleri + `SSTORE_SET`/`SSTORE_RESET`) | AÇIK | `docs/handoff/2026-09-27-devir.md:233` · `…sprint4-gas-table-and-second-tx.md:1616-1620` |
| 6 | **`−1 gas`** ham tahmin yolunda (B −1, C 0); sebep ölçülmedi | ÖLÇÜLMEDİ | `docs/evidence/crypto-tests/sprint4-c-row-measurement.md:199,247` |
| 7 | **`z(216.221) = 210` bir ÇIKARIM**; ham calldata hiçbir uçtan okunamadı (beş uç denendi, üç bilinen-iyi hash de `null` döndü) | ÇIKARIM | `…sprint4-gas-table-and-second-tx.md:1731-1752` |
| 8 | **WASM çapraz-makine determinizmi ölçülmedi** — depoya konan çıktının başka makinede bit-aynı üretildiği gösterilmedi | ÖLÇÜLMEDİ | `docs/evidence/sprint4-ok2-clean-clone.md:240-251` · `docs/handoff/2026-09-27-devir.md:238` |
| 9 | **Sınanmamış yollar:** `receipt.status === 0` PQWallet'ın **kendi** revert'iyle hiç gözlenmedi; iddia `contracts/src/PQWallet.sol` kaynak okumasına dayanıyor, ampirik gözleme değil | AÇIK | `docs/evidence/crypto-tests/sprint4-untested-branches.md` · `docs/evidence/crypto-tests/sprint3-three-shields.md:134-170` · `docs/handoff/2026-09-27-devir.md:239` |
| 10 | **Gerçek 390px elle kontrol edilmedi.** `@media (max-width:420px)` kuralları yazıldı ama hiç koşulmadı; headless Chrome 500 CSS px altına inmiyor, `playwright`/`puppeteer` kurulu değil | ÖLÇÜLMEDİ | `docs/handoff/2026-09-27-devir.md:520` |
| 11 | **Performance kaydı alınmadı.** "WASM ana iş parçacığını ~9,3 sn senkron bloke ediyor" bir **ÇIKARIM**'dır; 9.303,4 ms ölçülen imzalama süresidir, bloklama kanıtı değil | ÇIKARIM | `docs/handoff/2026-09-27-devir.md:502-512` |
| 12 | Yükleniyor göstergesinin doğruluğu **yalnız tarayıcıda** kanıtlanabilir — `nextPaint` kaldırılınca testler kırılmadı (mutasyon testi) | SINIR | `docs/handoff/2026-09-27-devir.md:513-518` |
| 13 | Güvenlik incelemesi **bağımsız profesyonel denetim değil** | SINIR | `docs/ARCHITECTURE.md:112-115` |

> YAZILACAK — R2

---

## 9. Güvenlik notları

**Amaç:** neyin korunduğunu ve neyin korunmadığını ayrı ayrı yazmak.

**Sahibi:** Akif · **Bütçe:** ~55 satır

| konu | durum | dayanak |
|---|---|---|
| **Mnemonic ekranda yok** — içe aktarma sırasında DOM'a hiç basılmıyor (DOM'da yok, 2-gram boş, tam ifade `false`) | ÖLÇÜM | `docs/evidence/crypto-tests/sprint3-owner-mnemonic-import-leak-audit.md:82-92` |
| Mnemonic kanaryası (kırmızı/yeşil) | ÖLÇÜM | `docs/evidence/screenshots/sprint4-mnemonic-canary-{green,red}.png` |
| **Owner açık anahtarı için setter YOK** — `ownerPublicKey` yalnız constructor'da yazılıyor; rotasyon = **yeniden deploy** | ÖLÇÜM | `contracts/src/PQWallet.sol:11,21-23` · `docs/RAPOR_HAM_ICERIK.md:162-166` |
| Anahtar rotasyonu canlıda iki kez yapıldı, operasyonel olarak yönetilebilir | ÖLÇÜM | `docs/evidence/crypto-tests/sprint3-owner-key-rotation.md` |
| **Kurtarma mekanizması YOK** — anahtar kaybı cüzdanı kalıcı olarak erişilemez kılar; sosyal kurtarma/zaman kilidi yok | SINIR | (kapsam dışı, `docs/GOREV_SINIRLARI.md`) |
| **Gası ödeyen taraf klasik ECDSA'dır** — `execute()` `msg.sender`'a bakmaz, yetki tamamen imzadan gelir; ödeyen EOA kuantum-güvenli değildir ve **olması gerekmiyor** (yetki taşımıyor) | — | `docs/RAPOR_HAM_ICERIK.md:27-31` · `contracts/src/PQWallet.sol:42-44` |
| **Self-migration kalıcı kilit** — kendine migrate eden adres `AlreadyMigrated` yüzünden bir daha gerçek bir PQ cüzdanına geçemez; kasıtlı olarak belgelendi, düzeltilmedi | ÖLÇÜM | `docs/RAPOR_HAM_ICERIK.md:65` |
| Verifier **asla revert etmez** — malformed girdi `try/catch` ile yutulup `false` dönüyor | ÖLÇÜM | `docs/RAPOR_HAM_ICERIK.md:157-161` · `docs/INTERFACE.md` |
| Digest `block.chainid` + `address(this)` içeriyor → cross-chain ve cross-contract replay kapalı | — | `docs/RAPOR_HAM_ICERIK.md:37-43` |
| Üç kalkan (nonce · canlı digest · `eth_call` ön-uçuş) | ÖLÇÜM | `docs/evidence/crypto-tests/sprint3-three-shields.md` |
| Negatif kanıt ve tek yol ilkesi | ÖLÇÜM | `docs/evidence/crypto-tests/sprint3-negative-proof.md` |

> YAZILACAK — R2

---

## Kaynakça

1. P. W. Shor, "Polynomial-Time Algorithms for Prime Factorization and
   Discrete Logarithms on a Quantum Computer", *SIAM Journal on Computing*,
   26(5), 1484–1509, 1997.
2. L. K. Grover, "A Fast Quantum Mechanical Algorithm for Database Search",
   *Proceedings of the 28th Annual ACM Symposium on Theory of Computing
   (STOC '96)*, 212–219, 1996.
3. G. Wood ve diğerleri, *Ethereum: A Secure Decentralised Generalised
   Transaction Ledger* (Yellow Paper), **Ek F** — ECDSA, secp256k1 ve
   imzadan açık anahtar kurtarma (`ECRECOVER`).
4. NIST, **FIPS 205** — *Stateless Hash-Based Digital Signature Standard
   (SLH-DSA)*, Ağustos 2024.
5. T. Consigny, *WOTS+C / FORS+C* ailesi — **IACR ePrint 2025/2203**. Bu
   projenin kullandığı **C13** varyantının kaynağı (`h=22 d=2 a=19 k=7 w=8`);
   resmî FIPS 205 setlerinden biri **değildir**.

---

## Ek A — Kanıt dizini

`docs/evidence/crypto-tests/` altındaki **23 kanıt notu** (ÖLÇÜM, 28 Eylül
2026; `.gitkeep` hariç):

| # | not | sprint |
|---|---|---|
| 1 | `sprint0-noble-post-quantum-risk-test.md` | 0 |
| 2 | `sprint1-frontend-keygen-sign-ui.md` | 1 |
| 3 | `sprint1-wasm-signer-test.md` | 1 |
| 4 | `sprint2-js-digest-function.md` | 2 |
| 5 | `sprint2-onchain-roundtrip.md` | 2 |
| 6 | `sprint2-pqwallet-real-verifier-integration.md` | 2 |
| 7 | `sprint3-end-to-end-transaction.md` | 3 |
| 8 | `sprint3-live-signature-verification.md` | 3 |
| 9 | `sprint3-metamask-connection.md` | 3 |
| 10 | `sprint3-negative-proof.md` | 3 |
| 11 | `sprint3-owner-key-rotation.md` | 3 |
| 12 | `sprint3-owner-mnemonic-import-leak-audit.md` | 3 |
| 13 | `sprint3-sepolia-readonly-connection.md` | 3 |
| 14 | `sprint3-three-shields.md` | 3 |
| 15 | `sprint3-transaction-builder.md` | 3 |
| 16 | `sprint3-ui-chain-rewiring.md` | 3 |
| 17 | `sprint4-browser-signing.md` | 4 |
| 18 | `sprint4-c-row-measurement.md` | 4 |
| 19 | `sprint4-gas-table-and-second-tx.md` | 4 |
| 20 | `sprint4-number-format-and-status-labels.md` | 4 |
| 21 | `sprint4-recorded-demo-run.md` | 4 |
| 22 | `sprint4-screen-consistency.md` | 4 |
| 23 | `sprint4-untested-branches.md` | 4 |

**Diğer kanıt dizinleri:**

- `docs/evidence/gas-reports/` — `sprint0-c13-verifier-gas.md` ·
  `sprint0-reference-verifier-gas.md` ·
  `sprint1-sphincsverifier-wrapper-gas.md` · `sprint2.txt` ·
  `sprint3-execute-real-gas.md`
- `docs/evidence/` kökü — `tx-hashes.md` · `demo-nonce7-prerecord.md` ·
  `demo-nonce5-prerecord.md` · `c-nonce6-prerecord.md` ·
  `demo-run-sheet.md` · `c-run-sheet.md` · `sprint4-ok2-clean-clone.md` ·
  `sprint4-permission-deny-test.md`
- `docs/evidence/chain/` — ham tx/receipt JSON tutanakları (1 dosya)
- `docs/evidence/screenshots/` — 34 ekran görüntüsü
