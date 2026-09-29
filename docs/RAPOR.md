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
| 0 | Yönetici özeti | Akif | ~65 satır (443 kelime ≈ 1 sayfa) |
| 1 | Problem ve tehdit | Akif | ~55 |
| 2 | Çözüm ve mimari | **Hakan** | ~70 |
| 3 | SPHINCS-/C13 seçimi ve bedeli | Akif | ~80 |
| 4 | Ölçüm yöntemi | Akif | ~100 |
| 5 | Sonuçlar | Akif | ~140 |
| 6 | Nonce 7 canlı demosu | Akif | ~15 → ~60 |
| 7 | Tekrar üretilebilirlik | Akif | ~130 |
| 8 | Sınırlar ve açık kalemler | Akif | ~60 |
| 9 | Güvenlik notları | Akif | ~95 |
| — | Kaynakça | Akif | ~18 |
| A | Ek A — kanıt dizini | Akif | ~42 |

Toplam ≈ 850 satır (ÖLÇÜM, 28 Eylül 2026). **Şablon sınırı gelmeden
bağlayıcı değil.** § 7 eski ~45 hedefini aşıyor: adres ve hash tabloları tek
başına ~50 satır ve kısaltılırsa bölümün işi (üçüncü tarafın yeniden
üretmesi) yapılamaz. § 8 hedefin altında kaldı çünkü maddeler tabloya girdi;
satır sayısı değil, kalem sayısı (14) ölçüdür.

---

## 0. Yönetici özeti

**Amaç:** jürinin ne inşa edildiğini, üç ölçülmüş sayıyı ve en önemli sınırı
30 saniyede görmesi.

**Sahibi:** Akif · **Bütçe:** ~55 satır (≈ 1 sayfa)

Sepolia test ağında çalışan, yetkilendirmesi kuantum sonrası bir imzaya bağlı
bir akıllı kontrat cüzdanı inşa edildi: **PQWallet** (nonce'lu `execute()`,
imza doğrulanmadan hiçbir çağrı geçmez), **SPHINCSVerifier** (C13
doğrulayıcısının asla revert etmeyen `view` sarmalayıcısı — geçersiz imzada
`false` döner), **Migration** (eski ECDSA adresinin sahipliğini `ecrecover`
ile kanıtlayıp adresi kalıcı işaretler), tarayıcının içinde çalışan
**Rust/WASM imzalayıcı** (BIP-39/44 anahtar türetmeli, C13-only) ve hepsini
tek akışta gösteren bir **arayüz**. Dört kontrat da Etherscan'de doğrulanmış
durumda; imza **3.688 bayt**, doğrulayıcının çıplak maliyeti **106.672 gas**
ve aşağıdaki sayıların tamamı gerçek işlemlerden geliyor, simülasyondan değil.
C13 resmî bir FIPS 205 seti değil, araştırma varyantıdır (§ 3.1, § 3.2,
§ 7.1, § 7.2).

### Üç ölçülmüş işlem

| satır | alıcı koşulu | `gasUsed` | etiket |
|---|---|---|---|
| **A** | sıcak + var olan (nonce 4) | **216.269** | ÖLÇÜM |
| **B** | soğuk + var olan (nonce 5) | **218.721** | ÖLÇÜM |
| **C** | soğuk + boş, hesap oluşuyor (nonce 6) | **243.817** | ÖLÇÜM |

Fark rastgele değildir: intrinsic arındırıldıktan sonra uzlaştırılmış
yürütme farkları **2.500** (A→B) ve **25.000** (B→C), **sapma sıfır**
(HESAP, § 5.3). **B ve C ön kayıtlıdır** — beklenen değer işlem
gönderilmeden önce yazılıp push edildi ve iki koşuda da ölçülenle arasındaki
**fark 0** (§ 4.1, § 5.4). Ön kaydın önce yazıldığı, kendi tutanağımızın
yanı sıra GitHub olay akışıyla da bağımsız gösterildi (§ 4.2).

### Ne ölçtük / ne ölçmedik

**Ölçtük:** üç gerçek işlemin `gasUsed`'ını · doğrulayıcının çıplak
maliyetini · imza boyutunu · iki ön kayıtlı tahminin tuttuğunu · temiz
klondan kurulumun çalıştığını · mnemonic'in içe aktarmada DOM'a hiç
basılmadığını.

**Ölçmedik:** ikinci bir koşuyu · işlem trace'ini · uzlaştırmada açık kalan
**5.000 gas**'ı · EIP sabitlerinin spec metnine karşı teyidini · WASM'ın
çapraz-makine determinizmini · PQWallet'ın kendi revert'iyle bir
`status = 0` receipt'ini. On dört kalemin tamamı, "nasıl ölçülür"
sütunuyla birlikte **§ 8**'de.

### Tek cümlelik sınır

Her satır **tek koşudur** ve kuantum sonrası olan şey **yetkilendirmedir**:
işlemi gönderip gazı ödeyen hesap sıradan bir ECDSA hesabıdır ve öyle
olması bu tasarımda bir eksik değildir — o hesap yetki taşımaz (§ 9.3).

### Okuma rehberi

- **5 dakikanız varsa:** § 0, § 5 (sonuçlar), § 8 (sınırlar).
- **Yöntemi merak ediyorsanız:** § 4 — bir sayının ölçüm mü, sonuca
  uydurulmuş mu olduğunun nasıl ayırt edildiği.
- **Doğrulamak istiyorsanız:** § 7 — adresler, hash'ler, çalıştırma adımları.

> **§ 6 henüz boştur.** Nonce 7 demosunun ön kaydı 28 Eylül 2026 08:49:48
> UTC'de kesinleşti (blok 11799423); **çekim bu satır yazılırken
> yapılmamıştı** ve bu özet sonucu tahmin etmez.

---

## 1. Problem ve tehdit

Ethereum'da bir işlemi yetkilendiren şey ECDSA imzasıdır. İmzanın güvenliği
tek bir varsayıma dayanır: secp256k1 eğrisinde ayrık logaritma problemi
çözülemez. Klasik bilgisayarlar karşısında bu varsayım bugün ayakta.

Shor'un algoritması doğrudan bu varsayımı hedef alır. Yeterli ölçekte ve
hata toleranslı bir kuantum bilgisayar, ayrık logaritmayı polinom zamanda
çözer [1]. Böyle bir makinede açık anahtarı bilen, özel anahtarı hesaplar.

Bu, Ethereum için ayrı bir sorun yaratır. Açık anahtar zincirde gizli
değildir: imzadan geri kurtarılabilir ve `ECRECOVER` tam olarak bunu yapar
[3]. Bir kez işlem göndermiş her hesabın açık anahtarı böylece fiilen
yayımlanmıştır. Saldırganın bekleyeceği bir açıklanma anı yoktur — veri
zaten ortadadır.

Anahtarı büyütmek bu sorunu çözmez. Shor polinom zamanda çalıştığı için
eğriyi büyütmek saldırganın işini orantılı olarak zorlaştırmaz. Aradaki
fark derece farkı değil, tür farkıdır.

