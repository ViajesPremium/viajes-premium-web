import type { LandingAliances } from "./../types";

const aliances = (
  srHeading: string,
  badgeText: string,
  left: LandingAliances["introLeftLogo"],
  right: LandingAliances["introRightLogo"],
  logos: LandingAliances["logos"],
): LandingAliances => ({
  srHeading,
  badgeText,
  title: "",
  introLeftLogo: left,
  introRightLogo: right,
  logos,
});

export const CANADA_ALIANCES = aliances(
  "Alianzas de Canad? Premium",
  "Nuestras alianzas",
  {
    src: "/media/landings/canada/aliances/logo-canada.svg",
    alt: "Canad? Premium",
    width: 460,
    height: 96,
  },
  {
    src: "/media/landings/canada/aliances/canada-grande-logo.png",
    alt: "Canad? Premium",
    width: 460,
    height: 96,
  },
  [
    {
      src: "/media/landings/canada/aliances/canada-grande-logo.png",
      alt: "Canad? Premium",
      width: 420,
      height: 90,
    },
    {
      src: "/media/landings/canada/aliances/canada-grande-logo.avif",
      alt: "Canad? Premium",
      width: 280,
      height: 90,
    },
    {
      src: "/media/landings/canada/aliances/logo-canada.svg",
      alt: "Canad? Premium",
      width: 360,
      height: 110,
    },
    {
      src: "/media/landings/canada/aliances/canada-grande-logo.png",
      alt: "Canad? Premium",
      width: 540,
      height: 120,
    },
  ],
);
