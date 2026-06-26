import type { Metadata } from "next";
import Nosotros from "@/features/about-us/sections/Nosotros";

export const metadata: Metadata = {
  title: "Nosotros | Viajes Premium",
  description:
    "Conoce la historia, equipo y alianzas de Viajes Premium.",
};

export default function AboutUsPage() {
  return <Nosotros />;
}