Hash tabanlı imzalar başka bir temele oturur. Güvenlikleri yalnızca
kullanılan hash fonksiyonunun özelliklerinden gelir; sayı teorisi varsayımı
içermezler. Kuantum saldırganın hash fonksiyonlarına karşı bilinen genel
aracı Grover'ın algoritmasıdır ve yalnızca karekök hızlanma sağlar [2].
Karekök hızlanma parametre büyütmeyle telafi edilir: çıktı boyutunu iki
katına çıkarmak kaybedilen marjı geri verir. Burada büyütmek işe yarar,
çünkü saldırının ölçeklenmesi farklıdır.

NIST bu aileyi 2024 Ağustos'unda SLH-DSA adıyla standartlaştırdı (FIPS 205)
[4].

Bedeli boyut ve maliyettir. Hash tabanlı bir imza, ECDSA imzasından iki
mertebe büyüktür ve EVM'de doğrulaması pahalıdır. Bu raporun ölçtüğü şey
tam olarak bu bedeldir.

Bu rapor, böyle bir kuantum bilgisayarın ne zaman ortaya çıkacağına dair
tahmin yürütmez. Tahmin zaten gerekmiyor: açık anahtarı zincirde görünen
hesaplar için geçiş, ECDSA hâlâ güvenliyken yapılmalıdır. Mühendislik
sorusu "ne zaman" değil, "yol hazır mı" sorusudur.

Bu kısıt bizim tasarımımıza doğrudan uygulanır. `Migration` kontratı eski
adresin sahipliğini o adresin **ECDSA imzasıyla** kanıtlar: `personal_sign`
(EIP-191) ile üretilmiş 65 baytlık imza, `ecrecover` ile doğrulanır
(`contracts/src/Migration.sol:43-50`, `:79` · `docs/RAPOR_HAM_ICERIK.md:44-48`).
Özel anahtarı hesaplayabilen bir saldırgan bu kanıtı da üretebilir.
Dolayısıyla `Migration` yalnızca tehdit gerçekleşmeden önce anlamlıdır;
sonrasında eski adresin sahipliğini kanıtlayan imza, saldırganın da
üretebileceği bir imzaya dönüşür. Etiket: **ÇIKARIM** — bu sonuç
`Migration.sol`'un imza şemasından çıkarıldı, ölçülmedi.

> **NOT — R2 için.** Bu bölüm literatüre dayanır, projenin tanıtım
> sayfasına değil. `frontend/index.html`'den alıntı yapılmadı.

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

### 3.1 C13 nedir

C13, FIPS 205'in resmî parametre setlerinden biri **değildir**. Dayandığı
**WOTS+C / FORS+C** yapısı ePrint 2025/2203'ten gelir (Kaynakça [5]);
`h=22 d=2 a=19 k=7 w=8` parametre seçimi ve EVM doğrulayıcısı
`nconsigny/sphincs-minus` deposunun katkısıdır (Kaynakça [6]). İkisi birlikte
EVM doğrulama maliyetini düşürmek için tasarlanmış bir araştırma varyantı
verir (`docs/ARCHITECTURE.md:56-58`).

Eski hedef **SLH-DSA-SHA2-128-24 de standart bir set değildi.** O da
Consigny'nin özel varyantıydı (`h=22 d=1 a=24 k=6 w=4`) ve FIPS 205'in
standart setlerinden — 128s/f · 192s/f · 256s/f, SHA2 ve SHAKE aileleri —
biri değildi (`crypto-tests/sprint0-noble-post-quantum-risk-test.md:10-18` ·
`docs/DECISIONS.md:176`). Aşağıdaki karşılaştırma bu yüzden iki araştırma
varyantı arasındadır, varyant ile standart arasında değil.

C13 standart setten iki noktada ayrılır: **WOTS+C** checksum yerine sabit
"target sum" kısıtı kullanır ve doğrulamada gezilen zincir adımı sayısını
azaltır; **FORS+C**'de son FORS ağacı "forced-zero"dur ve imzayı gizli
anahtar entropisinden feragat ederek kısaltır (`:60-63`).

Parametreler `h=22 d=2 a=19 k=7 w=8`, imza **3.688 bayt** (ÖLÇÜM,
`docs/ARCHITECTURE.md:65`). Kontrat bunu şart olarak uygular:
`sig.length == 3688` değilse revert eder (`:81`). Tarayıcıda üretilen
imzalar beş koşunun beşinde de 3.688 bayt çıktı (ÖLÇÜM,
`docs/FRONTEND-KURULUM.md:178-181`).

### 3.2 Neden seçildi — ölçülmüş maliyet

İki şema aynı ortamda, aynı sabitlenmiş submodule commit'iyle ölçüldü.

| şema | doğrulama | imza | kaynak (hepsi ÖLÇÜM) |
|---|---|---|---|
| **C13** (çıplak referans `SphincsC13Asm`) | **106.672 gas** | 3.688 bayt | `gas-reports/sprint0-c13-verifier-gas.md:71,85` |
| SLH-DSA-SHA2-128-24 (eski hedef) | **143.057** (geçerli imza) – **146.192 gas** (geçersiz mesaj reddi) | 3.856 bayt | `gas-reports/sprint0-reference-verifier-gas.md:74,84-86` · `:30` |

Doğrulama **%25 daha ucuz** (HESAP, `docs/DECISIONS.md:184`), imza **168
bayt** daha küçük (HESAP). Zincirde çağrılan kontrat ise çıplak referans
değil, onu saran `SPHINCSVerifier`'dır: **111.074 gas** (ÖLÇÜM,
`gas-reports/sprint1-sphincsverifier-wrapper-gas.md:67` ·
`docs/DECISIONS.md:323`), çıplak referansın ~%4 üzerinde. Fark, hiçbir
girdide revert etmemeyi sağlayan katmanın bedelidir (bkz. § 9). Şema
19 Ağustos 2026'da değiştirildi; Hakan onayladı, karar donduruldu
(`docs/DECISIONS.md:161`, `:213-214`).

### 3.3 İmzalayıcı neden kendi yazıldı

`@noble/post-quantum` yalnızca FIPS 205'in standart setlerini üretir, C13
üretemez (ÖLÇÜM, `crypto-tests/sprint0-noble-post-quantum-risk-test.md:26`).
İmzalar bu yüzden `contracts/lib/sphincs-minus/signer-wasm` ile üretiliyor:
Rust/WASM, yalnızca C13, BIP-39/44 anahtar türetmeli.

### 3.4 Bedeli

Seçim, maliyet lehine ve güvenlik olgunluğu aleyhine verilmiş bilinçli bir
ödündür. Bedeli dört maddede:

1. **Standart değil.** C13 bir FIPS 205 parametre seti değildir; güvenlik
   kanıtı da FIPS 205'in kanıtı değil, C13'e özgü ayrı bir analizdir
   (`docs/ARCHITECTURE.md:71-72`).
