export type LandingSlug = "japon-premium" | "corea-premium" | "europa-premium" | "barrancas-premium";

// paleta de colores landings
export type LandingPalette = {
  primary: string;
  secondary: string;
  complementary: string;
};

export type LandingTheme = {
  slug: LandingSlug;
  label: string;
  metadata: LandingMetadata;
  palette: LandingPalette;
  navbar: LandingNavbar;
  hero: LandingHero;
  premiumExperiences: LandingPremiumExperiences;
  firstForm: LandingFormSection;
  benefits: LandingBenefits;
  itineraries: LandingItineraries;
  promise: LandingPromise;
  testimonials: LandingTestimonials;
  founder: LandingFounder;
  faqs: LandingFaqs;
  video: LandingVideo;
  secondForm: LandingFormSection;
  aliances: LandingAliances;
  footer: LandingFooter;
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

export type LandingFormOption = {
  label: string;
  value: string;
};

export type LandingFormSection = {
  srHeading: string;
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage: string;
  mobileImage?: {
    src: string;
    alt: string;
  };
  submitLabel: string;
  contactEmail: string;
  contactPhoneDisplay: string;
  contactPhoneLink: string;
  crmTag?: string;
  labels?: {
    travelWishes?: string;
    experienceType?: string;
  };
  placeholders?: {
    travelWishes?: string;
    experienceType?: string;
  };
  experienceOptions?: readonly LandingFormOption[];
};

export type LandingBenefitRailItem = {
  id: string;
  title: string;
  imageSrc: string;
  href?: string;
};

export type LandingBenefitBracket = {
  label: string;
  imageSrc: string;
  imageAlt: string;
  textTone?: "ot" | "epochal";
};

export type LandingBenefitLineWithBracket = {
  lead: string;
  bracket: LandingBenefitBracket;
  tail: string;
};

export type LandingBenefitTextLine = {
  text: string;
  highlightWord: string;
  bracket?: LandingBenefitBracket;
  tail?: string;
};

export type LandingBenefits = {
  srHeading: string;
  badgeText: string;
  kickerTop: string;
  kickerBottom: string;
  line1: LandingBenefitLineWithBracket;
  line2: LandingBenefitTextLine & {
    bracket: LandingBenefitBracket;
    tail: string;
  };
  line3: LandingBenefitLineWithBracket;
  line4: LandingBenefitTextLine;
  focusRailItems: LandingBenefitRailItem[];
  ctaPrimary: {
    label: string;
    target: string;
  };
};

export type LandingItinerary = {
  id: number;
  day: string;
  title: string;
  description: string;
  ideal: string;
  image: string;
  price: string;
  pdfHref?: string;
  pdfFileName?: string;
};

export type LandingItineraries = {
  srHeading: string;
  badgeText: string;
  title: string;
  items: LandingItinerary[];
  pdfDownloads?: Array<{ href: string; fileName?: string }>;
  secondaryCtaLabel: string;
  primaryCta: {
    label: string;
    target: string;
  };
};

export type LandingPromiseItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
};

export type LandingPromise = {
  srHeading: string;
  badgeText: string;
  title: string;
  items: LandingPromiseItem[];
  cta: {
    label: string;
    target: string;
  };
};

export type LandingTestimonial = {
  id: number;
  quote: string;
  name: string;
  location: string;
  avatar: string;
};

export type LandingTestimonials = {
  srHeading: string;
  badgeText: string;
  title: string;
  items: LandingTestimonial[];
  googleRating?: {
    rating: number;
    totalRatings: number;
  };
  cta: {
    label: string;
    target: string;
  };
};

export type LandingFounder = {
  srHeading: string;
  rows: string[];
  role: string;
  name: string;
  quote: string;
  quoteHighlight?: string;
  image: {
    src: string;
    alt: string;
  };
};

export type LandingFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type LandingFaqs = {
  srHeading: string;
  badgeText: string;
  title: string;
  subtitle: string;
  contactLabel: string;
  contactEmail: string;
  leftImage?: string;
  rightImage?: string;
  figuresBottomOffsetPx?: number;
  accordionAriaLabel?: string;
  items: LandingFaqItem[];
};

export type LandingVideoSource = {
  webm: string;
  mp4: string;
};

export type LandingVideo = {
  srHeading: string;
  desktop: LandingVideoSource;
  mobile: LandingVideoSource;
  alt: string;
};

export type LandingAlianceLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type LandingAliances = {
  srHeading: string;
  badgeText: string;
  title: string;
  introLeftLogo: LandingAlianceLogo;
  introRightLogo: LandingAlianceLogo;
  logos: LandingAlianceLogo[];
};

export type LandingFooter = {
  srHeading: string;
  logoWord: string;
  logoWordColor?: string;
  address: string;
  contactEmail: string;
  contactPhoneDisplay: string;
  contactPhoneLink: string;
  backToTopLabel?: string;
  mapEmbedTitle?: string;
  pageLinks: Array<{ label: string; href: string }>;
  socialLinks: Array<{ label: string; href: string }>;
  copyrightText: string;
  legalLinks: Array<{ label: string; href: string }>;
};
