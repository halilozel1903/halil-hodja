export const themes = {
  midnight: {
    label: "Midnight",
    bg: "#101820",
    panel: "#17232e",
    text: "#f0f5f8",
    muted: "#91a4b6",
    accent: "#bded80",
    border: "#293a48",
  },
  paper: {
    label: "Paper",
    bg: "#fbfaf6",
    panel: "#f0eee5",
    text: "#202a22",
    muted: "#697567",
    accent: "#527742",
    border: "#dfdfd2",
  },
  aurora: {
    label: "Aurora",
    bg: "#17132d",
    panel: "#231c3e",
    text: "#f4efff",
    muted: "#aaa0c7",
    accent: "#c4b0ff",
    border: "#3d3257",
  },
  ocean: {
    label: "Ocean",
    bg: "#082b36",
    panel: "#103c48",
    text: "#e7faff",
    muted: "#91bac6",
    accent: "#63dfcf",
    border: "#205160",
  },
  rose: {
    label: "Rose",
    bg: "#2b1721",
    panel: "#3a202e",
    text: "#fff1f5",
    muted: "#c2a0af",
    accent: "#ffa9c7",
    border: "#543040",
  },
  terminal: {
    label: "Terminal",
    bg: "#0b110c",
    panel: "#101e13",
    text: "#d5f5d9",
    muted: "#7fa88b",
    accent: "#5fef8d",
    border: "#233c29",
  },
};
const palette = [
  "#bded80",
  "#91b9fa",
  "#c5a6f7",
  "#f1b87a",
  "#f58fa3",
  "#6cd7c3",
  "#e4d76e",
  "#a6b5c3",
];
export const languageColors = {
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Java: "#e8a65f",
  JavaScript: "#f1e05a",
  TypeScript: "#60a5fa",
  Python: "#79b7e5",
  Dart: "#39d3e6",
  HTML: "#e98e6e",
  CSS: "#ba99f4",
  Shell: "#89e051",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#ef7b7b",
  "C++": "#f38fc0",
  C: "#a8b9cc",
};
export const escapeXml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const short = (value) =>
  Number(value).toLocaleString("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  });
export function cardOptions(params) {
  const count = Number(params.get("langs_count") || 4);
  return {
    theme: themes[params.get("theme")] ? params.get("theme") : "midnight",
    locale: params.get("locale") === "tr" ? "tr" : "en",
    percentage: params.get("percentage") === "all" ? "all" : "shown",
    count: Number.isFinite(count)
      ? Math.min(8, Math.max(2, Math.floor(count)))
      : 4,
    type: ["stats", "languages", "overview"].includes(params.get("type"))
      ? params.get("type")
      : "stats",
  };
}

export function visibleLanguages(profile, count, percentage = "shown") {
  const selected = profile.languages.slice(0, count);
  const denominator = (
    percentage === "all" ? profile.languages : selected
  ).reduce((sum, l) => sum + l.value, 0);
  return selected.map((l) => ({
    ...l,
    percent: denominator ? (l.value / denominator) * 100 : 0,
  }));
}

export function renderCard(profile, options = {}) {
  const {
    theme = "midnight",
    locale = "en",
    type = "stats",
    count = 4,
    percentage = "shown",
  } = options;
  const t = themes[theme] || themes.midnight;
  const tr = locale === "tr";
  const isLang = type === "languages";
  const both = type === "overview";
  const w = both ? 900 : 440;
  const h = 260;
  const name = escapeXml(profile.user.name.slice(0, 29));
  const text = (x, y, content, size = 13, fill = t.text, extra = "") =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" ${extra}>${escapeXml(content)}</text>`;
  const title = isLang
    ? tr
      ? "En çok kullanılan diller"
      : "Top languages"
    : tr
      ? "GitHub istatistikleri"
      : "GitHub statistics";
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(profile.user.login)} · ${escapeXml(title)}</title><desc id="desc">${escapeXml(`${title}. ${profile.stats.repos} public repositories, ${profile.stats.stars} stars. ${profile.scope.metric === "bytes" ? "Language bytes from the declared repository coverage; percentage denominator is declared below." : "Languages measured by primary language per repository."}`)}</desc><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="17" fill="${t.bg}" stroke="${t.border}"/><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">`,
    `<circle cx="29" cy="30" r="5" fill="${t.accent}"/>`,
    text(
      42,
      34,
      "HALIL HODJA",
      10,
      t.muted,
      'letter-spacing="2" font-weight="700"',
    ),
    text(
      w - 24,
      34,
      `@${profile.user.login}`,
      11,
      t.muted,
      'text-anchor="end"',
    ),
    `<text x="24" y="73" fill="${t.text}" font-size="21" font-weight="700">${isLang ? escapeXml(title) : name}</text>`,
  ];
  function stats(offset = 0) {
    const labels = tr
      ? ["Yıldız", "Repo", "Fork", "Takipçi"]
      : ["Stars earned", "Repositories", "Forks earned", "Followers"];
    const values = [
      profile.stats.stars,
      profile.stats.repos,
      profile.stats.forks,
      profile.stats.followers,
    ];
    labels.forEach((label, i) => {
      const x = offset + 24 + (i % 2) * 202,
        y = 116 + Math.floor(i / 2) * 57;
      parts.push(
        text(
          x,
          y,
          short(values[i]),
          25,
          i === 0 ? t.accent : t.text,
          'font-weight="700"',
        ),
        text(x, y + 19, label, 11, t.muted),
      );
    });
  }
  function langs(offset = 0) {
    const selected = visibleLanguages(profile, count, percentage);
    if (!selected.length) {
      parts.push(
        text(
          offset + 24,
          130,
          tr ? "Henüz dil verisi yok." : "No language data yet.",
          14,
          t.muted,
        ),
      );
      return;
    }
    let x = offset + 24;
    parts.push(
      `<rect x="${x}" y="98" width="392" height="10" rx="5" fill="${t.panel}"/>`,
    );
    selected.forEach((l, i) => {
      const width = (l.percent / 100) * 392;
      parts.push(
        `<rect x="${x.toFixed(2)}" y="98" width="${width.toFixed(2)}" height="10" fill="${languageColors[l.name] || palette[i]}"/>`,
      );
      x += width;
      const lx = offset + 24 + (i % 2) * 202,
        ly = 137 + Math.floor(i / 2) * 22;
      parts.push(
        `<circle cx="${lx + 3}" cy="${ly - 4}" r="3" fill="${languageColors[l.name] || palette[i]}"/>`,
        text(
          lx + 14,
          ly,
          `${l.name.slice(0, 17)}  ${l.percent.toFixed(2)}%`,
          11,
          t.text,
        ),
      );
    });
    const shown = selected.reduce((s, l) => s + l.percent, 0);
    const metric =
      profile.scope.metric === "bytes"
        ? tr
          ? "Kod boyutu (bayt)"
          : "Code size (bytes)"
        : tr
          ? "Repo başına ana dil"
          : "Primary language per repo";
    parts.push(
      text(
        offset + 24,
        234,
        `${metric}${profile.scope.coverage === "legacy100" ? " · 100 repo" : ""} · ${percentage === "shown" ? (tr ? "gösterilen diller" : "shown languages") : tr ? "tüm diller" : "all languages"}${percentage === "all" && shown < 99.95 ? ` · ${tr ? "Diğer" : "Other"} ${(100 - shown).toFixed(1)}%` : ""}`,
        10,
        t.muted,
      ),
    );
  }
  if (isLang) langs();
  else {
    stats();
    parts.push(
      text(
        24,
        234,
        `${tr ? "Herkese açık" : "Public data"} · ${profile.scope.included}/${profile.scope.scanned} ${tr ? "repo" : "repos"}${profile.scope.truncated ? " · capped at 1,000" : ""}`,
        10,
        t.muted,
      ),
    );
  }
  if (both) {
    parts.push(
      `<path d="M449 62V236" stroke="${t.border}"/>`,
      text(
        484,
        73,
        tr ? "En çok kullanılan diller" : "Top languages",
        21,
        t.text,
        'font-weight="700"',
      ),
    );
    langs(460);
  }
  return parts.join("") + "</g></svg>";
}

export function errorCard(message) {
  const words = String(message).split(" ");
  const lines = [""];
  for (const word of words) {
    if ((lines[lines.length - 1] + word).length > 52) lines.push("");
    lines[lines.length - 1] += word + " ";
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="150" role="img"><title>Halil Hodja · Unable to load</title><rect width="440" height="150" rx="16" fill="#101820"/><g font-family="Arial,sans-serif"><text x="24" y="38" fill="#f0f5f8" font-size="18">Halil Hodja</text>${lines
    .slice(0, 4)
    .map(
      (line, i) =>
        `<text x="24" y="${65 + i * 18}" fill="#91a4b6" font-size="12">${escapeXml(line.trim())}</text>`,
    )
    .join("")}</g></svg>`;
}