2. **İnceleme bağımsız denetim değil.** Elimizdeki inceleme
   (`SECURITY-REVIEW-C13-SLHDSA.md`) ajan destekli ve "en iyi çaba
   mühendislik incelemesi" etiketli; bağımsız profesyonel denetim
   yapılmadı. C13 tarafındaki sonucu: sahtecilik, anahtar kurtarma veya
   yanlış-kabul zafiyeti **bulunamadı** (`docs/ARCHITECTURE.md:112-118`).
3. **C13-X-f2 — mesaj randomizer'ı `R` tamamen kamuya açıktır**, gizli
   anahtara bağlı değildir. İncelemenin tahminine göre en iyi bilinen
   sahtecilik **~2^133 iş** gerektirir — 128-bit hedefin üzerinde, pratik
   bir kırılma değil (**ÇIKARIM**: incelemenin tahmini, ölçümümüz değil).
   Açık kalan: "few-time" kanıtı, saldırganın indeks haritasını kontrol
   ettiği daha güçlü modelde ispatlanmamış (`docs/ARCHITECTURE.md:126`).
4. **C13-X-f3 — target-sum WOTS+C'nin çoklu-kullanım direnci
   ispatlanmamıştır.** 2^22 tavanda ~2^21 `htIdx` çakışması beklenir. Aynı
   katman-0 WOTS anahtarının iki farklı mesajda kullanılmasının somut bir
   sahteciliğe yol açtığı **gösterilmemiş**, teorik argüman da **eksik**
   (`docs/ARCHITECTURE.md:127`).

Pratik sonuç: C13 hedeflenen düzeyde kullanılabilir, bilinen pratik bir
saldırı yüzeyi yok; "araştırma varyantı" uyarısı geçerli (`:135-137`).

---

## 4. Ölçüm yöntemi

Bir gas sayısı işlemden **sonra** yazılırsa, o sayının ölçüm mü olduğu yoksa
sonuca uydurulmuş mu olduğu ayırt edilemez. Bu rapordaki her canlı ölçüm bu
ayrımı kurabilmek için aynı sırayı izledi.

### 4.1 Yöntem zinciri

Ön kayıt yazılır (beklenen `gasUsed`, beklenen digest, alıcının sınıfı,
cüzdanın nonce'u) → commit ve push → **`pushed_at` okunur**, tx gönderilmeden
önce, ham çıktısı kanıta geçer → tx gönderilir → sonuç ön kayda **tarihli ek**
olarak yazılır; ön kaydın kendisi değiştirilmez
(`docs/evidence/demo-nonce7-prerecord.md:18`, `:382`, `:399`).

Üçüncü adım yöntemin dayanağıdır. `pushed_at` bizim yazdığımız bir damga
değil, üçüncü bir tarafın kaydıdır ve işlemden öncedir.

**Bu adımın sınırı.** `pushed_at` yalnızca **son** push'u gösterir. Jüri
bugün o alanı okuduğunda 28 Eylül'deki değeri göremez, en son push'un
damgasını görür. Kanıtımız alanın bugünkü değeri değil, o an okunup kanıt
dosyasına geçirilen değerdir — yani kaydın kendisi bizim tuttuğumuz bir
tutanaktır.

### 4.2 Bağımsız doğrulama yolu — GitHub olay akışı

Tutanağa güvenmek zorunda kalmamak için ikinci bir yol var. GitHub'ın olay
akışı her push'u kendi zaman damgasıyla listeler:

```
curl -s "https://api.github.com/repos/akifaybek/pq-safe/events?per_page=100"
```

28 Eylül 2026 17:26 UTC'de okundu; akış 67 `PushEvent` döndü (en eski
2026-08-28T20:30:54Z, en yeni 2026-09-28T08:45:17Z). Ön kayıt commit'lerinin
push damgaları, karşılık gelen işlemlerin blok zamanlarıyla yan yana:

| ön kayıt | push `created_at` | tx | blok | blok zamanı | fark |
|---|---|---|---|---|---|
| nonce 5 (B) · `aca65785` | **2026-09-24T19:04:44Z** | `0x6b8bbecd…` | 11774374 | 2026-09-24T20:18:12Z | push **73 dk önce** |
| nonce 6 (C) · `95f93e17` | **2026-09-24T21:49:11Z** | `0x222556c3…` | 11774980 | 2026-09-24T22:19:36Z | push **30 dk önce** |

Etiket: **ÖLÇÜM** — push damgaları GitHub olay akışından, blok zamanları
Sepolia'dan bağımsız olarak okundu. İki koşuda da push işlemden öncedir.
Tx hash'leri ve blokları: `docs/evidence/tx-hashes.md:27-33` (tablo hâlinde
§ 7.2); ön kayıt commit'leri `docs/evidence/demo-nonce5-prerecord.md` ve
`docs/evidence/c-nonce6-prerecord.md`.

**Nonce 7 bu tabloda yok.** Ön kaydın iki commit'i (`a0f08aad`, `2a00a824`)
`origin/main`'de duruyor, ama 28 Eylül 17:26 UTC'de okunan akışta **yer
almıyorlar**; akışın en yeni kaydı `8c3e046b` (08:45:17Z) ve ön kayıt
push'ları ondan sonra yapıldı. Push ile okuma arasında 8,5 saat var, yani
bu yalnızca kısa bir gecikmeyle açıklanmıyor. **Sebep ölçülmedi.**

**Bu yolun iki sınırı:**

1. GitHub olay akışı kayıtları **sınırlı süre** tutar ve gerçek zamanlı
   olduğu garanti edilmez. Bugün okunabilen üç ay sonra okunamayabilir;
   nonce 7'nin durumu bu belirsizliğin canlı örneğidir.
2. Akışın bize döndüğü yükte `commits` dizisi **yok**, yalnızca push'un
   `head` SHA'sı var. Dolayısıyla bu yolla ancak **push başı olan**
   commit'ler doğrulanabilir; bir push'un içindeki ara commit'ler
   doğrulanamaz.

### 4.3 Beklenti bir sayı değil, bir fonksiyon

Ön kayıt tek bir sayıya değil, bir formüle bağlanır:

```
gasUsed = 216.305 − 12 · (z − 203)
```

`z`, calldata'daki sıfır bayt sayısıdır ve **imza üretilmeden bilinemez**:
imzalayıcı her koşuda farklı bir imza verir, `z` de onunla değişir. Ön kayıt
bu yüzden sonuca göre ayarlanabilecek bir sayı değil, `z` hangi değeri alırsa
alsın bağlayıcı kalan bir fonksiyon taahhüt eder
(`…sprint4-gas-table-and-second-tx.md:1005`, `:1214`).

### 4.4 Durdurma kuralları

Ön kayıt beklentinin yanında **ön koşulları** da sabitler: nonce, alıcının
sınıfı, ekranda görünmesi gereken digest. Bir ön koşul sağlanmazsa koşu
**iptal edilir**, yeniden yorumlanmaz
(`docs/evidence/demo-nonce7-prerecord.md:118-145` · kontrol listesi
`docs/evidence/demo-run-sheet.md:185-200` · `…second-tx.md:1359`).

### 4.5 Defter kuralı

