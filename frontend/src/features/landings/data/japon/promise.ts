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
