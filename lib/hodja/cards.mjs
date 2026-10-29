export const themes = {
  radical: {
    label: "Radical",
    bg: "#141122",
    panel: "#21192f",
    text: "#fff3fa",
    muted: "#b4a2bc",
    accent: "#ff4f9f",
    border: "#493046",
    secondary: "#79f2d4",
  },
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
  Java: "#F7C65C",
  "Objective-C": "#4DA8FF",
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
  value === "—"
    ? "—"
    : Number(value).toLocaleString("en", {
        notation: value >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
      });
export function cardOptions(params) {
  const count = Number(params.get("langs_count") || 4);
  return {
    theme: themes[params.get("theme")] ? params.get("theme") : "midnight",
    locale: params.get("locale") === "tr" ? "tr" : "en",
    style: params.get("style") === "classic" ? "classic" : "spotlight",
    chart: params.get("chart") === "bar" ? "bar" : "donut",
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

function renderClassicCard(profile, options = {}) {
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(profile.user.login)} · ${escapeXml(title)}</title><desc id="desc">${escapeXml(`${title}. ${profile.stats.repos} public repositories, ${profile.stats.stars} stars. ${profile.scope.metric === "bytes" ? "Language bytes from the selected repository coverage." : "Languages measured by primary language per repository."}`)}</desc><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="17" fill="${t.bg}" stroke="${t.border}"/><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">`,
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
    const labels = profile.activity
      ? tr
        ? [
            "Yıldız",
            "Açık commit · 365 gün",
            "Açılan PR · tüm zamanlar",
            "Commit serisi · gün",
          ]
        : [
            "Stars earned",
            "Public commits · 365d",
            "Pull requests · all-time",
            "Commit streak · days",
          ]
      : tr
        ? ["Yıldız", "Repo", "Fork", "Dil"]
        : ["Stars earned", "Repositories", "Forks earned", "Languages"];
    const values = profile.activity
      ? [
          profile.stats.stars,
          profile.activity.publicCommits ?? "—",
          profile.activity.pullRequests,
          profile.activity.currentStreakDays ?? "—",
        ]
      : [
          profile.stats.stars,
          profile.stats.repos,
          profile.stats.forks,
          profile.languages.length,
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
  }
  if (isLang) langs();
  else {
    stats();
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

const svgIcons = {
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  commit: '<circle cx="12" cy="12" r="4"/><path d="M2 12h6m8 0h6"/>',
  pr: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v10m12 0V9a4 4 0 0 0-4-4h-3m3-3-3 3 3 3"/>',
  review:
    '<path d="M21 11v5a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h8m3 1 2 2 4-4M7 9h5m-5 4h8"/>',
  merge:
    '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10m12-10c0 6-12 3-12 10"/>',
  flame:
    '<path d="M12 3c1 5-4 6-2 10 2-1 3-3 3-5 5 4 7 7 4 11-3 4-10 2-11-2-1-5 4-8 6-14Z"/>',
  code: '<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 18"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
  fork: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7m-6 6v4"/>',
  people:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/><circle cx="9" cy="7" r="4"/>',
};

export function cardDimensions(type = "stats", style = "spotlight") {
  if (style === "classic")
    return { width: type === "overview" ? 900 : 440, height: 260 };
  return {
    width: type === "overview" ? 960 : type === "languages" ? 500 : 440,
    height: 360,
  };
}

function renderSpotlight(profile, options) {
  const {
    theme = "midnight",
    locale = "en",
    type = "stats",
    count = 4,
    percentage = "shown",
    chart = "donut",
  } = options;
  const t = themes[theme] || themes.midnight;
  const tr = locale === "tr",
    id = `hh-${type}`,
    lang = type === "languages";
  const { width: w, height: h } = cardDimensions(type);
  const text = (x, y, value, size = 12, color = t.text, extra = "") =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escapeXml(value)}</text>`;
  const icon = (name, x, y, color = t.accent, size = 20) =>
    `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${svgIcons[name] || svgIcons.star}</g>`;
  const label = lang
    ? tr
      ? "En çok kullanılan diller"
      : "Top languages"
    : tr
      ? "GitHub istatistikleri"
      : "GitHub statistics";
  const a = profile.activity;
  const hasCommits = Number.isInteger(a?.publicCommits);
  const selected = visibleLanguages(profile, count, percentage);
  const other = Math.max(0, 100 - selected.reduce((s, l) => s + l.percent, 0));
  const description = `${profile.stats.stars} stars. ${hasCommits ? `${a.publicCommits} public commit contributions across 365 UTC dates; current commit streak ${a.currentStreakDays}, longest streak ${a.longestStreakDays}.` : ""} ${a ? `${a.pullRequests} public pull requests, ${a.reviewedPullRequests} distinct public pull requests reviewed; these PR counts are all-time.` : ""} ${lang ? selected.map((l) => `${l.name} ${l.percent.toFixed(2)}%`).join(", ") : ""} ${percentage === "all" ? `Other ${other.toFixed(1)}%.` : ""} Repository coverage ${profile.scope.coverage}; percentage denominator ${percentage}. Source ${profile.updatedAt}.`;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escapeXml(profile.user.login)} · ${escapeXml(label)}</title><desc id="${id}-desc">${escapeXml(description)}</desc><defs><linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.accent}" stop-opacity=".13"/><stop offset=".65" stop-color="${t.bg}" stop-opacity="0"/></linearGradient><linearGradient id="${id}-accent"><stop stop-color="${t.accent}"/><stop offset="1" stop-color="${t.secondary || t.text}" stop-opacity=".8"/></linearGradient></defs><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="20" fill="${t.bg}" stroke="${t.border}"/><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="20" fill="url(#${id}-sheen)"/><path d="M24 54H${w - 24}" stroke="${t.border}"/><g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif">`,
    `<rect x="24" y="20" width="22" height="22" rx="6" fill="${t.accent}" fill-opacity=".15"/>`,
    text(28, 36, "hh", 12, t.accent, 'font-weight="800"'),
    text(
      55,
      35,
      "HALIL HODJA",
      9,
      t.muted,
      'letter-spacing="1.8" font-weight="700"',
    ),
    text(
      w - 24,
      35,
      `@${profile.user.login}`,
      10,
      t.muted,
      'text-anchor="end"',
    ),
  ];
  if (!lang) {
    const leader = hasCommits ? a.publicCommits : profile.stats.stars;
    parts.push(
      text(
        24,
        85,
        profile.user.name.slice(0, 28),
        21,
        t.text,
        'font-weight="700" letter-spacing="-.5"',
      ),
      text(
        24,
        143,
        short(leader),
        44,
        t.accent,
        'font-weight="750" letter-spacing="-2"',
      ),
      icon(hasCommits ? "commit" : "star", 24, 157, t.accent, 17),
      text(
        48,
        170,
        hasCommits
          ? tr
            ? "Açık commit · 365 gün"
            : "Public commits · 365d"
          : tr
            ? "Toplam yıldız"
            : "Stars earned",
        11,
        t.muted,
      ),
    );
    const streak = Number.isInteger(a?.currentStreakDays);
    const ringValue = streak
      ? a.currentStreakDays
      : (a?.pullRequests ?? profile.stats.repos);
    const ratio = streak
      ? a.longestStreakDays
        ? Math.min(1, a.currentStreakDays / a.longestStreakDays)
        : 0
      : a?.pullRequests
        ? a.mergedPullRequests / a.pullRequests
        : profile.scope.scanned
          ? profile.scope.included / profile.scope.scanned
          : 0;
    const c = 2 * Math.PI * 48;
    parts.push(
      `<circle cx="344" cy="132" r="48" fill="none" stroke="${t.panel}" stroke-width="8"/><circle cx="344" cy="132" r="48" fill="none" stroke="url(#${id}-accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(Math.max(0, Math.min(1, ratio)) * c).toFixed(3)} ${c.toFixed(3)}" transform="rotate(-90 344 132)"/>`,
      text(
        344,
        137,
        short(ringValue),
        29,
        t.text,
        'text-anchor="middle" font-weight="700"',
      ),
      text(
        344,
        155,
        streak ? (tr ? "GÜN" : "DAYS") : a ? "PR" : "REPOS",
        9,
        t.muted,
        'text-anchor="middle" letter-spacing="2"',
      ),
    );
    if (streak)
      parts.push(
        icon("flame", 294, 181, t.accent, 13),
        text(312, 192, tr ? "Commit serisi" : "Commit streak", 10, t.muted),
      );
    const metrics = a
      ? [
          [
            "pr",
            a.pullRequests,
            tr ? "Açılan PR · tüm zamanlar" : "Pull requests · all-time",
          ],
          [
            "calendar",
            a.activeCommitDays ?? "—",
            tr ? "Commit atılan gün · 365 gün" : "Active commit days · 365d",
          ],
          [
            "flame",
            Number.isInteger(a.longestStreakDays)
              ? `${a.longestStreakDays} ${tr ? "gün" : "days"}`
              : "—",
            tr ? "En uzun seri · 365 gün" : "Best streak · 365d",
          ],
          [
            "merge",
            a.pullRequests
              ? `${((a.mergedPullRequests / a.pullRequests) * 100).toFixed(1)}%`
              : "—",
            tr ? "PR birleşme oranı · tümü" : "PR merge rate · all-time",
          ],
        ]
      : [
          ["star", profile.stats.stars, tr ? "Toplam yıldız" : "Stars earned"],
          ["fork", profile.stats.forks, tr ? "Toplam fork" : "Forks earned"],
          [
            "code",
            profile.languages.length,
            tr ? "Tespit edilen dil" : "Detected languages",
          ],
          [
            "pr",
            profile.stats.repos,
            tr ? "Açık kaynak repo" : "Public repositories",
          ],
        ];
    metrics.forEach(([name, value, caption], i) => {
      const x = 24 + (i % 2) * 202,
        y = 211 + Math.floor(i / 2) * 62;
      parts.push(
        `<rect x="${x}" y="${y}" width="190" height="54" rx="10" fill="${t.panel}" fill-opacity=".75" stroke="${t.border}"/>`,
        icon(name, x + 13, y + 16, t.accent, 19),
        text(
          x + 43,
          y + 24,
          typeof value === "number" ? short(value) : value,
          20,
          t.text,
          'font-weight="650"',
        ),
        text(x + 43, y + 42, caption, 8.4, t.muted),
      );
    });
  } else {
    parts.push(
      text(24, 89, label, 25, t.text, 'font-weight="700" letter-spacing="-.7"'),
    );
    if (!selected.length)
      parts.push(
        text(
          24,
          165,
          tr ? "Henüz dil verisi yok." : "No language data yet.",
          15,
          t.muted,
        ),
      );
    else if (chart === "bar") {
      const step = Math.min(46, 202 / selected.length);
      selected.forEach((l, i) => {
        const y = 126 + i * step;
        parts.push(
          `<circle cx="28" cy="${y - 4}" r="3.5" fill="${languageColors[l.name] || palette[i]}"/>`,
          text(41, y, l.name.slice(0, 28), 13),
          text(
            w - 24,
            y,
            `${l.percent.toFixed(2)}%`,
            13,
            t.muted,
            'text-anchor="end"',
          ),
          `<rect x="24" y="${y + 10}" width="${w - 48}" height="6" rx="3" fill="${t.panel}"/><rect x="24" y="${y + 10}" width="${(((w - 48) * l.percent) / 100).toFixed(3)}" height="6" rx="3" fill="${languageColors[l.name] || palette[i]}"/>`,
        );
      });
    } else {
      const leader = selected[0],
        cx = w - 92,
        cy = 141,
        r = 49,
        c = 2 * Math.PI * r;
      parts.push(
        text(
          24,
          149,
          `${leader.percent.toFixed(2)}%`,
          44,
          theme === "paper"
            ? t.accent
            : languageColors[leader.name] || t.accent,
          'font-weight="750" letter-spacing="-1.6"',
        ),
        text(26, 173, leader.name, 14, t.muted),
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.panel}" stroke-width="13"/>`,
      );
      let offset = 0;
      selected.forEach((l, i) => {
        const len = (l.percent / 100) * c;
        parts.push(
          `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${languageColors[l.name] || palette[i]}" stroke-width="13" stroke-dasharray="${Math.max(0, len - 1.4).toFixed(3)} ${c.toFixed(3)}" stroke-dashoffset="${(-offset).toFixed(3)}" transform="rotate(-90 ${cx} ${cy})"/>`,
        );
        offset += len;
      });
      parts.push(
        text(
          cx,
          145,
          selected.length,
          25,
          t.text,
          'text-anchor="middle" font-weight="700"',
        ),
        text(
          cx,
          164,
          tr ? "DİL" : "LANGS",
          8,
          t.muted,
          'text-anchor="middle" letter-spacing="1.5"',
        ),
      );
      let x = 24;
      selected.forEach((l, i) => {
        parts.push(
          `<rect x="${x.toFixed(3)}" y="204" width="${(((w - 48) * l.percent) / 100).toFixed(3)}" height="5" fill="${languageColors[l.name] || palette[i]}"/>`,
        );
        x += ((w - 48) * l.percent) / 100;
        const lx = 24 + (i % 2) * 238,
          ly = 239 + Math.floor(i / 2) * 25;
        parts.push(
          `<circle cx="${lx + 3}" cy="${ly - 4}" r="3.5" fill="${languageColors[l.name] || palette[i]}"/>`,
          text(lx + 14, ly, l.name.slice(0, 18), 12),
          text(
            lx + 212,
            ly,
            `${l.percent.toFixed(2)}%`,
            12,
            t.muted,
            'text-anchor="end"',
          ),
        );
      });
    }
  }
  return parts.join("") + "</g></svg>";
}

export function renderCard(profile, options = {}) {
  if (options.style === "classic") return renderClassicCard(profile, options);
  if (options.type === "overview") {
    const stats = renderSpotlight(profile, {
      ...options,
      type: "stats",
    }).replace("<svg ", '<svg x="0" ');
    const languages = renderSpotlight(profile, {
      ...options,
      type: "languages",
    }).replace("<svg ", '<svg x="460" ');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="360" viewBox="0 0 960 360" role="img" aria-label="${escapeXml(profile.user.login)} GitHub overview">${stats}${languages}</svg>`;
  }
  return renderSpotlight(profile, {
    ...options,
    type: options.type || "stats",
  });
}
