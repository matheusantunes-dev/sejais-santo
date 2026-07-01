export const FEATURES = {
  GOSPEL_CACHE: true,

  BIBLE_NAVIGATION: true,

  /** Usa cache de capítulos bíblicos no backend */
  BIBLE_CACHE: true,

  ADVANCED_LITURGICAL_CALENDAR: true,

  NEW_UI: false,

  FIXED_LITURGICAL_COLORS: true,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}
