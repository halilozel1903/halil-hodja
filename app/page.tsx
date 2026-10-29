"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Globe2,
  Layers3,
  LoaderCircle,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  CircleHelp,
  Link2,
  BookOpen,
} from "lucide-react";
import Github from "@/components/github-icon";
import { renderCard, themes, cardDimensions, CARD_REVISION } from "@/lib/hodja/cards.mjs";

type Locale = "en" | "tr";
type Theme = keyof typeof themes;
type Profile = Parameters<typeof renderCard>[0];
const source = "https://github.com/halilozel1903/halil-hodja";
const words = {
  en: {
    studio: "Card studio",
    docs: "Documentation",
    open: "Open source",
    badge: "YOUR CODE DESERVES THE SPOTLIGHT",
    heading: "Your GitHub.",
    emphasis: "A little more iconic.",
    intro:
      "Beautiful cards. Real GitHub data. A profile that feels unmistakably yours.",
    config: "Make it yours",
    configSub: "Small details. Your signature.",
    username: "GitHub username",
    theme: "Color palette",
    style: "Card style",
    spotlight: "Spotlight",
    classic: "Classic",
    chart: "Language chart",
    donut: "Donut",
    bars: "Bars",
    create: "Create your cards",
    count: "Languages to show",
    metric: "Measure languages by",
    coverage: "Repository coverage",
    full: "All eligible repositories",
    legacy: "Readme Stats compatibility · first 100",
    repos: "Repositories",
    bytes: "Code size (bytes)",
    percentage: "Calculate percentages within",
    shown: "Displayed languages (like Readme Stats)",
    all: "All detected languages",
    filters: "Fine-tune your data",
    forks: "Include forked repositories",
    archived: "Include archived repositories",
    exclude: "Exclude repositories",
    placeholder: "repo-one, repo-two",
    generate: "Generate my cards",
    generating: "Reading your GitHub…",
    preview: "Your canvas",
    live: "LIVE PREVIEW",
    both: "Card pair",
    stats: "Statistics",
    languages: "Languages",
    overview: "All-in-one",
    ready: "Ready for your README",
    embedSub: "Copy, paste, make yourself at home.",
    markdown: "Markdown",
    html: "HTML",
    url: "Image URL",
    copy: "Copy snippet",
    copied: "Copied!",
    download: "Download SVG",
    share: "Copy studio link",
    data: "Good data. No mystery.",
    dataSub: "Know exactly what your cards are saying.",
    public: "Public, by design",
    publicSub: "Public repositories and your visible profile contribution calendar.",
    precise: "A clear picture",
    preciseSub: "Real code bytes, with explicit repository coverage.",
    yours: "Yours to build on",
    yoursSub: "MIT licensed. Self-host it, fork it, make it better.",
    scope: "How these numbers are calculated",
    empty: "Your next great profile starts here.",
    emptySub: "Enter a GitHub username to create your cards.",
    retry: "Try again",
    dirty: "Settings changed. Generate to refresh your data.",
    footer: "Made with care by Halil Özel.",
    footerSub: "For the people who build things.",
    visit: "View on GitHub",
    refresh: "Live data cached up to 1 hour",
    snapshotRefresh: "Full scan scheduled every 6 hours",
    loading: "Gathering public repositories and languages…",
    advancedNote: "Separate repository names with commas.",
    generated: "Updated",
    noLogin: "No sign-in. No tracking. Just your work.",
    linkCopied: "Studio link copied",
    copyFailed: "Copy unavailable. Select and copy the snippet below.",
    documentation: "Everything you need to get started.",
    close: "Close documentation",
  },
  tr: {
    studio: "Kart stüdyosu",
    docs: "Dokümantasyon",
    open: "Açık kaynak",
    badge: "KODUN SAHNEYİ HAK EDİYOR",
    heading: "GitHub profilin.",
    emphasis: "Biraz daha ikonik.",
    intro: "Şık kartlar. Gerçek GitHub verisi. README’ne kendi imzanı at.",
    config: "Kendi tarzını yarat",
    configSub: "Küçük detaylar. Senin imzan.",
    username: "GitHub kullanıcı adı",
    theme: "Renk paleti",
    style: "Kart stili",
    spotlight: "Spotlight",
    classic: "Klasik",
    chart: "Dil grafiği",
    donut: "Halka",
    bars: "Çubuk",
    create: "Kartlarını tasarla",
    count: "Gösterilecek dil sayısı",
    metric: "Dil dağılımını hesapla",
    coverage: "Repo kapsamı",
    full: "Tüm uygun repolar",
    legacy: "Readme Stats uyumu · ilk 100",
    repos: "Repo sayısı",
    bytes: "Kod boyutu (bayt)",
    percentage: "Yüzde hesabının kapsamı",
    shown: "Gösterilen diller (Readme Stats gibi)",
    all: "Tespit edilen tüm diller",
    filters: "Verilerine ince ayar yap",
    forks: "Fork repolarını dahil et",
    archived: "Arşivlenmiş repoları dahil et",
    exclude: "Hariç tutulacak repolar",
    placeholder: "repo-bir, repo-iki",
    generate: "Kartlarımı oluştur",
    generating: "GitHub verilerin okunuyor…",
    preview: "Senin tuvalin",
    live: "CANLI ÖNİZLEME",
    both: "Kart çifti",
    stats: "İstatistikler",
    languages: "Diller",
    overview: "Hepsi bir arada",
    ready: "README için hazır",
    embedSub: "Kopyala, yapıştır, profilini güzelleştir.",
    markdown: "Markdown",
    html: "HTML",
    url: "Görsel URL",
    copy: "Kodu kopyala",
    copied: "Kopyalandı!",
    download: "SVG indir",
    share: "Stüdyo bağlantısını kopyala",
    data: "Şeffaf veri. Net sonuçlar.",
    dataSub: "Kartlarının ne anlattığını tam olarak bil.",
    public: "Herkese açık veriler",
    publicSub: "Açık repolar ve profilindeki görünür katkı takvimi.",
    precise: "Anlamlı bir görünüm",
    preciseSub: "Kapsamı açıkça belirtilen, gerçek kod baytları.",
    yours: "Geliştirmek için senin",
    yoursSub: "MIT lisanslı. Kendi sunucunda çalıştır, fork et, geliştir.",
    scope: "Bu sayılar nasıl hesaplanıyor?",
    empty: "Harika bir profil burada başlıyor.",
    emptySub: "Kartlarını oluşturmak için GitHub kullanıcı adını gir.",
    retry: "Tekrar dene",
    dirty: "Ayarlar değişti. Veriyi yenilemek için kartlarını oluştur.",
    footer: "Halil Özel tarafından özenle yapıldı.",
    footerSub: "Bir şeyler üreten herkes için.",
    visit: "GitHub’da incele",
    refresh: "Canlı veri en fazla 1 saat önbellekte",
    snapshotRefresh: "Tam tarama 6 saatte bir planlanır",
    loading: "Açık repoların ve dillerin toplanıyor…",
    advancedNote: "Repo adlarını virgülle ayır.",
    generated: "Güncellendi",
    noLogin: "Giriş yok. Takip yok. Yalnızca emeğin.",
    linkCopied: "Stüdyo bağlantısı kopyalandı",
    copyFailed: "Kopyalanamadı. Aşağıdaki kodu seçip kopyalayabilirsin.",
    documentation: "Başlamak için gereken her şey.",
    close: "Dokümantasyonu kapat",
  },
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [username, setUsername] = useState("halilozel1903");
  const [theme, setTheme] = useState<Theme>("midnight");
  const [count, setCount] = useState(4);
  const [style, setStyle] = useState("spotlight");
  const [chart, setChart] = useState("donut");
  const [metric, setMetric] = useState("bytes");
  const [percentage, setPercentage] = useState("shown");
  const [coverage, setCoverage] = useState("legacy100");
  const [forks, setForks] = useState(false);
  const [archived, setArchived] = useState(true);
  const [exclude, setExclude] = useState("");
  const [view, setView] = useState("pair");
  const [format, setFormat] = useState("markdown");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(
    "https://halil-hodja.halilozel1903.chatgpt.site",
  );
  const controller = useRef<AbortController | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = words[locale];

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast("");
      setCopied(false);
    }, 3000);
  }
  async function generate(params?: URLSearchParams) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const p =
      params ||
      new URLSearchParams({
        username: username.trim(),
        metric,
        coverage,
        forks: String(forks),
        archived: String(archived),
        exclude,
      });
    setBusy(true);
    setError("");
    try {
      const result = await fetch(`/api/profile?${p}`, {
        signal: abort.signal,
        cache: "no-store",
      });
      const data = (await result.json()) as Profile & { error?: string };
      if (!result.ok)
        throw new Error(data.error || "Could not load GitHub data.");
      setProfile(data);
    } catch (err) {
      if (!abort.signal.aborted) {
        setProfile(null);
        setError(
          err instanceof Error ? err.message : "Could not load GitHub data.",
        );
      }
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const u = p.get("username") || "halilozel1903";
    const m = p.get("metric") === "repos" ? "repos" : "bytes";
    setUsername(u);
    setStyle(p.get("style") === "classic" ? "classic" : "spotlight");
    setChart(p.get("chart") === "bar" ? "bar" : "donut");
    setOrigin(window.location.origin);
    setMetric(m);
    const c = p.get("coverage") === "all" ? "all" : "legacy100";
    setCoverage(c);
    setPercentage(p.get("percentage") === "all" ? "all" : "shown");
    if (
      ["pair", "stats", "languages", "overview"].includes(p.get("view") || "")
    )
      setView(p.get("view")!);
    if (p.get("locale") === "tr") setLocale("tr");
    if (p.get("theme") && themes[p.get("theme") as Theme])
      setTheme(p.get("theme") as Theme);
    const n = Number(p.get("langs_count") || 4);
    setCount(Number.isFinite(n) ? Math.min(8, Math.max(2, Math.floor(n))) : 4);
    setForks(p.get("forks") === "true");
    setArchived(p.get("archived") !== "false");
    setExclude(p.get("exclude") || "");
    void generate(
      new URLSearchParams({
        username: u,
        metric: m,
        coverage: c,
        forks: p.get("forks") || "false",
        archived: p.get("archived") || "true",
        exclude: p.get("exclude") || "",
      }),
    );
    return () => {
      controller.current?.abort();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const dirty =
    profile &&
    (profile.user.login.toLowerCase() !== username.trim().toLowerCase() ||
      profile.scope.metric !== metric ||
      profile.scope.coverage !== coverage ||
      profile.scope.forks !== forks ||
      profile.scope.archived !== archived ||
      [
        ...new Set(
          exclude
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
        ),
      ]
        .sort()
        .join(",") !== profile.scope.exclude.join(","));
  const types = view === "pair" ? ["stats", "languages"] : [view];
  const svg = (type: string) =>
    profile
      ? renderCard(profile, {
          theme,
          locale,
          type,
          count,
          percentage,
          style,
          chart,
        })
      : "";
  const baseParams = new URLSearchParams({
    username: profile?.user.login || username,
    v: CARD_REVISION,
    theme,
    locale,
    langs_count: String(count),
    percentage,
    style,
    chart,
    coverage: profile?.scope.coverage || coverage,
    metric: profile?.scope.metric || metric,
  });
  if (profile?.scope.forks) baseParams.set("forks", "true");
  baseParams.set("archived", String(profile?.scope.archived ?? archived));
  if (profile?.scope.exclude.length)
    baseParams.set("exclude", profile.scope.exclude.join(","));
  const urls = types.map(
    (type) => `${origin}/api/card?${baseParams}&type=${type}`,
  );
  const snippet =
    format === "html"
      ? `<div align="center">\n${urls.map((url, i) => `  <img src="${url.replaceAll("&", "&amp;")}" ${view === "pair" ? 'height="280"' : `width="${cardDimensions(types[i], style).width}"`} alt="${types[i] === "languages" ? "Top languages" : "GitHub statistics"} — ${profile?.user.login || username}" />`).join(view === "pair" ? "\n  &emsp;&emsp;\n" : "\n")}\n</div>`
      : format === "url"
        ? urls.join("\n")
        : urls
            .map(
              (url, i) =>
                `[![${types[i] === "languages" ? "Top languages" : "GitHub statistics"}](${url})](https://github.com/${profile?.user.login || username})`,
            )
            .join("\n");
  async function copy(value: string, isLink = false) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(!isLink);
      notify(isLink ? t.linkCopied : t.copied);
    } catch {
      notify(t.copyFailed);
    }
  }
  function download() {
    types.forEach((type) => {
      const url = URL.createObjectURL(
        new Blob([svg(type)], { type: "image/svg+xml;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `halil-hodja-${profile?.user.login}-${type}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  return (
    <div className="site-shell" data-palette={theme}>
      <header className="header">
        <a href="#" className="brand" aria-label="Halil Hodja home">
          <span className="brand-mark">
            h<span>h</span>
            <i />
          </span>
          <span>
            halil hodja<span className="brand-dot">.</span>
          </span>
        </a>
        <nav aria-label={locale === "tr" ? "Ana menü" : "Main navigation"}>
          <a href="#studio" className="nav-active">
            {t.studio}
          </a>
          <a href="#documentation">{t.docs}</a>
          <a href={source} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="locale"
            onClick={() => setLocale(locale === "en" ? "tr" : "en")}
            aria-label="Switch language / Dili değiştir"
          >
            <Globe2 size={14} /> {locale.toUpperCase()}
          </button>
          <a
            className="source-pill"
            href={source}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={15} /> {t.open}
            <ArrowUpRight size={13} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-spark">✳</span> {t.badge}
            </div>
            <h1>
              {t.heading}
              <br />
              <em>{t.emphasis}</em>
            </h1>
            <p>{t.intro}</p>
            <div className="hero-cta">
              <a className="hero-primary" href="#studio">
                {t.create}
                <ArrowUpRight size={18} />
              </a>
              <a
                className="hero-secondary"
                href={source}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={16} />
                {t.open}
              </a>
            </div>
            <div className="hero-meta">
              <span>
                <Check size={13} /> SVG cards
              </span>
              <span>
                <Check size={13} /> {Object.keys(themes).length}{" "}
                {locale === "tr" ? "tema" : "curated themes"}
              </span>
              <span>
                <Check size={13} /> 100%{" "}
                {locale === "tr" ? "açık kaynak" : "open source"}
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="art-grid" />
            <div className="art-label">
              <span className="green-dot" /> REAL DATA. MAIN CHARACTER ENERGY.
            </div>
            <div className="hero-card-frame">
              {profile ? (
                <img
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderCard(profile, { theme, locale, type: "stats", style: "spotlight" }))}`}
                  alt=""
                  width="440"
                  height="360"
                />
              ) : (
                <div className="hero-card-placeholder">
                  <Code2 size={60} />
                </div>
              )}
            </div>
            <div className="mini-tag tag-one">
              <Sparkles size={14} />
              {locale === "tr"
                ? "Tamamen senin tarzın."
                : "Entirely your kind of energy."}
            </div>
            <div className="mini-tag tag-two">
              <span className="green-dot" /> SVG / README READY
            </div>
          </div>
        </section>

        <section className="studio" id="studio" aria-label={t.studio}>
          <form
            className="settings"
            onSubmit={(event) => {
              event.preventDefault();
              void generate();
            }}
          >
            <div className="panel-heading">
              <div>
                <span className="section-index">01 / DESIGN</span>
                <h2>{t.config}</h2>
                <p>{t.configSub}</p>
              </div>
              <SlidersHorizontal size={19} />
            </div>
            <label className="field-label" htmlFor="username">
              {t.username}
            </label>
            <div className="username-field">
              <Github size={17} />
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat"
                maxLength={39}
                autoCapitalize="none"
                spellCheck={false}
                autoComplete="off"
                required
              />
            </div>
            <fieldset className="style-field">
              <legend className="field-label">{t.style}</legend>
              <div className="style-options">
                {[
                  ["spotlight", t.spotlight],
                  ["classic", t.classic],
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    className={style === key ? "selected" : ""}
                    aria-pressed={style === key}
                    onClick={() => setStyle(key)}
                  >
                    <span className={`style-thumbnail thumb-${key}`}>
                      <i />
                      <b />
                      <em />
                    </span>
                    <span>{label}</span>
                    {style === key && <Check size={12} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="theme-field">
              <legend className="field-label">
                {t.theme}
                <span>{themes[theme].label}</span>
              </legend>
              <div className="theme-grid">
                {Object.entries(themes).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className={`theme-swatch ${theme === key ? "selected" : ""}`}
                    onClick={() => setTheme(key as Theme)}
                    aria-label={value.label}
                    aria-pressed={theme === key}
                  >
                    <span
                      style={{
                        background: value.bg,
                        borderColor: value.border,
                      }}
                    >
                      <i style={{ background: value.accent }} />
                      <b style={{ background: value.muted }} />
                      {theme === key && (
                        <Check size={12} style={{ color: value.accent }} />
                      )}
                    </span>
                    <small>{value.label}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            {style === "spotlight" && (
              <>
                <label className="field-label" htmlFor="chart">
                  {t.chart}
                </label>
                <div
                  className="chart-options"
                  role="group"
                  aria-label={t.chart}
                >
                  {[
                    ["donut", t.donut],
                    ["bar", t.bars],
                  ].map(([key, label]) => (
                    <button
                      type="button"
                      key={key}
                      aria-pressed={chart === key}
                      className={chart === key ? "selected" : ""}
                      onClick={() => setChart(key)}
                    >
                      <span className={`chart-icon chart-${key}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="count-label">
              <label className="field-label" htmlFor="count">
                {t.count}
              </label>
              <output>{count.toString().padStart(2, "0")}</output>
            </div>
            <input
              className="range"
              id="count"
              type="range"
              min="2"
              max="8"
              step="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <div className="range-ends">
              <span>2</span>
              <span>8</span>
            </div>
            <details className="fine-tune">
              <summary>
                {t.filters}
                <ChevronDown size={14} />
              </summary>{" "}
              <label className="field-label" htmlFor="metric">
                {t.metric}
              </label>
              <div className="select-wrap">
                <select
                  id="metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                >
                  <option value="repos">{t.repos}</option>
                  <option value="bytes">{t.bytes}</option>
                </select>
                <ChevronDown size={14} />
              </div>
              <label className="field-label" htmlFor="coverage">
                {t.coverage}
              </label>
              <div className="select-wrap">
                <select
                  id="coverage"
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                >
                  <option value="all">{t.full}</option>
                  <option value="legacy100">{t.legacy}</option>
                </select>
                <ChevronDown size={14} />
              </div>
              <label className="field-label" htmlFor="percentage">
                {t.percentage}
              </label>
              <div className="select-wrap">
                <select
                  id="percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                >
                  <option value="shown">{t.shown}</option>
                  <option value="all">{t.all}</option>
                </select>
                <ChevronDown size={14} />
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={forks}
                  onChange={(e) => setForks(e.target.checked)}
                />
                {t.forks}
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={archived}
                  onChange={(e) => setArchived(e.target.checked)}
                />
                {t.archived}
              </label>
              <label className="field-label" htmlFor="exclude">
                {t.exclude}
              </label>
              <input
                className="exclude-input"
                id="exclude"
                placeholder={t.placeholder}
                value={exclude}
                onChange={(e) => setExclude(e.target.value)}
                maxLength={500}
              />
              <small>{t.advancedNote}</small>
            </details>
            <button className="generate" disabled={busy} type="submit">
              {busy ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <Sparkles size={17} />
              )}{" "}
              {busy ? t.generating : t.generate}
              {!busy && <ArrowRight size={17} />}
            </button>
            <p className="privacy-note">{t.noLogin}</p>
          </form>

          <div className="workspace">
            <div className="canvas-heading">
              <div>
                <span className="section-index">02 / LIVE CANVAS</span>
                <h2>{t.preview}</h2>
              </div>
              <span className="live-indicator">
                <span /> {t.live}
              </span>
            </div>
            <div
              className="preview-tabs"
              role="group"
              aria-label={locale === "tr" ? "Kart düzeni" : "Card layout"}
            >
              {[
                ["pair", t.both],
                ["stats", t.stats],
                ["languages", t.languages],
                ["overview", t.overview],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  className={view === key ? "active" : ""}
                >
                  {key === "pair" && <Layers3 size={13} />} {label}
                </button>
              ))}
            </div>
            <div className={`canvas ${view === "pair" ? "canvas-pair" : ""}`}>
              <div className="canvas-corner tl" />
              <div className="canvas-corner tr" />
              <div className="canvas-corner bl" />
              <div className="canvas-corner br" />
              {busy ? (
                <div className="canvas-message" role="status">
                  <LoaderCircle className="spin" size={25} />
                  <h3>{t.loading}</h3>
                  <p>
                    {locale === "tr"
                      ? "Harika işler biraz beklemeye değer."
                      : "Good things take a brief moment."}
                  </p>
                </div>
              ) : error ? (
                <div className="canvas-message error" role="alert">
                  <CircleHelp size={25} />
                  <h3>
                    {locale === "tr"
                      ? "Veriler yüklenemedi"
                      : "Couldn’t load this profile"}
                  </h3>
                  <p>{error}</p>
                  <button onClick={() => void generate()}>
                    {t.retry}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : profile ? (
                <div className={`cards cards-${view}`}>
                  {types.map((type) => (
                    <img
                      className="stat-card"
                      key={type}
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg(type))}`}
                      alt={`${profile.user.login} ${type === "languages" ? t.languages : t.stats}`}
                      width={cardDimensions(type, style).width}
                      height={cardDimensions(type, style).height}
                    />
                  ))}
                </div>
              ) : (
                <div className="canvas-message">
                  <Code2 size={28} />
                  <h3>{t.empty}</h3>
                  <p>{t.emptySub}</p>
                </div>
              )}
            </div>
            <div className="preview-meta">
              <span>
                {dirty ? (
                  <>
                    <span className="amber-dot" />
                    {t.dirty}
                  </>
                ) : (
                  <>
                    <span className="green-dot" />
                    {profile?.scope.source === "github-snapshot"
                      ? t.snapshotRefresh
                      : t.refresh}
                  </>
                )}
              </span>
              <button
                onClick={() =>
                  void copy(`${origin}/?${baseParams}&view=${view}`, true)
                }
                disabled={!profile || busy}
                aria-label={t.share}
              >
                <Link2 size={14} />
                {t.share}
              </button>
            </div>
            <div className="embed-panel">
              <div className="embed-heading">
                <div>
                  <span className="section-index">03 / SHARE</span>
                  <h2>{t.ready}</h2>
                  <p>{t.embedSub}</p>
                </div>
                <span className="code-icon">
                  <Code2 size={22} />
                </span>
              </div>
              <div
                className="embed-format"
                role="group"
                aria-label="Embed format"
              >
                {[
                  ["markdown", t.markdown],
                  ["html", t.html],
                  ["url", t.url],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={format === key ? "active" : ""}
                    aria-pressed={format === key}
                    onClick={() => setFormat(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <textarea
                className="snippet"
                aria-label={
                  locale === "tr" ? "README kodu" : "README embed code"
                }
                value={profile && !busy ? snippet : ""}
                placeholder={
                  locale === "tr"
                    ? "Kartların hazır olduğunda kodun burada görünecek."
                    : "Your embed code will appear when your cards are ready."
                }
                readOnly
                spellCheck={false}
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="embed-actions">
                <button
                  className="copy-button"
                  disabled={!profile || busy}
                  onClick={() => void copy(snippet)}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
                  {copied ? t.copied : t.copy}
                </button>
                <button
                  className="download-button"
                  disabled={!profile || busy}
                  onClick={download}
                >
                  <Download size={15} />
                  {t.download}
                </button>
                <span>↗ README.md</span>
              </div>
            </div>
          </div>
        </section>

        <section className="transparency">
          <div className="transparency-heading">
            <span className="section-index">A NOTE ON THE NUMBERS</span>
            <h2>{t.data}</h2>
            <p>{t.dataSub}</p>
          </div>
          <div className="values-grid">
            {[
              [Globe2, t.public, t.publicSub],
              [SlidersHorizontal, t.precise, t.preciseSub],
              [Github, t.yours, t.yoursSub],
            ].map(([Icon, title, sub], i) => {
              const I = Icon as typeof Github;
              return (
                <article key={i}>
                  <I size={20} />
                  <h3>{title as string}</h3>
                  <p>{sub as string}</p>
                </article>
              );
            })}
          </div>
          {profile && (
            <details className="scope">
              <summary>
                <CircleHelp size={15} />
                {t.scope}
                <ChevronDown size={14} />
              </summary>
              <p>
                {profile.activity && (
                  <span className="activity-scope">
                    {locale === "tr"
                      ? `Açık commit sayısı ${profile.activity.period.from.slice(0, 10)}–${profile.activity.period.to.slice(0, 10)} arasındaki 365 UTC takvim günüdür. Katkı serisi, herkese açık profil takviminden hesaplanır; görünür anonim özel katkıları da içerebilir. Bugün veya dün aktifse sürer; en uzun seri son 365 günle sınırlıdır. PR ve birleşme sayıları tüm zamanların herkese açık PR'larıdır.`
                      : `Public commit counts cover 365 UTC dates (${profile.activity.period.from.slice(0, 10)}–${profile.activity.period.to.slice(0, 10)}). Contribution streaks use the anonymous public profile calendar, including any publicly disclosed private counts. Current streaks may end today or yesterday; the best streak covers 365 dates. PR and merge counts use all-time public PRs.`}
                  </span>
                )}
                {locale === "tr"
                  ? `${profile.scope.scanned} açık repo tarandı; ${profile.scope.included} repo hesaplamaya dahil edildi. Yıldızlar ve fork sayıları bu repoların toplamıdır. Takipçi sayısı profil genelindedir.`
                  : `${profile.scope.scanned} public repositories scanned; ${profile.scope.included} included. Stars and forks are totals across included repositories. Followers are profile-wide.`}
              </p>
              <p>
                {profile.scope.metric === "bytes"
                  ? locale === "tr"
                    ? `Dil dağılımı, seçilen kapsamdaki ${profile.scope.languageRepoCount} reponun gerçek dil baytlarıyla hesaplandı. ${profile.scope.coverage === "legacy100" ? "Readme Stats uyumu: GitHub’ın varsayılan sıralamasındaki ilk 100 forksuz repo; repo başına en büyük 10 dil." : "Tüm uygun repolar hesaplanır; örnekleme yapılmaz."}`
                    : `Language totals use actual code bytes across ${profile.scope.languageRepoCount} repositories. ${profile.scope.coverage === "legacy100" ? "Readme Stats compatibility: first 100 non-fork repositories in GitHub default order, top 10 languages per repo." : "All eligible repositories are measured; no sampling is used."}`
                  : locale === "tr"
                    ? `${profile.scope.languageRepoCount} reponun ana dili sayıldı. Bu yüzdeler kod satırlarını veya kod boyutunu göstermez.`
                    : `Languages count the primary language of ${profile.scope.languageRepoCount} repositories. These percentages do not represent lines of code or code size.`}
              </p>
              {profile.scope.metric === "bytes" && (
                <p>
                  {locale === "tr"
                    ? "Hesaplanan repolar: "
                    : "Measured repositories: "}
                  {profile.scope.languageRepositories.join(", ")}
                </p>
              )}
              <p>
                {locale === "tr"
                  ? "Fork repoları varsayılan olarak hariç, arşivlenmiş repolar dahildir. Aktivite kartı açık commitleri ve herkese açık profil takvimindeki katkı serisini kullanır. Özel repo ayrıntıları okunmaz. Varsayılan yüzde, gösterilen dillerin bayt toplamı üzerinden hesaplanır; tüm dilleri payda olarak kullanmak için yukarıdaki seçeneği değiştir."
                  : "Forks are excluded and archived repos are included by default. Activity cards use public commits and the public profile contribution streak. Private repository details are not accessed. By default, percentages use the bytes of displayed languages as the denominator. Choose all detected languages above to include hidden languages in the denominator."}
              </p>
              {profile.scope.truncated && (
                <p role="note">
                  {locale === "tr"
                    ? "Bu profil için ilk 1.000 repo tarandı. Sonuçlar kısmi olabilir."
                    : "This profile reached the 1,000-repository scan limit. Results are partial."}
                </p>
              )}
              <small>
                {t.generated}:{" "}
                {new Date(profile.updatedAt).toLocaleString(
                  locale === "tr" ? "tr-TR" : "en-GB",
                )}
              </small>
            </details>
          )}
        </section>

        <section className="documentation" id="documentation">
          <div>
            <BookOpen size={24} />
            <h2>{t.documentation}</h2>
            <p>
              {locale === "tr"
                ? "API parametreleri, veri kapsamı ve kendi sunucunda kurulum için açık kaynak rehberine göz at."
                : "Explore API parameters, understand the data, or run your own instance. It’s all in the open-source guide."}
            </p>
          </div>
          <a href={`${source}#readme`} target="_blank" rel="noreferrer">
            {t.docs}
            <ArrowUpRight size={16} />
          </a>
        </section>
      </main>
      <footer>
        <a href="#" className="brand footer-brand">
          <span className="brand-mark">
            h<span>h</span>
            <i />
          </span>
          <span>halil hodja.</span>
        </a>
        <p>
          {t.footer}
          <span>{t.footerSub}</span>
        </p>
        <a href={source} target="_blank" rel="noreferrer">
          MIT License <ArrowUpRight size={12} />
        </a>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button onClick={() => setToast("")} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
