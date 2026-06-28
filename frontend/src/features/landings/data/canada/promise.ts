import type { LandingPromise } from "./../types";

export const CANADA_PROMISE: LandingPromise = {
    badgeText: "Qué incluye",
    title: "Todo lo importante, resuelto con criterio.",
    cta: { label: "Solicita tu cotización", target: "#second-form" },
    srHeading: "Lo esencial de Corea Premium",
    items: [
        {
            id: "stays",
            label: "1",
            title: "Alojamiento seleccionado con criterio",
            description: "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en ciudades y paisajes de Canadá.",
            image: "/media/shared/home/destinos/corea/corea-premium-1.webp",
        },
        {
            id: "transport",
            label: "2",
            title: "Traslados y conexiones bien resueltos",
            description: "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
            image: "/media/shared/home/destinos/corea/corea-premium-2.webp",
        },
        {
            id: "culture",
            label: "3",
            title: "Experiencias privadas o seleccionadas",
            description:
                "Actividades elegidas con intención: naturaleza, ciudades icónicas y momentos diseñados para conectar con la esencia de Canadá.",
            image: "/media/shared/home/destinos/corea/corea-premium-3.webp",
        },
        {
            id: "gastronomy",
            label: "4",
            title: "Gastronomía canadiense",
            description: "Experiencias culinarias que forman parte central del viaje: sabores locales, restaurantes seleccionados y propuestas que reflejan la identidad canadiense.",
            image: "/media/shared/home/destinos/corea/corea-premium-4.webp",
        },
        {
            id: "support",
            label: "5",
            title: "Acompañamiento en cada etapa",
            description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en español. ",
            image: "/media/shared/blog/blog-corea-4.png",
        },
    ],
};