import type { LandingTheme } from "./types";
import { LANDING_MENU_ITEMS } from "./navbar-items";
import { EUROPA_PREMIUM_HERO } from "./hero";
import { EUROPA_PREMIUM_EXPERIENCES } from "./premium-experiences";

export const europaPremium: LandingTheme = {
  slug: "europa-premium",
  label: "Europa Premium",
  palette: {
    primary: "#511E62",
    secondary: "#882BAC",
    complementary: "#2A1A6E",
  },
  navbar: {
    logoUrl: "/logos/europa-negro.svg",
    menuItems: [...LANDING_MENU_ITEMS],
    colors: ["var(--primary)", "var(--secondary)"],
    accentColor: "var(--primary)",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: EUROPA_PREMIUM_HERO,
  premiumExperiences: EUROPA_PREMIUM_EXPERIENCES,
};
