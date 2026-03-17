import { useLayoutEffect } from "react";
import { getLiturgicalSeason } from "@/utils/LiturgicalCalendar";
import type { LiturgicalSeason } from "@/utils/LiturgicalCalendar";

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
  sectionSubTitle: string;
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
  sectionSubTitle: "#8b4513",
};

/**
 * Paletas por estação litúrgica
 */
const palettes: Partial<Record<LiturgicalSeason, LiturgicalPalette>> = {
  Advento: {
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
    sectionSubTitle: "#4b2e83",
    border: "#5f4b87",
  },

  Quaresma: {
    ...DEFAULT_PALETTE,
    appBg: "#1e0b3a",
    headerBg: "#1c0d3a",
    heroStart: "rgba(42,24,76,0.95)",
    heroMid: "rgba(34,20,63,0.9)",
    bannerStart: "rgba(42,24,76,0.9)",
    bannerMid: "rgba(75,46,131,0.85)",
    accent: "#4b2e83",
    accentHover: "#2f1b59",
    sectionTitle: "#ffffff",
    sectionSubTitle: "#4b2e83",
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
    sectionSubTitle: "#000000",
    border: "#b9953c",
  },
};

const STYLE_ID = "liturgical-theme-overrides";

/**
 * Garante que o style global seja inserido apenas uma vez
 */
function ensureThemeStyleTag(initialPalette: LiturgicalPalette = DEFAULT_PALETTE) {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;

  style.textContent = `
    :root {
      --liturgical-app-bg: ${initialPalette.appBg};
      --liturgical-header-bg: ${initialPalette.headerBg};
      --liturgical-hero-start: ${initialPalette.heroStart};
      --liturgical-hero-mid: ${initialPalette.heroMid};
      --liturgical-banner-start: ${initialPalette.bannerStart};
      --liturgical-banner-mid: ${initialPalette.bannerMid};
      --liturgical-card-top: ${initialPalette.cardTop};
      --liturgical-card-bottom: ${initialPalette.cardBottom};
      --liturgical-border: ${initialPalette.border};
      --liturgical-accent: ${initialPalette.accent};
      --liturgical-accent-hover: ${initialPalette.accentHover};
      --liturgical-section-title: ${initialPalette.sectionTitle};
      --liturgical-section-subtitle: ${initialPalette.sectionSubTitle};
    }

    .app-container {
      background-color: var(--liturgical-app-bg);
    }

    .header {
      background-color: var(--liturgical-header-bg);
    }

    .hero-banner {
      background: linear-gradient(
        90deg,
        var(--liturgical-hero-start) 0%,
        var(--liturgical-hero-mid) 50%,
        var(--liturgical-hero-start) 100%
      );
    }

    .easter-banner {
      background: linear-gradient(
        90deg,
        var(--liturgical-banner-start) 0%,
        var(--liturgical-banner-mid) 50%,
        var(--liturgical-banner-start) 100%
      );
    }

    .feature-card {
      background: linear-gradient(
        to bottom,
        var(--liturgical-card-top),
        var(--liturgical-card-bottom)
      );
      border-color: var(--liturgical-border);
    }

    .feature-card-header,
    .share-button,
    .about-button,
    .modal-close {
      background-color: var(--liturgical-accent);
    }

    .share-button:hover,
    .about-button:hover {
      background-color: var(--liturgical-accent-hover);
    }

    .about-title {
      color: var(--liturgical-section-title);
    }

    .about-subtitle {
      color: var(--liturgical-section-subtitle);
    }

    .about-card,
    .organizer-modal {
      border-color: var(--liturgical-border);
    }

    .about-title-line {
      background-color: color-mix(
        in srgb,
        var(--liturgical-section-title) 35%,
        transparent
      );
    }
  `;

  document.head.appendChild(style);
}

function getCurrentPalette(): LiturgicalPalette {
  const season = getLiturgicalSeason(new Date());
  return palettes[season] ?? DEFAULT_PALETTE;
}

function bootstrapLiturgicalTheme() {
  if (typeof document === "undefined") return;

  const initialPalette = getCurrentPalette();
  ensureThemeStyleTag(initialPalette);
  applyPalette(getLiturgicalSeason(new Date()));
}

bootstrapLiturgicalTheme();

/**
 * Aplica paleta conforme estação
 */
function applyPalette(season: LiturgicalSeason) {
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
  root.style.setProperty("--liturgical-section-subtitle", palette.sectionSubTitle);
}

/**
 * Componente que gerencia o tema litúrgico
 */
export function LiturgicalThemeManager() {
  useLayoutEffect(() => {
    const season = getLiturgicalSeason(new Date());
    ensureThemeStyleTag(palettes[season] ?? DEFAULT_PALETTE);
    applyPalette(season);
  }, []);

  return null;
}
