import { useEffect } from "react";
import { getLiturgicalSeason } from "@/utils/LiturgicalCalendar";

type LiturgicalPalette = {
  appBg: string;
  headerBg: string;
  heroStart: string;
  heroMid: string;
  bannerStart: string;
  bannerMid: string;
  cardTop: string;
  cardBottom: string;
  border: string;
  accent: string;
  accentHover: string;
  sectionTitle: string;
};

const DEFAULT_PALETTE: LiturgicalPalette = {
  appBg: "#ebeba4",
  headerBg: "#8b1a1a",
  heroStart: "rgba(139,69,19,0.95)",
  heroMid: "rgba(160,82,45,0.9)",
  bannerStart: "rgba(210,105,30,0.9)",
  bannerMid: "rgba(184,134,11,0.85)",
  cardTop: "#d4c5a9",
  cardBottom: "#e8dcc4",
  border: "#8b6f47",
  accent: "#8b1a1a",
  accentHover: "#6b1414",
  sectionTitle: "#8b4513",
};

// Regras de título: roxos => branco, tempo pascal => preto, demais => padrão do site.
const palettes: Record<string, LiturgicalPalette> = {
  Advento: {
    ...DEFAULT_PALETTE,
    appBg: "#7647bf",
    headerBg: "#6f42c1",
    heroStart: "rgba(79,38,131,0.95)",
    heroMid: "rgba(111,66,193,0.9)",
    bannerStart: "rgba(79,38,131,0.9)",
    bannerMid: "rgba(111,66,193,0.85)",
    accent: "#6f42c1",
    accentHover: "#4f2683",
    sectionTitle: "#ffffff",
    border: "#7a5ca8",
  },
  Quaresma: {
    ...DEFAULT_PALETTE,
    appBg: "#321263",
    headerBg: "#4b2e83",
    heroStart: "rgba(42,24,76,0.95)",
    heroMid: "rgba(75,46,131,0.9)",
    bannerStart: "rgba(42,24,76,0.9)",
    bannerMid: "rgba(75,46,131,0.85)",
    accent: "#4b2e83",
    accentHover: "#2f1b59",
    sectionTitle: "#ffffff",
    sectionTitle: "#00000",
    border: "#5f4b87",
  },
  "Tempo Pascal": {
    ...DEFAULT_PALETTE,
    appBg: "#f6e8a8",
    headerBg: "#b8860b",
    heroStart: "rgba(184,134,11,0.95)",
    heroMid: "rgba(215,167,43,0.9)",
    bannerStart: "rgba(184,134,11,0.9)",
    bannerMid: "rgba(215,167,43,0.85)",
    accent: "#b8860b",
    accentHover: "#8d6608",
    sectionTitle: "#000000",
    border: "#b9953c",
  },
};

const STYLE_ID = "liturgical-theme-overrides";

function ensureThemeStyleTag() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --liturgical-app-bg: ${DEFAULT_PALETTE.appBg};
      --liturgical-header-bg: ${DEFAULT_PALETTE.headerBg};
      --liturgical-hero-start: ${DEFAULT_PALETTE.heroStart};
      --liturgical-hero-mid: ${DEFAULT_PALETTE.heroMid};
      --liturgical-banner-start: ${DEFAULT_PALETTE.bannerStart};
      --liturgical-banner-mid: ${DEFAULT_PALETTE.bannerMid};
      --liturgical-card-top: ${DEFAULT_PALETTE.cardTop};
      --liturgical-card-bottom: ${DEFAULT_PALETTE.cardBottom};
      --liturgical-border: ${DEFAULT_PALETTE.border};
      --liturgical-accent: ${DEFAULT_PALETTE.accent};
      --liturgical-accent-hover: ${DEFAULT_PALETTE.accentHover};
      --liturgical-section-title: ${DEFAULT_PALETTE.sectionTitle};
    }

    .app-container,
    .app-container::before {
      background-color: var(--liturgical-app-bg);
    }

    .header,
    .header::before {
      background-color: var(--liturgical-header-bg);
    }

    .hero-banner {
      background: linear-gradient(90deg, var(--liturgical-hero-start) 0%, var(--liturgical-hero-mid) 50%, var(--liturgical-hero-start) 100%);
    }

    .easter-banner {
      background: linear-gradient(90deg, var(--liturgical-banner-start) 0%, var(--liturgical-banner-mid) 50%, var(--liturgical-banner-start) 100%);
    }

    .feature-card {
      background: linear-gradient(to bottom, var(--liturgical-card-top), var(--liturgical-card-bottom));
      border-color: var(--liturgical-border);
    }

    .feature-card-header,
    .share-button,
    .about-button,
    .organizer-close {
      background-color: var(--liturgical-accent);
    }

    .share-button:hover,
    .about-button:hover,
    .organizer-close:hover {
      background-color: var(--liturgical-accent-hover);
    }

    .about-title,
    .about-subtitle {
      color: var(--liturgical-section-title);
    }

    .about-card,
    .organizer-modal {
      border-color: var(--liturgical-border);
    }

    .about-title-line {
      background-color: color-mix(in srgb, var(--liturgical-section-title) 35%, transparent);
    }
  `;

  document.head.appendChild(style);
}

function applyPalette(season: string) {
  const palette = palettes[season] ?? DEFAULT_PALETTE;
  const root = document.documentElement;

  root.style.setProperty("--liturgical-app-bg", palette.appBg);
  root.style.setProperty("--liturgical-header-bg", palette.headerBg);
  root.style.setProperty("--liturgical-hero-start", palette.heroStart);
  root.style.setProperty("--liturgical-hero-mid", palette.heroMid);
  root.style.setProperty("--liturgical-banner-start", palette.bannerStart);
  root.style.setProperty("--liturgical-banner-mid", palette.bannerMid);
  root.style.setProperty("--liturgical-card-top", palette.cardTop);
  root.style.setProperty("--liturgical-card-bottom", palette.cardBottom);
  root.style.setProperty("--liturgical-border", palette.border);
  root.style.setProperty("--liturgical-accent", palette.accent);
  root.style.setProperty("--liturgical-accent-hover", palette.accentHover);
  root.style.setProperty("--liturgical-section-title", palette.sectionTitle);
}

export function LiturgicalThemeManager() {
  useEffect(() => {
    ensureThemeStyleTag();

    const syncTheme = () => applyPalette(getLiturgicalSeason(new Date()));

    syncTheme();
    const interval = window.setInterval(syncTheme, 1000 * 60 * 60);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
