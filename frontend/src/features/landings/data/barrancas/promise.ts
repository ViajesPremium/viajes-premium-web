import type { LandingPromise } from "./../types";

export const BARRANCAS_PROMISE: LandingPromise = {
    badgeText: "Qué incluye",
    title: "Todo lo importante, resuelto con criterio.",
    cta: { label: "Solicita tu cotización", target: "#second-form" },
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