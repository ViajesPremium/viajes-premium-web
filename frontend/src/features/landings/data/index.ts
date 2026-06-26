import { coreaPremium } from "./corea-premium";
import { europaPremium } from "./europa-premium";
import { japonPremium } from "./japon-premium";
import { barrancasPremium } from "./barrancas-premium";
import type { LandingSlug, LandingTheme } from "./types";

export const landings: Record<LandingSlug, LandingTheme> = {
  "japon-premium": japonPremium,
  "corea-premium": coreaPremium,
  "europa-premium": europaPremium,
  "barrancas-premium": barrancasPremium,
};

export const landingList = Object.values(landings);

export function getLandingBySlug(slug: string) {
  return landings[slug as LandingSlug] ?? null;
}

export function getLandingSlugs() {
  return landingList.map((landing) => landing.slug);
}
