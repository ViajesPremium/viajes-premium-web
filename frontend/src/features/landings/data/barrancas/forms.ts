import type { LandingFormSection } from "./../types";
import { LANDING_CONTACT } from "./../shared";

const BARRANCAS_FORM_OPTIONS = [
  {
    label:
      "El de Mayor Ranking ? Chepe Express, miradores y naturaleza | Desde _ MXN base doble",
    value: "mayor-ranking",
  },
  {
    label:
      "Las Leyendas del Fuerte ? Historia, El Fuerte y Barrancas | Desde _ MXN base doble",
    value: "leyendas-del-fuerte",
  },
  {
    label:
      "Sabores del Norte — Gastronomía, cultura menonita y paisajes | Desde _ MXN base doble",
    value: "sabores-del-norte",
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
  srHeading: "Cuéntanos cómo imaginas tu viaje a Barrancas",
  title: "Barrancas a tu ritmo, sin perder profundidad.",
  backgroundImage: "/media/landings/barrancas/forms/first-form/form.avif",
  mobileImage: {
    src: "/media/landings/barrancas/forms/first-form/mujer-mobile.avif",
    alt: "Figura Barrancas Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
  crmTag: "#tags:Barrancas Premium",
  labels: {
    travelWishes: "¿Qué te gustar?a vivir en Barrancas?",
    experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
  },
  placeholders: {
    travelWishes:
      "Ej. Chepe Express, miradores, El Fuerte, paisajes, gastronomía, cultura y tiempo libre para explorar.",
    experienceType: "Ej. clásico, cultural, escénico, gastronómico...",
  },
  options: BARRANCAS_FORM_OPTIONS,
});

export const BARRANCAS_SECOND_FORM = {
  ...BARRANCAS_FIRST_FORM,
  srHeading: "Formulario de contacto Barrancas Premium",
  title: "Hablemos de tu ruta por Barrancas.",
  backgroundImage: "/media/landings/barrancas/forms/second-form/form.avif",
  mobileImage: {
    src: "/media/landings/barrancas/forms/second-form/mujer-mobile-2.avif",
    alt: "Barrancas Premium",
  },
};
