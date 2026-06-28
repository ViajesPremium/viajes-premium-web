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

export const JAPAN_ALIANCES = aliances(
  "Alianzas de Japón Premium",
  "Nuestras alianzas premium",
  {
    src: "/media/shared/logos/japon/jp-blanco.svg",
    alt: "Japón Premium",
    width: 460,
    height: 96,
  },
  {
    src: "/media/shared/logos/japon/japan-endless-discovery.svg",
    alt: "Japan Endless Discovery",
    width: 460,
    height: 96,
  },
  [
    {
      src: "/media/landings/japon/alianzas/22.avif",
      alt: "Japón Premium",
      width: 420,
      height: 90,
    },
    {
      src: "/media/landings/japon/alianzas/23.avif",
      alt: "JP Logo",
      width: 280,
      height: 90,
    },
    {
      src: "/media/landings/japon/alianzas/24.avif",
      alt: "Japón Grande",
      width: 540,
      height: 120,
    },
    {
      src: "/media/landings/japon/alianzas/25.avif",
      alt: "Logo Japón",
      width: 380,
      height: 110,
    },
    {
      src: "/media/landings/japon/alianzas/26.avif",
      alt: "Logo Japón",
      width: 480,
      height: 210,
    },
    {
      src: "/media/landings/japon/alianzas/air-nipon-airline.png",
      alt: "Air Nipon Airline",
      width: 480,
      height: 160,
    },
    {
      src: "/media/landings/japon/alianzas/disney-sea.png",
      alt: "DisneySea",
      width: 520,
      height: 160,
    },
    {
      src: "/media/landings/japon/alianzas/fujiya-1935.png",
      alt: "Fujiya 1935",
      width: 300,
      height: 140,
    },
    {
      src: "/media/landings/japon/alianzas/japan-rail.png",
      alt: "Japan Rail",
      width: 260,
      height: 100,
    },
    {
      src: "/media/landings/japon/alianzas/japan-universal-studios.png",
      alt: "Japan Universal Studios",
      width: 520,
      height: 150,
    },
    {
      src: "/media/landings/japon/alianzas/kikunoi-honten.png",
      alt: "Kikunoi Honten",
      width: 320,
      height: 130,
    },
    {
      src: "/media/landings/japon/alianzas/kobe-beef-wanomeya.png",
      alt: "KobeBeef Wanomeya",
      width: 360,
      height: 120,
    },
    {
      src: "/media/landings/japon/alianzas/miyajima-ferri.png",
      alt: "Miyajima Ferri",
      width: 340,
      height: 140,
    },
    {
      src: "/media/landings/japon/alianzas/narisawa.png",
      alt: "Narisawa",
      width: 290,
      height: 120,
    },
    {
      src: "/media/landings/japon/alianzas/osaka-castle.png",
      alt: "Osaka Castle",
      width: 340,
      height: 140,
    },
    {
      src: "/media/landings/japon/alianzas/shinkansen.png",
      alt: "Shinkansen",
      width: 320,
      height: 120,
    },
    {
      src: "/media/landings/japon/alianzas/tem-lab.png",
      alt: "temLab",
      width: 280,
      height: 110,
    },
    {
      src: "/media/landings/japon/alianzas/tokyo-disney-land.png",
      alt: "Tokyo DisneyLand",
      width: 520,
      height: 160,
    },
  ],
);
