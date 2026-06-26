import type { LandingTheme } from "./types";
import { LANDING_MENU_ITEMS } from "./navbar-items";
import { JAPAN_PREMIUM_HERO } from "./hero";
import { JAPAN_PREMIUM_EXPERIENCES } from "./premium-experiences";

export const japonPremium: LandingTheme = {
  slug: "japon-premium",
  label: "Japon Premium",
  palette: {
    primary: "#db2f21",
    secondary: "#95231c",
    complementary: "#8c8380",
  },
  navbar: {
    logoUrl: "/logos/jp-negro.svg",
    menuItems: [...LANDING_MENU_ITEMS],
    colors: ["var(--primary)", "var(--secondary)"],
    accentColor: "var(--primary)",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: JAPAN_PREMIUM_HERO,
  premiumExperiences: JAPAN_PREMIUM_EXPERIENCES,
};
