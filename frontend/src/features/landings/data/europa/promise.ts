import type { LandingPromise } from "./../types";

export const EUROPE_PROMISE: LandingPromise = {
    badgeText: "Qué incluye",
    title: "Todo lo importante, resuelto con criterio.",
    cta: { label: "Solicita tu cotización", target: "#second-form" },
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