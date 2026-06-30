import type { LandingPromise } from "./../types";

export const KOREA_PROMISE: LandingPromise = {
    badgeText: "Qué incluye",
    title: "Todo lo importante, resuelto con criterio.",
    cta: { label: "Solicita tu cotización", target: "#second-form" },
    srHeading: "Lo esencial de Corea Premium",
    items: [
        {
            id: "stays",
            label: "1",
            title: "Alojamiento seleccionado con criterio",
            description: "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en Corea del Sur.",
            image: "/media/landings/corea/promise/alojamiento.avif",
        },
        {
            id: "transport",
            label: "2",
            title: "Traslados y conexiones bien resueltos",
            description: "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
            image: "/media/landings/corea/promise/traslado.avif",
        },
        {
            id: "culture",
            label: "3",
            title: "Experiencias culturales",
            description:
                "Actividades elegidas con intención: palacios históricos, mercados tradicionales y experiencias diseñadas para conectar con la esencia de Corea.",
            image: "/media/landings/corea/promise/privacidad.avif",
        },
        {
            id: "gastronomy",
            label: "4",
            title: "Gastronomía coreana",
            description: "Experiencias culinarias que forman parte central del viaje: sabores tradicionales, mercados locales y gastronomía que define la identidad coreana.",
            image: "/media/landings/corea/promise/gastronomia.avif",
        },
        {
            id: "support",
            label: "5",
            title: "Acompañamiento en cada etapa",
            description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en español.",
            image: "/media/landings/corea/promise/acompañamiento.avif",
        },
    ],
};