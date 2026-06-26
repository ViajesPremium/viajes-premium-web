export type LandingSlug = "japon-premium" | "corea-premium" | "europa-premium" ;

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
};

// metadata
export type LandingMetadata = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogImagePath: string;
}

// hero
export type LandingHero = {
  title: {
    wordOne: string;
    wordTwo: string;
    wordThree: string; 
    wordFour: string;
  },
  description: string;
  ctaPrimary: {
    label: string;
    target: string;
  }
  baseImage: string;
  overlayImage: string;
}





