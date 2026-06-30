import type { LandingPromise } from "./../types";

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
                "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en ciudades y recorridos por Japón.",
            image: "/media/landings/japon/promise/alojamiento-seleccionado.avif",
        },
        {
            id: "transport",
            label: "2",
            title: "Traslados y conexiones",
            description:
                "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
            image: "/media/landings/japon/promise/traslados-y-conexiones.avif",
        },
        {
            id: "culture",
            label: "3",
            title: "Experiencias seleccionadas",
            description:
                "Actividades elegidas con intención: recorridos históricos, experiencias culturales y momentos diseñados para conectar con la esencia de Japón.",
            image: "/media/landings/japon/promise/experiencias-seleccionadas.avif",
        },
        {
            id: "gastronomy",
            label: "4",
            title: "Gastronomía japonesa",
            description: "Experiencias culinarias que forman parte central del viaje: cocina tradicional, restaurantes seleccionados y sabores que definen la identidad japonesa.",
            image:
                "/media/landings/japon/promise/gastronomia-japonesa.avif",
        },
        {
            id: "support",
            label: "5",
            title: "Acompañamiento real",
            description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en español.",
            image: "/media/landings/japon/promise/acompañamiento-real.avif",
        },
    ],
};
