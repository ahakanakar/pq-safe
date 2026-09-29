# PQ-Safe marka varlıkları

Kaynak dosyalar. Frontend bunları **dosya olarak kullanmaz** — `frontend/index.html`
içindeki favicon ve nav işareti, `PQ-Safe_logo_isaret.svg`'nin path verisi birebir
kopyalanarak inline gömüldü (ek HTTP isteği yok). Bu SVG değişirse
`frontend/index.html`'deki iki kopya da elle güncellenmeli.

| Dosya | Ne zaman |
|---|---|
| `PQ-Safe_logo_isaret.svg` | Tek kaynak. İnline gömmelerin çıktığı yer. |
| `PQ-Safe_logo_isaret.png` | 1024×1024 işaret. Kare ikon gereken yerler. |
| `PQ-Safe_logo_koyu.png` | 2560×440 yatay kilit. Koyu zemin. |
| `PQ-Safe_logo_acik.png` | 2560×440 yatay kilit. Açık zemin. |

Palet: `#1b100b` (zemin), `#ff5a1f` (vurgu), `#c9b8ff` (leylak merkez) —
`frontend/index.html`'deki `--ground` / `--accent` / `--lilac` ile aynı.

## Boyuta göre kullanım — ölçülmüş

İşaretin içindeki ağaç 1 kök + 2 orta + 4 yaprak = **7 düğüm**; C13'ün `k=7`
parametresiyle örtüşüyor, bu yüzden düğüm sayısı sadeleştirme uğruna
**azaltılmadı**.

Chromium'da 2x ölçekte render edilip bakıldı (16/20/26/32/48/96 px):

- **≥48 px** — ağaç tam okunuyor. Kilit (`_koyu` / `_acik`) buraya girer.
- **26 px** — dallar ve düğümler seçiliyor, yoğun ama okunur. Nav işareti bu boyutta.
- **≤20 px** — ağaç çamura dönüyor; ayırt edici olan yalnızca turuncu anahtar
  deliği silueti. Favicon bu aralıkta, detayın kaybı kabul edildi.

Ağacı küçükte okunur kılan bir varyant denendi (çizgi kalınlaştırıp düğümleri
büyütmek); okunurluğu artırıyor ama 7 düğümü 3'e indiriyor. `k=7` bağı
koptuğu için **reddedildi**.

## Kapsayıcı koyu kare

- **Favicon'da var.** Sekme şeridinin kendi zemini açık da olabilir; kare
  olmadan turuncu siluet açık temada zemine karışıyor.
- **Nav'da yok.** Karenin rengi `#1b100b`, `.top-in`'in zemini
  `rgba(27,16,11,.72)` — düz zeminde ikisi aynı renge düşüyor. Kare ya hiç
  görünmez ya da altından içerik kayarken beliren bir artefakt olur.

## README için

GitHub açık ve koyu temada da doğru dursun diye `<picture>` ile:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo/PQ-Safe_logo_koyu.png">
  <img src="docs/assets/logo/PQ-Safe_logo_acik.png" alt="PQ-Safe" width="440">
</picture>
```