Kanıt dosyaları düzeltilmez. Yanlış çıkan satır yerinde bırakılır, altına
tarihli ek yazılır — bir sayının nasıl değiştiği de kayıtta kalsın diye.
Bu raporun § 5.3, § 5.5 ve § 5.6 maddeleri böyle eklerden besleniyor.

### 4.6 Yöntemin sınırı

Bu yöntem beklentinin sonuca uydurulmadığını gösterir; modelin **doğru**
olduğunu göstermez. Üç koşuda üç isabet üç örnektir, "her zaman tutar" sonucu
çıkarılamaz (`…second-tx.md:1674-1678`).

> **AÇIK — belgelenmemiş kural.** **ÖLÇÜM / HESAP / ÇIKARIM** disiplininin
> depoda yazılı bir tanımı **yok** (ÖLÇÜM 28 Eylül 2026: `CLAUDE.md`,
> `docs/GOREV_SINIRLARI.md` ve ön kayıtta arandı). Kanıt notlarında
> uygulanıyor ama tanımlanmamış. Tanımı şimdilik yalnız bu rapor veriyor;
> kalıcı bir yere taşınması Akif'in kararı.

---

## 5. Sonuçlar

**Amaç:** ölçülmüş gas sonuçlarını, her birinin koşuluyla ve uzlaştırmasıyla
vermek. Bu bölüm raporun sayısal çekirdeğidir.

**Sahibi:** Akif · **Bütçe:** ~110 satır

### 5.1 Ölçülen `gasUsed` — üç alıcı koşulu

Alıcının durumu maliyeti belirler. EIP-2929'da erişim listesi her işlemde
sıfırlanır, bu yüzden cüzdanın dışındaki bir alıcı ilk erişimde
**soğuktur**. Üç koşu, üç farklı alıcı sınıfında ölçüldü.

| satır | alıcı koşulu | `gasUsed` | tx |
|---|---|---|---|
| A | sıcak + var olan (kendine iade) | **216.269** | nonce 4 · `0x0fd4b9b3…` |
| B | **soğuk** + var olan | **218.721** | nonce 5 · `0x6b8bbecd…` |
| C | **soğuk** + boş | **243.817** | nonce 6 · `0x222556c3…` |

Etiket: **ÖLÇÜM** — üç değer de zincirden okundu. Dayanak:
`docs/evidence/crypto-tests/sprint4-gas-table-and-second-tx.md:1546-1548`

**Tabloya girmeyen ayrı satır:**

| tx | `gasUsed` | ne |
|---|---|---|
| 7 Eylül 2026 · `0xd62b812e…631ad9` | **233.429** | ilk tx, nonce 0→1, **ilk nonce yazımı** |

Cüzdanın ilk `execute()` çağrısıdır ve nonce'u sıfırdan yazmanın tek
seferlik bedelini taşır; uzlaştırması § 5.5'te. Dayanak: aynı dosya `:1549` ·
`docs/evidence/tx-hashes.md:30`

### 5.2 Intrinsic ve yürütme bileşenleri

`gasUsed`, işlemin taban maliyeti (intrinsic, `21.000 + 4z + 16nz`) ile EVM
içindeki yürütmenin toplamıdır. Yürütme, ölçülen `gasUsed`'dan intrinsic
çıkarılarak bulunur.

| satır | `z` | intrinsic | yürütme |
|---|---|---|---|
| A | 206 | 81.056 | 135.213 |
| B | 210 | 81.008 | 137.713 |
| C | 202 | 81.104 | 162.713 |

Etiket: **HESAP** — `z` calldata'dan sayıldı (ÖLÇÜM), intrinsic ve yürütme
ondan aritmetikle çıktı. Dayanak: aynı dosya `:1546-1548`

**Sınır:** yürütme bileşeni frame bazında ölçülmedi, aritmetikle türetildi.
Trace alınmadı (`:1596-1600`).

### 5.3 Uzlaştırılmış yürütme farkları — sapma sıfır

Karşılaştırma yürütme bileşenleri üzerinde yapılır. Üç koşu üç **farklı**
alıcıda ölçüldüğü için `z` değerleri farklıdır; intrinsic arındırılmadan
farklar karşılaştırılabilir değildir.

| büyüklük | B − A | C − B | C − A | etiket |
|---|---|---|---|---|
| **uzlaştırılmış yürütme farkı** | **2.500** | **25.000** | **27.500** | HESAP |
| **sapma** | **0** | **0** | **0** | — |
| ham `gasUsed` farkı (şeffaflık satırı) | 2.452 | 25.096 | 27.548 | HESAP |

Dayanak: `…sprint4-gas-table-and-second-tx.md:1644-1650`; ham farklar § 5.1'in
üç ölçümünden aritmetikle.

**Ham fark satırı neden duruyor:** ham farklar hiçbir yuvarlak sayıya oturmaz,
oturması da beklenmez. Satır uzlaştırmanın neyi değiştirdiğini görünür kılıyor;
gizlemek "sayılar tam çıktı" izlenimini hak edilmemiş biçimde güçlendirirdi.

**EIP sabitleriyle örtüşme.** Üç fark, EIP-2929'un soğuk hesap erişimi
(`2.600 − 100 = 2.500`) ve boş hesap oluşturma (`25.000`) kalemleriyle birebir
örtüşüyor (`:162-163`). Etiket: **ÇIKARIM** — bu sabitler **EIP metinlerine
karşı doğrulanmadı** (§ 8 madde 5). Örtüşme, ölçülmüş farklar ile doğrulanmamış
sabitler arasındadır; sabitler yanlışsa örtüşme de yanlış olur.

> **Rapora GİRMEYEN kalem.** `eth_estimateGas` farkları (`+2.520`, `+25.198`)
> ve bunları açıklayan `est()` çarpanı (`×1,0079`) rapora alınmadı — § 5.3
> ölçümler üzerine kurulduğu için gerekmiyor. Kaynağı duruyor: aynı dosya
> `:292-294` (tahmin tablosu) · `:302-327` (eps ölçümü) · `:1652-1660`
> (sapmanın kaynağı).

### 5.4 İki ön kayıtlı tahmin, sıfır fark

B ve C satırlarının `gasUsed` değeri işlemden **önce** yazıldı ve ikisi de
sıfır farkla tuttu.

| satır | beklenti | ölçülen | fark |
|---|---|---|---|
| B (nonce 5) | ön kayıtta yazılı | 218.721 | **0** |
| C (nonce 6) | ön kayıtta yazılı | 243.817 | **0** |

Etiket: **ÖLÇÜM** · Dayanak: `…sprint4-gas-table-and-second-tx.md:1295-1296` ·
`docs/evidence/crypto-tests/sprint4-recorded-demo-run.md` ·
`docs/evidence/crypto-tests/sprint4-c-row-measurement.md` ·
`docs/evidence/tx-hashes.md:35-50`

Yöntem § 4'te. İki isabet, yöntemin beklentiyi sonuca uydurmadığını gösterir;
modelin her koşuda tutacağını göstermez (§ 4.5).

### 5.5 `233.429` → `216.269` köprüsü

