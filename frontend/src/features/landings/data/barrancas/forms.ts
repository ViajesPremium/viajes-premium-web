import type { LandingFormSection } from "./../types";
import { LANDING_CONTACT } from "./../shared";

const EUROPE_FORM_OPTIONS = [
  {
    label:
      "De París a Roma — Ciudades icónicas y encanto clásico | Desde $5,286 USD base doble",
    value: "de-paris-a-roma",
  },
  {
    label:
      "Europa Cosmopolita — España, Francia, Bélgica y Países Bajos | Desde $5,094 USD base doble",
    value: "europa-cosmopolita",
  },
  {
    label:
      "Íconos de Europa — Francia, Inglaterra, Países Bajos e Italia | Desde $6,319 USD base doble",
    value: "iconos-de-europa",
  },
  { label: "Deseo una experiencia más personalizada", value: "otro" },
] as const;

const formSection = ({
  srHeading,
  title,
  backgroundImage,
  mobileImage,
  contactPhoneDisplay = LANDING_CONTACT.phoneDisplay,
  contactPhoneLink = LANDING_CONTACT.phoneLink,
  submitLabel = "Solicita tu cotización",
  crmTag,
  labels,
  placeholders,
  options,
}: {
  srHeading: string;
  title: string;
  backgroundImage: string;
  mobileImage?: LandingFormSection["mobileImage"];
  contactPhoneDisplay?: string;
  contactPhoneLink?: string;
  submitLabel?: string;
  crmTag?: string;
  labels?: LandingFormSection["labels"];
  placeholders?: LandingFormSection["placeholders"];
  options?: LandingFormSection["experienceOptions"];
}): LandingFormSection => ({
  srHeading,
  eyebrow: "Asesoría Privada",
  title,
  description:
    "Cuéntanos tu idea de viaje y encontraremos el itinerario ideal.",
  backgroundImage,
  mobileImage,
  submitLabel,
  contactEmail: LANDING_CONTACT.email,
  contactPhoneDisplay,
  contactPhoneLink,
  crmTag,
  labels,
  placeholders,
  experienceOptions: options,
});

export const BARRANCAS_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Europa",
  title: "Europa a tu ritmo, sin perder profundidad.",
  backgroundImage: "/media/landings/europa/forms/europa-form.avif",
  mobileImage: {
    src: "/media/landings/europa/forms/first-form-europa-sola.webp",
    alt: "Figura Europa Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
  crmTag: "#tags:Europa Premium",
  labels: {
    travelWishes: "¿Qué te gustaría vivir en Europa?",
    experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
  },
  placeholders: {
    travelWishes:
      "Ej. París, Roma, Londres, Ámsterdam, trenes, gastronomía, museos, paisajes y tiempo libre para explorar.",
    experienceType: "Ej. clásico, cosmopolita, cultural profundo...",
  },
  options: EUROPE_FORM_OPTIONS,
});

export const BARRANCAS_SECOND_FORM = {
  ...BARRANCAS_FIRST_FORM,
  srHeading: "Formulario de contacto Europa Premium",
  title: "Hablemos de tu ruta por Europa.",
  backgroundImage: "/media/landings/europa/forms/cta-form-europa.avif",
  mobileImage: {
    src: "/media/landings/europa/forms/form-europa-sola.webp",
    alt: "Europa Premium",
  },
};
