export type LandingSlug = "japon-premium" | "corea-premium" | "europa-premium";

// paleta de colores landings
export type LandingPalette = {
  primary: string;
  secondary: string;
  complementary: string;
};

export type LandingTheme = {
  slug: LandingSlug;
  label: string;
  palette: LandingPalette;
  navbar: LandingNavbar;
  hero: LandingHero;
  premiumExperiences: LandingPremiumExperiences;
};

export type LandingNavbarMenuItem = {
  label: string;
  ariaLabel: string;
  link: string;
  children?: LandingNavbarMenuItem[];
  destinationRoute?: string;
};

export type LandingNavbar = {
  logoUrl: string;
  menuItems: LandingNavbarMenuItem[];
  colors: string[];
  accentColor: string;
  menuButtonColor: string;
  openMenuButtonColor: string;
};

// metadata
export type LandingMetadata = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogImagePath: string;
};

// hero
export type LandingHeroTitle = {
  wordOne: string;
  wordTwo: string;
  wordThree: string;
  wordFour: string;
};

export type LandingHeroOverlay = {
  baseImage?: string;
  baseAlt?: string;
  overlayImage?: string;
  overlayAlt?: string;
  showCircle?: boolean;
};

export type LandingHero = {
  seoHeading: string;
  title: LandingHeroTitle;
  description: string;
  ctaPrimary: {
    label: string;
    target: string;
  };
  heroOverlay: LandingHeroOverlay;
};

export type LandingPremiumExperiencesCard = {
  text: string;
  experiences: string;
  image: string;
};

export type LandingPremiumExperiences = {
  srHeading: string;
  badgeText: string;
  titleText: string;
  titleHighlightWords: string[];
  cards: LandingPremiumExperiencesCard[];
  cardButtonLabel: string;
  cardButtonTarget: string;
};