17.160 gas farkının tamamı kalansız kapanıyor: 17.100 ilk nonce yazımı
(`SSTORE_SET` − `SSTORE_RESET`) + 60 calldata.

Etiket: uçlar **ÖLÇÜM**, bölme **ÇIKARIM** (SPEC sabitlerine dayanıyor,
ayrıca ölçülmedi — "hesaplanmış eşleşme").
Dayanak: `…sprint4-gas-table-and-second-tx.md:1765-1826` (28 Eylül 2026
tarihli ek); ekin kendi kaynağı `docs/handoff/2026-09-27-devir.md:192-222`.

### 5.6 `216.221` ile `216.269` çelişmiyor

İki **ayrı** işlem, farklı bloklar. 48 gas fark = 4 sıfır bayt × 12 gas,
kalansız. README'nin `216.221`'i doğrudur ve düzeltilmeyecek.

Etiket: iki `gasUsed` **ÖLÇÜM**; `z(216.221) = 210` **ÇIKARIM** (ham
calldata hiçbir uçtan okunamadı).
Dayanak: aynı dosya `:1680-1760`

### 5.7 `88.247` nedir — Foundry tablosu ile canlı ölçüm neden 2,5 kat ayrı

`docs/RAPOR_HAM_ICERIK.md` Böl. 5'teki `88.247`, canlı ölçümle
karşılaştırılabilir bir sayı değildir. Böl. 5'in kendisi üç sınırını
yazmış: doğrulama **sıfır** sayılmış (`MockVerifier`), intrinsic (21.000)
**dahil değil**, calldata **dahil değil**. Ayrıca `88.247` **Max** kolonudur,
tipik değer değil.

Suite'in `execute` çağrılarının **260'ının 260'ı** tek baytlık sahte imza
(`hex"00"`) ve `MockVerifier` kullanıyor; 260 çağrının ~256'sı fuzz'dan geliyor
(ÖLÇÜM, `docs/handoff/2026-09-27-devir.md:176-190`).

Etiket: **ÖLÇÜM** (suite çıktısı) · Dayanak: `docs/RAPOR_HAM_ICERIK.md:111-126` ·
`docs/evidence/gas-reports/sprint2.txt` ·
`docs/evidence/gas-reports/sprint3-execute-real-gas.md`

Jüri "iki yerde iki farklı sayı" derse cevap: iki sayı aynı şeyi ölçmüyor.
Foundry tablosu doğrulama maliyetini sıfır sayar ve işlem taban maliyetini
görmez; canlı ölçüm ikisini de içerir.

**Açık kalan:** `147.313 + 81.116 = 228.429` ile ölçülen `233.429` arasındaki
**5.000 gas** açıklanmadan duruyor. `vm.cool` bu farkı üretemedi. Sebep
**ölçülmedi** ve bu raporda bir açıklaması yoktur (§ 8 madde 4).

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

**Sahibi:** Akif · **Bütçe:** ~130 satır (ÖLÇÜM; eski hedef ~45, bkz. bölüm haritası)

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

İki koşu birbirinin tekrarı değil: 17 Eylül çalışma ağacının kopyasıydı ve
yalnızca "bu makinede kurulum tutuyor mu" sorusunu kapatır; 18 Eylül **ağdan
taze klondur** ve jürinin koşulunu taklit eder — `npm i` yerel önbelleği
kullanıp 1 sn'de bittiği için önbellek boş bir dizine zorlanıp yeniden
ölçülmüştür (16 sn, `:59-70`). Ölçüm, jürinin göreceği süredir.

### 7.4 Çalıştırma adımları

**Frontend** (`cwd: frontend/`, Rust ön koşulu yok — WASM çıktısı depoda):

```bash
npm i
cp .env.example .env          # el düzenlemesi YOK, anahtar gerekmiyor
npx vite build                # ÖLÇÜM 28 Eylül 2026: 181–256 ms (üç koşu)
npx vite                      # sayfa
node src/format-test.mjs                       # 8 assertion
node src/tx/build-transaction-test.mjs         # 21 assertion
node src/tx/send-transaction-test.mjs          # 99 assertion
node src/components/mnemonic-reveal-test.mjs   # 57 assertion
node src/crypto/wasm-signer-test.mjs           # keygen + sign, imza 3.688 bayt
```

Assertion sayıları **ÖLÇÜM**: ilk üçü 28 Eylül 2026,
`mnemonic-reveal-test.mjs` **29 Eylül 2026** (dördü de çıkış 0).
`npm run dev` **yoktur** — `package.json`'da `scripts` alanı tanımlı değil
(`docs/FRONTEND-KURULUM.md:50-51`). `pqwallet-test.mjs` `CAST_EXPECTED`
olmadan **bilerek** patlar: `cast`, bu paketin `ethers`'tan bağımsız tek
oracle'ıdır ve koşullu atlanan kontrol yapılmamış kontroldür
(`docs/FRONTEND-KURULUM.md:132-138`).

> **Sayı uyuşmazlığı, kayda geçsin.** `docs/FRONTEND-KURULUM.md:128` ve
> `sprint4-ok2-clean-clone.md:81` `send-transaction-test.mjs` için **83**
> assertion yazıyor; bugün ölçülen **99**. Suite 18 Eylül'den sonra büyüdü,
> iki satır eskidir — testin kendisinde bir sorun değil, belge güncellemesi
> açık kalemdir.

**Kontratlar** (`cwd: contracts/`): `forge test` → **6 suite, 35 test, 0 fail**
(ÖLÇÜM, 18 Eylül 2026 temiz klon, `sprint4-ok2-clean-clone.md:85`).
Foundry komutları depo kökünden değil `contracts/` içinden koşar
(`docs/DECISIONS.md:233`).

### 7.5 Bizden bağımsız doğrulanabilecekler

Bu raporun iddialarının üç ayağı **bize sormadan** kontrol edilebilir:

| iddia | bağımsız kaynak | sınırı |
|---|---|---|
| Kontratlar bu kaynaktan derlendi | Etherscan "Verified" kaynağı vs. `contracts/src/` | — |
| İşlemler gerçekten yapıldı, `gasUsed` bu | herhangi bir **arşiv** Sepolia düğümü, tx hash ile | ücretsiz uçlar ~30 saat sonra receipt'i budar (yukarıdaki kutu) |
| Ön kayıt işlemden **önce** yazıldı | GitHub olay akışı, `created_at` vs. blok zamanı (**§ 4.2**) | akış kayıtları sınırlı süre tutulur; nonce 7'nin push'ları 28 Eylül okumasında akışta **yoktu** |

Üçüncü satır yöntemin en kırılgan ayağıdır ve § 4.1'deki `pushed_at`
tutanağının yerine geçmez, onu **destekler**: tutanak bizim tuttuğumuz bir
kayıttır, olay akışı üçüncü tarafın. İkisi de aynı yönü gösteriyor
(push işlemden 73 ve 30 dk önce), ama ikisi de kalıcı değildir.

---

## 8. Sınırlar ve açık kalemler

**Amaç:** jürinin sorabileceği her zayıf noktayı bizim önce söylememiz.
Bu bölüm gizlenmez ve kısaltılmaz.

