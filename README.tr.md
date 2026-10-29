<div align="center">
  <img src="public/favicon.svg" width="64" alt="Halil Hodja" />
  <h1>Halil Hodja</h1>
  <p><strong>GitHub hikâyen, güzel bir anlatımla.</strong></p>
  <p>Gerçek kod boyutu. Açık hesaplama yöntemi. Şık README kartları.</p>
  <a href="https://halil-hodja.halilozel1903.chatgpt.site/?locale=tr">Kart stüdyosu</a> · <a href="README.md">English / tam API rehberi</a>
</div>

![Gerçek GitHub verisi, 28 Ekim 2026 tarihli anlık görüntü; kod boyutu ve Readme Stats uyumlu kapsam](docs/preview-overview.svg)

## Dil yüzdeleri nasıl hesaplanıyor?

**Varsayılan artık repo adedi değil, GitHub’ın dosyalar için bildirdiği dil bazındaki kod boyutudur (bayt).** Dosya sayısı veya satır sayısı değildir.

[`github-readme-stats-fast`](https://github.com/Pranesh-2005/github-readme-stats-fast) ile aynı varsayılan yöntem kullanılır:

1. GitHub’ın varsayılan oluşturulma sırasındaki ilk **100 açık, kullanıcıya ait, forksuz repo** alınır. Arşivlenmiş repolar varsayılan olarak dahildir.
2. Repo başına en büyük 10 dilin gerçek baytları toplanır.
3. En büyük `langs_count` dil seçilir. Her dilin yüzdesi **gösterilen dillerin toplam baytına** bölünerek hesaplanır.

```text
yüzde = dilin bayt toplamı / gösterilen dillerin bayt toplamı × 100
```

Bu yöntemle kontrol sırasında ekran görüntüsündeki sonuçlar birebir elde edildi: **Swift %34,12 · Kotlin %32,31 · Java %25,19 · Objective-C %8,37**. Bunlar tarihli doğrulama sonuçlarıdır; uygulamada sabit yazılmış sayılar değildir.

İki ayarı değiştirebilirsin:

| Ayar | Varsayılan | Alternatif |
| --- | --- | --- |
| Repo kapsamı | `coverage=legacy100`: Readme Stats uyumu, ilk 100 forksuz repo | `coverage=all`: taramadaki tüm uygun repolar ve tüm diller |
| Yüzde kapsamı | `percentage=shown`: gösterilen diller yaklaşık %100 eder | `percentage=all`: tüm diller paydada kalır; gizlenenler “Diğer” olur |

“Tüm uygun repolar” daha yeni repoları da içerir; oranlarının ilk 100 hesabından farklı olması normaldir. `metric=repos` ile ana dil başına repo sayısı isteğe bağlı olarak seçilebilir. **1.1 sürümünde son 20 repo örneklemesi kullanılmaz.**

## İstatistiklerin kapsamı

Repo sayısı, yıldız ve fork toplamları filtrelere uyan tüm açık, kullanıcıya ait repolardan hesaplanır. `coverage` yalnızca dil hesabını sınırlar. Takipçi verisi JSON’da geriye uyumluluk için kalır; kartta gösterilmez. Özel repolar hesaba katılmaz. Örneğin **1.174** yıldızın başka kartta **1.2k** görünmesi yuvarlama olabilir.

Tarama sınırı 1.000 repodur; sınır aşılırsa `scope.truncated` belirtilir. İlk 100 uyum modu dil kapsamının sınırlı olduğunu `scope.complete=false` ile açıklar. GitHub hata verirse hata gösterilir; sahte veri, sıfır veya sessiz bir örneklem devreye girmez.

## Daha anlamlı geliştirici istatistikleri

Spotlight kartında takipçi yerine şu bilgiler bulunur:

- **Açık commit · 365 gün:** toplama günü dahil 365 UTC takvim gününde, GitHub katkı kurallarına göre kullanıcıya yazılan herkese açık commit katkıları. Her daldaki bütün commit'ler değildir.
- **Katkı serisi:** GitHub profilinin anonim olarak görülebilen katkı takvimindeki art arda aktif günlerdir. Commit, PR, inceleme ve profil sahibinin herkese açtığı anonim özel katkı sayıları dahil olabilir. Yalnızca açık commit günlerini değil, profildeki katkı grafiğini temel alır. Son aktif gün bugün veya dünse seri sürer (UTC).
- **En uzun seri:** son 365 gündeki en uzun katkı serisidir; tüm zamanların rekoru değildir. **Commit atılan gün** ise ayrıca yalnızca açık commit atılan günleri sayar.
- **Açılan PR:** kullanıcının başka açık repolar dahil tüm zamanlarda açtığı herkese açık PR'lar.
- **PR birleşme oranı:** birleşmiş açık PR sayısının tüm açık PR'lara oranı; PR yoksa oran uydurulmaz.

Dairesel gösterge güncel seriyi, bu dönemdeki en uzun seriyle karşılaştırır. A+/A gibi kapalı bir notlandırma veya resmi GitHub beceri puanı kullanılmaz. Özel repo düğümleri açık commit hesabından çıkarılır. Katkı takvimi anonim istekle okunur; profil sahibinin herkese açtığı özel katkı sayıları içerebilir, özel repo ayrıntılarına erişilmez. Takvim eksik veya erişilemezse katkı serisi kullanılamaz olarak kalır. Yedi günlük sorgu pencerelerinden biri 100 repo sınırını aşarsa veya veri eksikse açık commit sayıları kullanılamaz olarak kalır; eksik toplam tam sonuç gibi gösterilmez.

Aktivite verisi yoksa gerçek yıldız/repo/fork/dil sayıları kullanılır. Repo ve dil filtreleri hesap genelindeki PR/commit aktivitesini daraltmaz. Kart altındaki teknik ibareler kaldırıldı; kaynak tarihi, kapsam ve hesap yöntemi stüdyodaki ayrıntılarda, JSON'da, SVG erişilebilirlik açıklamasında ve bu rehberde bulunur.

## Yeni görünüm

Varsayılan `style=spotlight`: ikonlu aktivite kutuları ve katkı serisi halkası. `style=classic` sade görünümü korur. `chart=donut` halka, `chart=bar` sekiz dilde de satırların çakışmadığı çubuk grafiğidir. **Java altın sarısı (`#F7C65C`), Objective-C mavi (`#4DA8FF`)** olarak ayrıldı.

Spotlight boyutları: istatistik 440×360, dil kartı 500×360, birleşik kart 960×360. Klasik görünümün boyutları korunur. Stil değişikliği ham verileri veya yüzdeleri değiştirmez.

## Veri kaynağı ve güncellik

Büyük profillerin tüm dil baytlarını her ziyaretçide sorgulamak API kotasını tüketir. Resmi demo, [`data/profiles.json`](data/profiles.json) listesindeki profiller için **gerçek GitHub verilerinden üretilen zaman damgalı kayıtlar** kullanır. GitHub Actions iş akışı 6 saatte bir planlanır; açık repoları ve anonim herkese açık katkı takvimini okur; repo sorgularında geçici Actions token’ıyla çalışır. Kalıcı kişisel token web sunucusuna konmaz.

Kaynağın `generatedAt` zamanı aynen `updatedAt` olarak gösterilir; eski veri yeni toplanmış gibi sunulmaz. Actions zamanlaması gecikebilir. 24 saatten eski kayıt kabul edilmez, canlı sorgu denenir. Canlı sonuçlar ve kaynak okumaları en fazla bir saat önbellekte tutulabilir. Kaynak zamanı ve kapsam stüdyoda/JSON yanıtında görülebilir.

Diğer profiller için canlı sorgu yapılır. Sunucuda `GITHUB_TOKEN` varsa sayfalı GraphQL sorgusu tüm dil baytlarını verimli toplar. Token olmadan ortak IP kotası büyük hesaplarda dolabilir; tam tarama için token veya kendi planlı veri kaydını kullan. Demo kesintisiz hizmet garantisi vermez.

## Bağımsız doğrulama

GitHub CLI ile ayrı giriş yapıp çalıştır. CLI token’ı uygulamaya gönderilmez.

```sh
# Varsayılan uyum hesabı; SVG üzerindeki yüzdeler dahil kontrol edilir:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site

# Tüm repoların dil baytlarını bağımsız REST sorgularıyla karşılaştır:
npm run verify:live -- halilozel1903 https://halil-hodja.halilozel1903.chatgpt.site bytes all
```

Sayım, bayt toplamı veya gösterilen yüzde uyuşmazsa kontrol başarısız olur. [Doğruluk raporu](docs/ACCURACY.md) · [Hesaplanan açık kaynak veri](data/halilozel1903.json).

## README’ye ekle

```html
<div align="center">
  <img width="440" src="https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=halilozel1903&amp;type=stats&amp;theme=midnight&amp;locale=tr" alt="GitHub istatistikleri" />
  <img width="500" src="https://halil-hodja.halilozel1903.chatgpt.site/api/card?username=halilozel1903&amp;type=languages&amp;theme=midnight&amp;locale=tr&amp;coverage=legacy100&amp;percentage=shown&amp;langs_count=4" alt="Kod boyutuna göre diller — Readme Stats uyumu" />
</div>
```

Kendi kullanıcı adını yaz. Stüdyoda yedi tema, Spotlight/Klasik kart stilleri, halka/çubuk dil grafikleri, Türkçe/İngilizce, farklı düzenler, Markdown/HTML kodu, SVG indirme ve paylaşılabilir ayarlar bulunur.

## Kurulum ve yayınlama

Node.js 22.13+ ve npm gerekir.

```sh
git clone https://github.com/halilozel1903/halil-hodja.git
cd halil-hodja
npm run install:ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
```

Cloudflare Workers üzerinde bağımsız yayın; veritabanı veya ChatGPT Sites hesabı gerekmez:

```sh
node node_modules/wrangler/bin/wrangler.js login
npm run deploy:cloudflare
# Yayımlamadan paket kontrolü:
npm run deploy:cloudflare -- --dry-run
```

Canlı tam taramalar için yalnızca açık verilere erişen özel bir token tanımlayabilirsin:

```sh
node node_modules/wrangler/bin/wrangler.js secret put GITHUB_TOKEN --name halil-hodja
```

Yerelde token git tarafından yok sayılan `.dev.vars` dosyasına konur; URL’ye, tarayıcıya, `NEXT_PUBLIC_` değişkenine veya repoya yazılmaz.

Planlı veri toplamak için repoyu fork et, `data/profiles.json` listesini düzenle, Actions’ı etkinleştir ve veri yenileme iş akışını çalıştır. Sunucuda `SNAPSHOT_REPOSITORY=KULLANICI/REPO` ayarla; repo açık, dal `main` olmalı. Yerel toplama: `npm run data:refresh`. [Veri rehberi](data/README.md).

`.openai/hosting.json` resmi Sites yayınının açık kimliğidir; parola değildir. Bağımsız Cloudflare yayını bunu kullanmaz.

## API ve lisans

`/api/card?username=AD&type=stats|languages|overview` SVG; `/api/profile?username=AD` JSON verir. API’de `languages[].percent`, seçilen repo kapsamındaki **tüm dilleri** payda olarak kullanır; SVG’deki yüzde `percentage` ayarına göre hesaplanır. Ham baytlar görünür dil sayısından etkilenmez.

Tam parametreler: [API tablosu](README.md#api). Analitik/takip betiği veya kullanıcı hesabı yoktur. Barındırma/GitHub erişim kaydı tutabilir; stüdyo Google Fonts kullanır, SVG’ler dış font yüklemez.

[Katkı rehberi](CONTRIBUTING.md) · [Güvenlik](SECURITY.md) · [MIT lisansı](LICENSE). [Halil Özel](https://github.com/halilozel1903) tarafından geliştirildi.
