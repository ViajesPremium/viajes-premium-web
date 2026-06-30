import type { LandingAliances } from "./../types";

const barrancasAllianceSrc = (fileName: string) =>
  encodeURI(`/media/landings/barrancas/aliances/${fileName}`);

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
    src: barrancasAllianceSrc("barrancas-premium-blanco.svg"),
    alt: "Barrancas Premium",
    width: 460,
    height: 96,
  },
  {
    src: barrancasAllianceSrc("secretaria-turismo.png"),
    alt: "Barrancas Premium",
    width: 460,
    height: 96,
  },
  [
    {
      src: barrancasAllianceSrc("aeromexico-y-barrancas-premium.png"),
      alt: "Aeromexico",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("asg.png"),
      alt: "ASG",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("calesa.png"),
      alt: "Calesa",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("courtyard.png"),
      alt: "Courtyard",
      width: 446,
      height: 164,
    },
        {
      src: "/media/shared/aliances/profeco.avif",
      alt: "Profeco",
      width: 290,
      height: 120,
    },
    {
      src: "/media/shared/aliances/secretaria-de-turismo.avif",
      alt: "Secretaria de Turismo",
      width: 340,
      height: 140,
    },
    {
      src: barrancasAllianceSrc("farallon.png"),
      alt: "Farallon",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("gobierno-chihuahua.png"),
      alt: "Gobierno Chihuahua",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("hotel-central-boutique.png"),
      alt: "Hotel Central Boutique",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("jardin-botanico.png"),
      alt: "Jardin Botanico",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("lodge-at-creel.png"),
      alt: "Lodge at Creel",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("mirador.png"),
      alt: "Mirador",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("mision.png"),
      alt: "Mision",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("mochomos.png"),
      alt: "Mochomos",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("museo-menonita.png"),
      alt: "Museo Menonita",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("museo-revolucion.png"),
      alt: "Museo Revolucion",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("parque-barrancas.png"),
      alt: "Parque Barrancas",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("posada-hodalgo.png"),
      alt: "Posada Hodalgo",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("profeco-y-barrancas-premium.png"),
      alt: "PROFECO",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("quinta-gameros.png"),
      alt: "Quinta Gameros",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("topolobampo.png"),
      alt: "Topolobampo",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("turismo-y-barrancas-premium.png"),
      alt: "Turismo",
      width: 446,
      height: 164,
    },
    {
      src: barrancasAllianceSrc("vivaerobus.png"),
      alt: "Viva Aerobus",
      width: 446,
      height: 164,
    },
  ],
);