**Sahibi:** Akif · **Bütçe:** ~60 satır, 14 kalem

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
| 14 | **Göster/gizle bağlamasının otomatik regresyon ağı yok** — modül testi (57 assertion) modülü korur, `main.js` bağlamasını değil; jsdom kurulu değil | SINIR | `frontend/src/components/mnemonic-reveal-test.mjs:7-9` |

### 8.1 Her maddenin üç sorusu

Bir sınırı yazmak yetmez: ne ölçülmediği, neden önemli olduğu ve **nasıl
ölçüleceği** birlikte durmazsa okuyan kişi maddenin ağırlığını tartamaz.

| # | ne ölçülmedi | neden önemli | nasıl ölçülür |
|---|---|---|---|
| 1 | A/B/C satırlarının ikinci koşusu | Tek koşu bir dağılım vermez; tablo "bu koşuda böyleydi" der, "her zaman böyle" diyemez | Aynı üç alıcı koşulu aynı nonce sırasıyla ikinci kez gönderilir; fark `gasUsed` cinsinden yazılır |
| 2, 3 | Yürütme bileşeninin frame bazlı trace'i; `nonce++`'ın kendi maliyeti | Yürütme sayısı **aritmetikle** türetildi (`gasUsed − intrinsic`); içindeki kalemler ayrıştırılmadı, `nonce++` üç koşuda aynı **varsayıldı** | Arşiv düğümünde `debug_traceTransaction` (`callTracer` + `structLogs`); `SSTORE` adımı tek başına okunur |
| 4 | Açıklanmayan **5.000 gas** | Uzlaştırmanın kalanı; sayı kapanmadıkça "her gas kalemi anlaşıldı" denemez. `vm.cool` bu farkı üretemedi | Aynı işlem arşivde trace'lenip `SSTORE` erişim durumu (soğuk/sıcak) ve `SELFBALANCE`/`CALL` kalemleri tek tek toplanır |
| 5 | EIP sabitlerinin **spec metnine karşı** teyidi (5 satır) | Sayılar doğru çıksa bile dayanakları ikinci elden; jüri "bu sabiti nereden aldın" diye sorar | EIP-2929/3529/7623 metinleri ve `SSTORE_SET`/`SSTORE_RESET` değerleri Yellow Paper + EIP metninden satır satır alıntılanır |
| 6 | **−1 gas**'ın sebebi (B'de −1, C'de 0) | Küçük ama açıklanmamış bir sapma; formülün bir yerinde yuvarlama mı, sayım mı olduğu bilinmiyor | Ham calldata arşivden çekilip `z` elle sayılır; formül aynı girdiyle yeniden yürütülür |
| 7 | `0x320e03d9…` işleminin ham calldata'sı | `z(216.221) = 210` bir **ÇIKARIM**'dır; beş uç denendi, üçü bilinen-iyi hash'lerde de `null` döndü | Arşiv düğümünde `eth_getTransactionByHash` → `input` alanı; sıfır/sıfırdışı bayt sayımı tekrarlanır |
| 8 | WASM'ın **çapraz-makine** determinizmi | Depoya konan ikili çıktı, jürinin kendi makinesinde bit-aynı üretilmezse "kaynaktan derlenebilir" iddiası zayıflar | İkinci bir makinede `bash scripts/build-wasm.sh`, ardından `sha256sum` karşılaştırması |
| 9 | PQWallet'ın **kendi** revert'iyle `receipt.status === 0` | İddia kaynak okumasına dayanıyor, gözleme değil; hata yolunun ekranda nasıl göründüğü hiç görülmedi | Bilerek bozuk imzayla gerçek bir `execute()` gönderilir (gas yakar) ve receipt okunur |
| 10 | Gerçek **390 px** cihaz görünümü | `@media (max-width:420px)` kuralları yazıldı ama hiç koşulmadı; headless Chrome macOS'ta 500 CSS px altına inmiyor | Chrome cihaz görünümünde 390 px'te hero/menü/panel/SSS elle gezilir ya da `playwright` kurulup kare alınır |
| 11 | **Performance kaydı** | "WASM ana iş parçacığını ~9,3 sn bloke ediyor" bir ÇIKARIM; 9.303,4 ms **imzalama süresidir**, bloklama kanıtı değil | DevTools → Performance kaydı, imzalama penceresinde uzun görev (long task) ve boyama aralıkları okunur |
| 12, 14 | Tarayıcıya bağlı davranışın testle korunması | `nextPaint` kaldırılınca 8/21/99 kırılmadı; göster/gizle bağlaması da aynı boşlukta — Node'da boyama ve `document` yok | jsdom ya da `playwright` kurulup gerçek DOM'da koşulur; kod donduğu için bu Sprint 5 kalemidir |
| 13 | Bağımsız profesyonel denetim | İnceleme kendi ekibimizce yapıldı; bulunan şey bulunmayanın kanıtı değil | Üçüncü taraf denetim; kapsam dışı ve bu raporda **iddia edilmiyor** |

### 8.2 Bugünkü elle kontroller (28 Eylül 2026)

Kod donmadan önceki son frontend turunda üç liste elle koşuldu:

| liste | konu | sonuç |
|---|---|---|
| **A** | Göster/gizle akışının dört durumu, içe aktarma sonrası kelime taraması | **TEMİZ** (Akif, 28 Eylül) |
| **B** | Kum saati ~9 sn imza boyunca dönmeye devam ediyor mu (3 adım) | *[Akif yazacak]* |
| **C** | 390 px: hero, menü aç/kapa, panel, sonuç kartları, SSS | *[Akif yazacak]* |

**B ve C bu satır yazılırken ölçülmemiştir.** Yukarıdaki 10 ve 11 numaralı
maddeler bu iki liste kapanana kadar **açık** sayılır; sonuç geldiğinde
buraya ÖLÇÜM olarak yazılır, madde 10/11 ona göre güncellenir. Boş kalan
hücre, olumlu sonucun yerine geçmez.

---

## 9. Güvenlik notları

**Amaç:** neyin korunduğunu ve neyin korunmadığını ayrı ayrı yazmak.

**Sahibi:** Akif · **Bütçe:** ~95 satır

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

### 9.1 Mnemonic kuralı — iki ayrı yol, iki ayrı kural

Sayfada mnemonic'in iki yolu var ve **aynı kurala tabi değiller**. Ayrım
kasıtlıdır: biri zincirdeki cüzdanın gerçek sahibinin anahtarıdır, diğeri
sayfada o an üretilen atılabilir bir anahtar.

**İçe aktarılan owner mnemonic'i: hiçbir koşulda gösterilmez.** Alan
`type="password"`, girilen değer doğrulamadan hemen sonra temizlenir, hata
mesajları **sabit metindir** (istisna nesnesi bilerek yakalanmaz — mesajı
girdiyi taşıyabilir), ve içe aktarmadan sonra gösterme yüzeyi kapanır.
Gerekçesi kontratta: `ownerPublicKey` yalnız constructor'da yazılıyor, setter
yok — sızarsa çaresi rotasyon değil, **yeniden deploy**'dur.
ÖLÇÜM: kanarya denetiminde mnemonic üç yüzeyin hiçbirinde görünmedi
(`docs/evidence/crypto-tests/sprint3-owner-mnemonic-import-leak-audit.md:82-92`).

