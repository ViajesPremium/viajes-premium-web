import type { LandingMetadata, LandingTheme } from "../types";
import { PERU_PREMIUM_HERO } from "./hero";
import { PERU_PREMIUM_EXPERIENCES } from "./premium-experiences";
import { PERU_FIRST_FORM, PERU_SECOND_FORM } from "./forms";
import { PERU_BENEFITS } from "./benefits";
import { PERU_ITINERARIES } from "./itineraries";
import { PERU_PROMISE } from "./promise";
import { PERU_TESTIMONIALS } from "./testimonials";
import { PERU_FOUNDER } from "./founder";
import { PERU_FAQS } from "./faqs";
import { PERU_FOOTER } from "./footer";
import { PERU_ALIANCES } from "./aliances";

const PERU_MENU_ITEMS = [
  { label: "Inicio", ariaLabel: "Ir al inicio", link: "#inicio" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "#nosotros" },
  { label: "Itinerarios", ariaLabel: "Ir a itinerarios", link: "#itinerarios" },
  { label: "Qu? Incluye", ariaLabel: "Ir a lo que incluye", link: "#includes" },
  { label: "Testimonios", ariaLabel: "Ir a testimonios", link: "#testimonials" },
  { label: "Sobre Per?", ariaLabel: "Ir a sobre Per?", link: "#faqs" },
  { label: "Contacto", ariaLabel: "Ir al formulario", link: "#second-form" },
];

export const PERU_PREMIUM_METADATA: LandingMetadata = {
  title: "Viajes a Perú | Clase PREMIUM ",
  description:
    "Descubre Perú con profundidad: Machu Picchu, Cusco, el Amazonas y experiencias únicas diseñadas en Clase PREMIUM.",
  keywords: [
    "Viajes a Perú",
    "Tour por Perú",
    "Viaje a Perú desde M?xico",
    "Viajar a Perú",
    "Perú Premium",
  ],
  canonicalPath: "/peru-premium",
  ogImagePath: "/media/landings/peru/hero/peru-premium-1.webp",
};

export const peruPremium: LandingTheme = {
  slug: "peru-premium",
  label: "Perú Premium",
  metadata: PERU_PREMIUM_METADATA,
  palette: {
    primary: "#1F5198",
    secondary: "#132D4F",
    complementary: "#919C34",
  },
  navbar: {
    logoUrl: "/media/shared/logos/peru/logo-peru.svg",
    menuItems: [...PERU_MENU_ITEMS],
    colors: ["#1F5198", "#132D4F"],
    accentColor: "#919C34",
    menuButtonColor: "#ffffff",
    openMenuButtonColor: "#000000",
  },
  hero: PERU_PREMIUM_HERO,
  premiumExperiences: PERU_PREMIUM_EXPERIENCES,
  firstForm: PERU_FIRST_FORM,
  benefits: PERU_BENEFITS,
  itineraries: PERU_ITINERARIES,
  promise: PERU_PROMISE,
  testimonials: PERU_TESTIMONIALS,
  founder: PERU_FOUNDER,
  faqs: PERU_FAQS,
  video: {
    srHeading: "Video Per? Premium",
    desktop: {
      webm: "/media/landings/peru/videos/peru-web-horizontal.webm",
      mp4: "/media/landings/peru/videos/peru-web-horizontal.mp4",
    },
    mobile: {
      webm: "/media/landings/peru/videos/peru-web-vertical.webm",
      mp4: "/media/landings/peru/videos/peru-web-vertical.mp4",
    },
    alt: "Video de la experiencia Perú Premium",
  },
  secondForm: PERU_SECOND_FORM,
  aliances: PERU_ALIANCES,
  footer: PERU_FOOTER,
};
