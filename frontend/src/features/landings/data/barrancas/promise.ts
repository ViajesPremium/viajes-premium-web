import type { LandingPromise } from "./../types";

export const BARRANCAS_PROMISE: LandingPromise = {
  badgeText: "Qué incluye",
  title: "Todo lo importante, resuelto con criterio.",
  cta: { label: "Solicita tu cotización", target: "#second-form" },
  srHeading: "Lo esencial de Barrancas Premium",
  items: [
    {
      id: "stays",
      label: "1",
      title: "Alojamiento seleccionado con criterio",
      description:
        "Hoteles y estancias elegidas por ubicación, comodidad y coherencia con el recorrido, para descansar bien después de cada experiencia en la Sierra Tarahumara.",
      image: "/media/landings/barrancas/promise/alojamiento-seleccionado.avif",
    },
    {
      id: "transport",
      label: "2",
      title: "Traslados y conexiones bien resueltos",
      description:
        "Diseñamos recorridos con lógica. Organización clara de desplazamientos para aprovechar mejor el tiempo en destino.",
      image: "/media/landings/barrancas/promise/traslados-y-conexiones.avif",
    },
    {
      id: "culture",
      label: "3",
      title: "Experiencias seleccionadas",
      description:
        "Actividades elegidas con intención: recorridos históricos, experiencias culturales y momentos diseñados para conectar con la esencia de Barrancas del Cobre.",
      image: "/media/landings/barrancas/promise/experiencias-privadas.avif",
    },
    {
      id: "gastronomy",
      label: "4",
      title: "Gastronomía del norte",
      description:
        "Experiencias culinarias que forman parte central del viaje: cocina tradicional, restaurantes seleccionados y sabores que definen la identidad Tarahumara.",
      image: "/media/landings/barrancas/promise/gastronomia-del-norte.avif",
    },
    {
      id: "support",
      label: "5",
      title: "Acompañamiento en cada etapa",
      description:
        "Desde la planeación inicial hasta tu regreso, cuentas con seguimiento real, atención personalizada y soporte para vivir Barrancas del Cobre con tranquilidad.",
      image:
        "/media/landings/barrancas/promise/acompanamiento-durante-todo-el-recorrido.avif",
    },
  ],
};
