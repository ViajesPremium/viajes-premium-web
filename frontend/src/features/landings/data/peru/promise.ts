import type { LandingPromise } from "../types";

export const PERU_PROMISE: LandingPromise = {
    badgeText: "Qué incluye",
    title: "Todo lo importante, resuelto con criterio.",
    cta: { label: "Solicita tu cotización", target: "#second-form" },
    srHeading: "Lo esencial de Per? Premium",
    items: [
        {
            id: "stays",
            label: "1",
            title: "Alojamiento seleccionado",
            description: "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en Per?.",
            image: "/media/landings/peru/promise/experiencia-alojamiento.webp",
        },
        {
            id: "transport",
            label: "2",
            title: "Traslados y conexiones",
            description: "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
            image: "/media/landings/peru/promise/experiencia-traslado.webp",
        },
        {
            id: "culture",
            label: "3",
            title: "Experiencias culturales",
            description:
                "Actividades elegidas con intención: palacios históricos, mercados tradicionales y experiencias diseñadas para conectar con la esencia de Per?.",
            image: "/media/landings/peru/promise/experiencia-privada.webp",
        },
        {
            id: "gastronomy",
            label: "4",
            title: "Gastronomía coreana",
            description: "Experiencias culinarias que forman parte central del viaje: sabores tradicionales, mercados locales y gastronomía que define la identidad coreana.",
            image: "/media/landings/peru/promise/experiencia-gastronomia.webp",
        },
        {
            id: "support",
            label: "5",
            title: "Acompañamiento real",
            description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en español.",
            image: "/media/landings/peru/promise/experiencia-acompanamiento.webp",
        },
    ],
};