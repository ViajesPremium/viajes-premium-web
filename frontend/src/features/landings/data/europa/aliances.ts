import type { LandingAliances } from "./../types";

const europeAllianceSrc = (fileName: string) =>
  encodeURI(`/media/landings/europa/aliances/${fileName}`);

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

export const EUROPE_ALIANCES = aliances(
  "Alianzas de Europa Premium",
  "Nuestras alianzas",
  {
    src: "/media/shared/logos/europa/logo-europa.svg",
    alt: "Europa Premium",
    width: 460,
    height: 96,
  },
  {
    src: europeAllianceSrc("swarovski.png"),
    alt: "Swarovski",
    width: 460,
    height: 96,
  },
  [
    {
      src: europeAllianceSrc("aeromexico-y-europa-premium.png"),
      alt: "Aeroméxico y Europa Premium",
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
      alt: "Secretaría de Turismo",
      width: 340,
      height: 140,
    },
    {
      src: europeAllianceSrc("airfrance.png"),
      alt: "Air France",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("anne-frank-house.png"),
      alt: "Anne Frank House",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("ave.png"),
      alt: "AVE",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("basilica-di-san-pietro.png"),
      alt: "Basílica de San Pietro",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("brasserie.png"),
      alt: "Brasserie",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("british-airways.png"),
      alt: "British Airways",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("british-museum.png"),
      alt: "British Museum",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("colosseo-rome.png"),
      alt: "Coliseo de Roma",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("disneyland-paris.png"),
      alt: "Disneyland Paris",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("easyjet.png"),
      alt: "easyJet",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("emirates.png"),
      alt: "Emirates",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("iberia-y-europa-premium.png"),
      alt: "Iberia y Europa Premium",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("italo.png"),
      alt: "Italo",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("jules-verne.png"),
      alt: "Jules Verne",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("klm.png"),
      alt: "KLM",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("london-eye.png"),
      alt: "London Eye",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("louvre.png"),
      alt: "Louvre",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("lufthansa.png"),
      alt: "Lufthansa",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("mouliun-rouge.png"),
      alt: "Moulin Rouge",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("swarovski.png"),
      alt: "Swarovski",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("torre-eiffel.png"),
      alt: "Torre Eiffel",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("turkish-airline.png"),
      alt: "Turkish Airlines",
      width: 446,
      height: 164,
    },
    {
      src: europeAllianceSrc("versailles.png"),
      alt: "Versailles",
      width: 446,
      height: 164,
    },
  ],
);