**Deneme anahtarı: istek üzerine gösterilir.** Bu yol **28 Eylül 2026'da,
Hakan'ın önerisiyle** eklendi — yarışma sonrası bir ekleme değil, kod donmadan
önceki son frontend turunun kalemidir. Davranışı:

- Varsayılan hâl: kelimeler **DOM'da yoktur**. Bulanık metin, nokta maskesi ya
  da kısaltma da yazılmaz; maskenin uzunluğu bile bilgi sızdırır.
- "Göster" 12 kelimeyi numaralı ızgaraya yazar, üstünde "Deneme anahtarı: bu
  kelimeleri gerçek varlık için kullanmayın" uyarısıyla.
- Dört tetikleyici kelimeleri **DOM'dan siler**: "Gizle", 30 saniyenin
  dolması, yeniden üretim, owner anahtarının içe aktarılması.
- **Kopyala** butonu ızgaranın *içinde* üretilir; bu yüzden dört silme
  durumunun hepsinde kelimelerle **aynı tek satırla** kalkar, ayrı bir
  temizleme yoluna ihtiyaç duymaz. Panoya giden değer `words.join(' ')` —
  küçük harf, tek boşluk; içe aktarma alanı BIP-39'u katı okuduğu için
  kopyalanan ifade doğrudan yapıştırılabilir olmalı. Sonuç yalnız butonun
  etiketinden okunur ("Kopyalandı" / "Kopyalanamadı", 2 sn sonra eski hâline
  döner); ifade ne konsola ne hata mesajına yazılır.
- Gösterme yüzeyi `currentMnemonic`'i değil ayrı bir `trialMnemonic`
  değişkenini okur. Koruma tek bir koşula değil değişkenin kimliğine dayanır:
  içe aktarılan ifade oraya hiçbir yoldan yazılmaz.

