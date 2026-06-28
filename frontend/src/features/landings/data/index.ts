import { coreaPremium } from "./corea/corea-premium";
import { europaPremium } from "./europa/europa-premium";
import { japonPremium } from "./japon/japon-premium";
import { barrancasPremium } from "./barrancas/barrancas-premium";
import { canadaPremium } from "./canada/canada-premium";
import { peruPremium } from "./peru/peru-premium";
import type { LandingSlug, LandingTheme } from "./types";

export const landings: Record<LandingSlug, LandingTheme> = {
  "japon-premium": japonPremium,
  "corea-premium": coreaPremium,
  "europa-premium": europaPremium,
  "barrancas-premium": barrancasPremium,
  "canada-premium": canadaPremium,
  "peru-premium": peruPremium,
};

export const landingList = Object.values(landings);

export function getLandingBySlug(slug: string) {
  return landings[slug as LandingSlug] ?? null;
}

export function getLandingSlugs() {
  return landingList.map((landing) => landing.slug);
}
