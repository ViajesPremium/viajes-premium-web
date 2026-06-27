import type { LandingPromise } from "./types";

export const JAPAN_PROMISE: LandingPromise = {
  srHeading: "Lo esencial de la experiencia premium",
  badgeText: "Qué incluye",
  title: "Todo lo importante, resuelto con criterio.",
  cta: { label: "Solicita tu cotización", target: "#second-form" },
  items: [
    {
      id: "stays",
      label: "1",
      title: "Alojamiento seleccionado",
      description:
        "Opciones bien ubicadas, cómodas y alineadas con una experiencia premium.",
      image: "/media/landings/japon/incluye/6-1-estancias-con-caracter.webp",
    },
    {
      id: "transport",
      label: "2",
      title: "Traslados y conexiones",
      description:
        "Recorridos con lógica para aprovechar mejor el tiempo en destino.",
      image: "/media/landings/japon/incluye/6-1-traslados-mejor-coordinados.webp",
    },
    {
      id: "culture",
      label: "3",
      title: "Experiencias seleccionadas",
      description:
        "Actividades culturales, gastronómicas y escénicas para conectar con Japón.",
      image: "/media/landings/japon/incluye/6-1-experiencias-culturales-curadas.webp",
    },
    {
      id: "gastronomy",
      label: "4",
      title: "Gastronomía japonesa",
      description: "Sabores locales cuidadosamente integrados al viaje.",
      image:
        "/media/landings/japon/incluye/6-1-escenas-gastronomicas-seleccionadas.webp",
    },
    {
      id: "support",
      label: "5",
      title: "Acompañamiento real",
      description: "Seguimiento desde la planeación inicial hasta tu regreso.",
      image: "/media/landings/japon/incluye/6-1-acompanamiento-en-cada-etapa.webp",
    },
  ],
};

export const KOREA_PROMISE: LandingPromise = {
  ...JAPAN_PROMISE,
  srHeading: "Lo esencial de Corea Premium",
  items: [
    {
      id: "stays",
      label: "1",
      title: "Alojamiento seleccionado",
      description: "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en Corea del Sur.",
      image: "/media/shared/home/destinos/corea/corea-premium-1.webp",
    },
    {
      id: "transport",
      label: "2",
      title: "Traslados y conexiones",
      description: "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
      image: "/media/shared/home/destinos/corea/corea-premium-2.webp",
    },
    {
      id: "culture",
      label: "3",
      title: "Experiencias culturales",
      description:
        "Actividades elegidas con intención: palacios históricos, mercados tradicionales y experiencias diseñadas para conectar con la esencia de Corea.",
      image: "/media/shared/home/destinos/corea/corea-premium-3.webp",
    },
    {
      id: "gastronomy",
      label: "4",
      title: "Gastronomía coreana",
      description: "Experiencias culinarias que forman parte central del viaje: sabores tradicionales, mercados locales y gastronomía que define la identidad coreana.",
      image: "/media/shared/home/destinos/corea/corea-premium-4.webp",
    },
    {
      id: "support",
      label: "5",
      title: "Acompañamiento real",
      description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en español.",
      image: "/media/shared/blog/blog-corea-4.png",
    },
  ],
};

export const EUROPE_PROMISE: LandingPromise = {
  ...JAPAN_PROMISE,
  srHeading: "Lo esencial de Europa Premium",
  items: [
    {
      id: "stays",
      label: "1",
      title: "Alojamiento seleccionado",
      description: "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en ciudades y recorridos por Europa.",
      image: "/media/landings/europa/incluye/experiencia-alojamiento.webp",
    },
    {
      id: "transport",
      label: "2",
      title: "Traslados y conexiones",
      description:
        "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
      image: "/media/landings/europa/incluye/experiencia-traslado.webp",
    },
    {
      id: "culture",
      label: "3",
      title: "Experiencias privadas",
      description:
        "Actividades elegidas con intención: recorridos históricos, experiencias culturales y momentos diseñados para conectar con la esencia de Europa.",
      image: "/media/landings/europa/incluye/experiencia-privacidad.webp",
    },
    {
      id: "gastronomy",
      label: "4",
      title: "Gastronomía europea",
      description:
        "Experiencias culinarias que forman parte central del viaje: cocina tradicional, restaurantes seleccionados y sabores que definen la identidad europea.",
      image: "/media/landings/europa/incluye/experiencia-gastronomia.webp",
    },
    {
      id: "support",
      label: "5",
      title: "Acompañamiento real",
      description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en español.",
      image: "/media/landings/europa/incluye/experiencia-acompanamiento.webp",
    },
  ],
};

export const BARRANCAS_PROMISE: LandingPromise = {
  ...JAPAN_PROMISE,
  srHeading: "Lo esencial de Europa Premium",
  items: [
    {
      id: "stays",
      label: "1",
      title: "Alojamiento seleccionado con criterio",
      description: "Hoteles y estancias elegidas por ubicación, comodidad y coherencia con el recorrido, para descansar bien después de cada experiencia en la Sierra Tarahumara.",
      image: "/media/landings/europa/incluye/experiencia-alojamiento.webp",
    },
    {
      id: "transport",
      label: "2",
      title: "Traslados y conexiones bien resueltos",
      description:
        "Organizamos traslados, tiempos de conexión y desplazamientos clave para que el viaje fluya con claridad entre Chihuahua, El Fuerte, Creel, Divisadero y Barrancas del Cobre.",
      image: "/media/landings/europa/incluye/experiencia-traslado.webp",
    },
    {
      id: "culture",
      label: "3",
      title: "Experiencias privadas o seleccionadas",
      description:
        "Actividades elegidas con intención: miradores, teleférico, recorridos escénicos, cultura rarámuri, naturaleza y momentos diseñados para conectar mejor con el destino.",
      image: "/media/landings/europa/incluye/experiencia-privacidad.webp",
    },
    {
      id: "gastronomy",
      label: "4",
      title: "Gastronomía del norte",
      description:
        "Experiencias culinarias y sabores regionales que forman parte central del viaje: cocina local, productos menonitas y propuestas gastronómicas seleccionadas.",
      image: "/media/landings/europa/incluye/experiencia-gastronomia.webp",
    },
    {
      id: "support",
      label: "5",
      title: "Acompañamiento en cada etapa",
      description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real, atención personalizada y soporte para vivir Barrancas del Cobre con tranquilidad.",
      image: "/media/landings/europa/incluye/experiencia-acompanamiento.webp",
    },
  ],
};

