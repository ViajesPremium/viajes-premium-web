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
            description: "Hoteles y estancias elegidas por ubicación y comodidad, para descansar bien después de cada experiencia en los Andes y la Amazonía peruana.",
            image: "/media/landings/peru/promise/experiencia-alojamiento.webp",
        },
        {
            id: "transport",
            label: "2",
            title: "Traslados y conexiones bien resueltos",
            description: "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
            image: "/media/landings/peru/promise/experiencia-traslado.webp",
        },
        {
            id: "culture",
            label: "3",
            title: "Experiencias privadas o seleccionadas",
            description:
                "Actividades elegidas con intención: Camino Inca, Valle Sagrado, comunidades quechuas, Lago Titicaca y momentos diseñados para conectar con la esencia del Perú profundo.",
            image: "/media/landings/peru/promise/experiencia-privada.webp",
        },
        {
            id: "gastronomy",
            label: "4",
            title: "Gastronomía peruana",
            description: "Experiencias culinarias que forman parte central del viaje: cocina andina, restaurantes seleccionados en Lima y sabores regionales que definen la identidad gastronómica del Perú.",
            image: "/media/landings/peru/promise/experiencia-gastronomia.webp",
        },
        {
            id: "support",
            label: "5",
            title: "Acompañamiento en cada etapa",
            description: "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real y atención en el momento.",
            image: "/media/landings/peru/promise/experiencia-acompanamiento.webp",
        },
    ],
};