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

export const BARRANCAS_ALIANCES = aliances(
  "Alianzas de Barrancas Premium",
  "Nuestras alianzas",
  {
    src: "/media/shared/logos/barrancas/logo-barrancas.svg",
    alt: "Barrancas Premium",
    width: 460,
    height: 96,
  },
  {
    src: "/media/shared/logos/barrancas/barrancas-grande-logo.png",
    alt: "Barrancas Premium",
    width: 460,
    height: 96,
  },
  [
    {
      src: "/media/landings/barrancas/aliances/aeromexico-y-europa-premium.png",
      alt: "Aeromexico y Barrancas Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/landings/barrancas/aliances/iberia-y-europa-premium.png",
      alt: "Iberia y Barrancas Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/landings/barrancas/aliances/profeco-y-europa-premium.png",
      alt: "PROFECO y Barrancas Premium",
      width: 446,
      height: 164,
    },
    {
      src: "/media/landings/barrancas/aliances/turismo-y-europa-premium.png",
      alt: "Turismo y Barrancas Premium",
      width: 446,
      height: 164,
    },
  ],
);
