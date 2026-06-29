import type { LandingFormSection } from "../types";
import { LANDING_CONTACT } from "../shared";

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

export const PERU_FIRST_FORM = formSection({
  srHeading: "Cuéntanos cómo imaginas tu viaje a Per?",
  title: "Per?, planeada con claridad desde el primer contacto.",
  backgroundImage: "/media/landings/peru/forms/inca-form.avif",
  mobileImage: {
    src: "/media/landings/peru/forms/peru-premium-4.webp",
    alt: "Per? Premium",
  },
  contactPhoneDisplay: "+52 55 4161 9427",
  contactPhoneLink: "+525541619427",
});

export const PERU_SECOND_FORM = {
  ...PERU_FIRST_FORM,
  srHeading: "Formulario de contacto Per? Premium",
  title: "Hablemos de la Per? que quieres vivir.",
  backgroundImage: "/media/landings/peru/hero/peru-premium-1.webp",
  mobileImage: {
    src: "/media/landings/peru/hero/peru-premium-2.webp",
    alt: "Per? Premium",
  },
};
