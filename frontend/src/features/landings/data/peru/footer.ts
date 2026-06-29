import type { LandingFooter } from "../types";
import { LANDING_CONTACT, LANDING_SOCIAL_LINKS } from "../shared";

const footer = (
    logoWord: string,
    pageLinks: LandingFooter["pageLinks"],
    overrides: Partial<LandingFooter> = {},
): LandingFooter => ({
    srHeading: `Footer ${logoWord} Premium`,
    logoWord,
    address:
        "Cda. de Omega 306, Romero de Terreros, Coyoacán, 04310 Ciudad de México, CDMX",
    contactEmail: LANDING_CONTACT.email,
    contactPhoneDisplay: LANDING_CONTACT.phoneDisplay,
    contactPhoneLink: LANDING_CONTACT.phoneLink,
    pageLinks,
    socialLinks: LANDING_SOCIAL_LINKS,
    copyrightText: `© 2026 ${logoWord} Premium. Todos los derechos reservados.`,
    legalLinks: [{ label: "AVISO DE PRIVACIDAD", href: "/aviso-de-privacidad" }],
    ...overrides,
});

export const PERU_FOOTER = footer(
    "COREA",
    [
        { label: "Inicio", href: "#inicio" },
        { label: "Nosotros", href: "#nosotros" },
        { label: "Itinerarios", href: "#itinerarios" },
        { label: "Qué Incluye", href: "#includes" },
        { label: "Testimonios", href: "#testimonials" },
        { label: "Contacto", href: "#second-form" },
    ],
    {
        mapEmbedTitle: "Ubicación Per? Premium",
        contactPhoneDisplay: "+52 55 4161 9427",
        contactPhoneLink: "+525541619427",
        legalLinks: [
            { label: "AVISO DE PRIVACIDAD", href: "/aviso-de-privacidad" },
            { label: "TÉRMINOS", href: "#" },
        ],
    },
);