**Kanıtı ve kanıtın sınırı.** Modülün dört silme durumu ve Kopyala butonu
otomatik testte: **57 assertion, çıkış 0** (ÖLÇÜM, 29 Eylül 2026). Silme
satırı (`mnemonicReveal.js:56`) kaldırılınca **15 assertion kırmızı**, 42
yeşil, çıkış 1 — mutasyon testi, test gerçekten o satırı koruyor (ÖLÇÜM,
29 Eylül 2026; mutasyon donmuş dosyanın kopyasında yapıldı, `frontend/`
altındaki md5'ler değişmedi). Ama bu test modülün
mantığını kanıtlar, `main.js`'teki **bağlamayı** kanıtlamaz: jsdom kurulu
olmadığı için butonun hangi değişkeni okuduğu Node'da görülemez. Bağlama
**yalnız tarayıcıda** doğrulandı (28 Eylül, liste A: dört durum + içe aktarma
sonrası kelime taraması, temiz). Otomatik regresyon ağı yok — § 8 madde 14.

### 9.2 Kontrat tarafı: geri dönüşü olmayan üç nokta

1. **Owner açık anahtarı için setter yok.** Rotasyon = yeniden deploy; bedeli
   yeni adres, yeniden doğrulama ve `tx-hashes.md`'nin baştan yazılmasıdır.
   Canlıda iki kez yapıldı, operasyonel olarak yönetilebilir olduğu görüldü.
2. **Kurtarma mekanizması yok.** Mnemonic kaybolursa cüzdandaki varlıklara
   erişilemez; sosyal kurtarma ya da zaman kilidi **kapsam dışıdır** ve
   eklenmiş gibi sunulmaz.
3. **Self-migration kalıcı kilit.** Kendi adresini kendine migrate eden hesap
   `AlreadyMigrated` yüzünden bir daha gerçek bir PQ cüzdanına geçemez
   (`contracts/src/Migration.sol:27,45-46`). Saldırgan yolu yok — kurbanın
   kendi imzası gerekir — ama zararsız da değil. Kasıtlı olarak belgelendi,
   düzeltilmedi; redeploy bedeli finale göre gereksiz görüldü.

### 9.3 Kuantum-güvenli olmayan iki yer — bilerek

**Gası ödeyen taraf klasik bir ECDSA hesabıdır.** `execute()` `msg.sender`'a
bakmaz; yetki tamamen SPHINCS-/C13 imzasından gelir. Ödeyen EOA'nın
kuantum-güvenli **olması gerekmiyor**, çünkü yetki taşımıyor: kuantum
saldırganı o anahtarı kırsa bile cüzdandaki parayı hareket ettiremez,
yalnızca kendi gazını harcar. Taşıma katmanı kuantum-güvenli değildir ve
öyleymiş gibi sunulmamalıdır.

**Migration'ın kendisi ECDSA kanıtına dayanır.** `proveOwnership()` eski
adresin sahipliğini `ecrecover` ile doğrular
(`contracts/src/Migration.sol:45,79`) — yani tam olarak § 1'in "kırılacak"
dediği varsayımın üstünde durur. Bu bir çelişki değil, bir **sıralama
koşuludur**: migration, tehdit gerçekleşmeden önce yapılmak zorundadır.
Kuantum saldırganı ECDSA'yı kırabildiği gün eski adresin sahipliğini o da
kanıtlayabilir; o noktadan sonra migration bir kurtarma yolu değildir.
Bu sınır kapatılmadı, **yazıldı**.

### 9.4 Bu bölümün sınırı

Yukarıdakiler bizim kendi incelememizin sonucudur. **Bağımsız profesyonel
denetim yapılmadı** (`docs/ARCHITECTURE.md:112-115`); bulunmayan bir açık,
olmadığının kanıtı değildir. C13'ün araştırma varyantı olmasından gelen
güvenlik sınırları ayrıca § 3.4'te duruyor.

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
   **Sürüm/revizyon depoda kayıtlı değil**; atıf bölüm (Ek F) düzeyindedir.
4. NIST, **FIPS 205** — *Stateless Hash-Based Digital Signature Standard
   (SLH-DSA)*, Federal Information Processing Standards Publication 205,
   Ağustos 2024. Bu raporda ayrıca § 11.2.2'nin sıkıştırılmamış 32 baytlık
   ADRS düzenine atıf var (`contracts/lib/sphincs-minus/CLAUDE.md:85`).
5. M. Kudinov ve J. Nick, "Hash-based Signature Schemes for Bitcoin",
   *Cryptology ePrint Archive*, Paper **2025/2203**, 2025.
   **WOTS+C / FORS+C** yapısının kaynağı — checksum zincirlerini grinding ile
   kaldıran ve son auth path'i atlayan aile.
   Künye: `contracts/lib/sphincs-minus/writeUp.md:296`. Aynı çalışma depoda
   ikinci bir kayıtta "Blockstream SPHINCS+ Parameter Exploration, Authors:
   Blockstream Research" olarak da geçiyor
   (`contracts/lib/sphincs-minus/sphincs_parameters_paper_corpus.md:40-42`,
   kod deposu `github.com/BlockstreamResearch/SPHINCS-Parameters`).
6. N. Consigny, "SPHINCs-: Efficient Stateless Post-Quantum Signature
   Verification on the EVM", *Companion paper*, 2026 —
   `contracts/lib/sphincs-minus/writeUp.md:294`. Bu projenin kullandığı
   **C13** parametre seçiminin (`h=22 d=2 a=19 k=7 w=8`) ve EVM
   doğrulayıcısının kaynağı; `nconsigny/sphincs-minus` deposu.
   **Resmî FIPS 205 setlerinden biri değildir.**

> **Künye düzeltmesi, kayda geçsin.** Bu raporun daha önceki taslakları ve
> `CLAUDE.md:34` ePrint 2025/2203'ü **Consigny'ye** atfediyordu. Depodaki iki
> kayıt bunu desteklemiyor: 2025/2203 Kudinov & Nick / Blockstream Research
> çalışmasıdır [5], Consigny'nin katkısı ayrı bir companion paper ve bu depodur
> [6]. C13'ün *araştırma varyantı olduğu* ve FIPS 205 seti olmadığı iddiası
> **değişmiyor** — değişen, hangi künyenin hangi katkıya ait olduğudur.
> `CLAUDE.md` ortak dosyadır, bu oturumda **dokunulmadı**; düzeltilmesi
> Akif–Hakan kararıdır.

---

## Ek A — Kanıt dizini

`docs/evidence/crypto-tests/` altındaki **23 kanıt notu** (ÖLÇÜM, 28 Eylül
2026; `.gitkeep` hariç):

Tarih sütunu **dosyanın kendi `**Tarih:**` alanıdır**; uzun notların tarihli
ekleri sonraki günlere uzar (defter kuralı, § 4.5).

| # | not | tarih | ne kanıtlıyor | raporda |
|---|---|---|---|---|
| 1 | `sprint0-noble-post-quantum-risk-test.md` | 19 Ağu 2026 | `@noble/post-quantum` yalnız altı standart FIPS 205 setini veriyor, C13'ü üretemiyor — kendi imzalayıcımızın gerekçesi | § 3.1, § 3.3 |
| 2 | `sprint1-frontend-keygen-sign-ui.md` | 23 Ağu 2026 | keygen/sign akışı tarayıcıda çalışıyor | § 2 |
| 3 | `sprint1-wasm-signer-test.md` | 19 Ağu 2026 | WASM imzalayıcı C13 anahtarı üretiyor ve imzalıyor | § 3.3, § 7.4 |
| 4 | `sprint2-js-digest-function.md` | 23 Ağu 2026 | JS digest'i Foundry `cast` ile bağımsız olarak doğrulandı | § 2, § 7.4 |
| 5 | `sprint2-onchain-roundtrip.md` | 23 Ağu 2026 | tarayıcıda üretilen gerçek imza, zincirdeki gerçek doğrulayıcıdan geçiyor | § 2 |
| 6 | `sprint2-pqwallet-real-verifier-integration.md` | 26 Ağu 2026 | `execute()` sahte değil **gerçek** doğrulayıcıyla entegre | § 2 |
| 7 | `sprint3-end-to-end-transaction.md` | 13 Eyl 2026 | uçtan uca ilk gerçek işlem (nonce 0→1, 233.429 gas) | § 5.5, § 7.2 |
| 8 | `sprint3-live-signature-verification.md` | 4 Eyl 2026 | canlı Sepolia kontratlarına karşı imza doğrulaması | § 2 |
| 9 | `sprint3-metamask-connection.md` | 8 Eyl 2026 | MetaMask bağlantısı ve bağlantı sonrası ağ/hesap değişiminin yakalanması | § 2 |
| 10 | `sprint3-negative-proof.md` | 13 Eyl 2026 | bozuk imza reddediliyor — **aynı yoldan**, tek yol ilkesiyle | § 9 tablosu |
| 11 | `sprint3-owner-key-rotation.md` | 1 Eyl 2026 | "public key kesilmiş" bulgusunun çürütülmesi + rotasyonun canlıda iki kez yapılabildiği | § 9.2 |
| 12 | `sprint3-owner-mnemonic-import-leak-audit.md` | 5 Eyl 2026 | içe aktarılan mnemonic üç yüzeyin hiçbirinde görünmüyor (kanarya, otomatik) | § 9.1 |
| 13 | `sprint3-sepolia-readonly-connection.md` | 28 Ağu 2026 | frontend'in salt-okunur zincir bağlantısı | § 2 |
| 14 | `sprint3-three-shields.md` | 12 Eyl 2026 | üç kalkan (nonce · canlı digest · `eth_call` ön-uçuş) ve sırası | § 9 tablosu, § 8 madde 9 |
| 15 | `sprint3-transaction-builder.md` | 28 Ağu 2026 | işlem oluşturma ve imzalama akışı | § 2 |
| 16 | `sprint3-ui-chain-rewiring.md` | 5 Eyl 2026 | cüzdan adresi config'ten, nonce zincirden — ekranda sabit değer kalmadı | § 2 |
| 17 | `sprint4-browser-signing.md` | 20 Eyl 2026 | WASM imzalayıcı tarayıcıda koştu; imza beş koşunun beşinde de 3.688 bayt | § 7.3 |
| 18 | `sprint4-c-row-measurement.md` | 24 Eyl 2026 | **C satırı** (nonce 6, 243.817) ve ön kayıtlı beklentinin ikinci kez sıfır farkla tutması; `−1 gas` gözlemi | § 5.1, § 5.4, § 8 madde 6 |
| 19 | `sprint4-gas-table-and-second-tx.md` | 14 Eyl 2026 ‡ | gas tablosunun gövdesi: A satırı, intrinsic ayrıştırması, uzlaştırma, `z` sayımı, ön kayıt formülü | § 5.1–§ 5.7, § 4.3 |
| 20 | `sprint4-number-format-and-status-labels.md` | 24 Eyl 2026 | sayı biçimi ve DURUM etiketleri; kanaryanın **görsel** olduğu şerhi | § 9.1 |
| 21 | `sprint4-recorded-demo-run.md` | 24 Eyl 2026 | **B satırı** (nonce 5, 218.721): kayıtlı demo koşusu, ön kayıt birebir tuttu | § 5.1, § 5.4, § 6 |
| 22 | `sprint4-screen-consistency.md` | 15 Eyl 2026 | bayat imza bloğu bulgusu (`invalidateSignature`) ve arşiv düğümü gereksinimi | § 7.2 kutusu |
| 23 | `sprint4-untested-branches.md` | 16 Eyl 2026 | hangi dalların **hiç gözlenmediği** — `status = 0` dahil | § 8 madde 9 |

‡ Bu notta `**Tarih:**` alanı yok; 14 Eylül 2026 dosyanın başındaki plan
dosyası adından okundu (`…plans/2026-09-14-sprint4-demo-measurement-report.md`).

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
