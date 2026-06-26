import type { LandingFooter } from "@/features/landings/data/types";
import { LANDING_SOCIAL_LINKS } from "@/features/landings/data/shared";

export const SITE_FOOTER: LandingFooter = {
  srHeading: "Footer Viajes Premium",
  logoWord: "VIAJES",
  address:
    "Cda. de Omega 306, Romero de Terreros, Coyoacán, 04310 Ciudad de México, CDMX",
  mapEmbedTitle: "Ubicación Viajes Premium",
  contactEmail: "reservaciones@viajespremium.com.mx",
  contactPhoneDisplay: "+52 55 9763 3210",
  contactPhoneLink: "+525597633210",
  pageLinks: [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Blog", href: "/blog" },
  ],
  socialLinks: LANDING_SOCIAL_LINKS,
  copyrightText:
    "Todas las marcas y servicios que se ofrecen son propiedad de Viajes PREMIUM. Consulte Términos y Condiciones en el Contrato de Adhesión ante PROFECO con número 7735-2015 y 7180-2015",
  backToTopLabel: "Volver al inicio",
  legalLinks: [
    {
      label: "AVISO DE PRIVACIDAD",
      href: "/aviso-de-privacidad",
    },
  ],
};
