import type { LandingTheme } from "./types";
import { LANDING_MENU_ITEMS } from "./navbar-items";
import { KOREA_PREMIUM_HERO } from "./hero";
import { KOREA_PREMIUM_EXPERIENCES } from "./premium-experiences";

export const coreaPremium: LandingTheme = {
  slug: "corea-premium",
  label: "Corea Premium",
  palette: {
    primary: "#1D624E",
    secondary: "#482D55",
    complementary: "#DFDFDF",
  },
  navbar: {
    logoUrl: "/logos/corea-negro.svg",
    menuItems: [...LANDING_MENU_ITEMS],
    colors: ["var(--primary)", "var(--secondary)"],
    accentColor: "var(--primary)",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: KOREA_PREMIUM_HERO,
  premiumExperiences: KOREA_PREMIUM_EXPERIENCES,
};
