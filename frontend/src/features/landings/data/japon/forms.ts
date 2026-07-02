import type { LandingFormSection } from "./../types";
import { LANDING_CONTACT } from "./../shared";


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
  placeholders
});

export const JAPAN_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Japón",
  title: "Diseñemos tu Japón con intención.",
  backgroundImage: "/media/landings/japon/forms/first-form/geisha.avif",
  mobileImage: {
    src: "/media/landings/japon/forms/first-form/geisha-mobile.avif",
    alt: "Geisha en Japón",
  },
  submitLabel: "Enviar ahora",
  crmTag: "#tags:Japón Premium",
  labels: {
    travelWishes: "¿Qué te gustaría vivir en Japón?",
    experienceType: "¿Con qué tipo de experiencia conectas más? (opcional)",
  },
  placeholders: {
    travelWishes:
      "Ej. Kioto tradicional, ryokan con onsen, gastronomía, templos, anime, naturaleza, tren bala o tiempo libre para explorar.",
    experienceType: "Ej. lujo relajado, aventura curada, cultural profundo...",
  }
});

export const JAPAN_SECOND_FORM = {
  ...JAPAN_FIRST_FORM,
  srHeading: "Formulario de contacto Japón Premium",
  title: "Cotiza tu viaje ahora.",
  backgroundImage: "/media/landings/japon/forms/second-form/samurai.avif",
  mobileImage: {
    src: "/media/landings/japon/forms/second-form/samurai-mobile.avif",
    alt: "Samurai en Japón",
  }
};
