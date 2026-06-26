import type { Metadata } from "next";
import type { LandingTheme } from "@/features/landings/data/types";
import styles from "./page.module.css";
import HomeHero from "@/features/home/sections/HomeHero";
import HomeExperienceBanner from "@/features/home/sections/HomeExperienceBanner";
import Destinations from "@/features/home/sections/Destinations";
import HomeInterlude from "@/features/home/sections/HomeInterlude";
import Footer from "@/features/landings/sections/footer/Footer";
import SecondForm from "@/features/shared/sections/second-form/SecondForm";
import { HOME_SECOND_FORM } from "@/features/home/data/home-second-form";
import { SITE_FOOTER } from "@/features/shared/data/site-footer";
import Faqs from "@/features/shared/sections/faqs/Faqs";
import Aliances from "@/features/shared/sections/aliances/Aliances";
import Testimonials from "@/features/shared/sections/testimonials/Testimonials";
import { HOME_SHARED_SECTIONS } from "@/features/home/data/home-shared-sections";

const HOME_FORM_LANDING = {
  label: "Viajes PREMIUM",
  secondForm: HOME_SECOND_FORM,
} as LandingTheme;

export const metadata: Metadata = {
  title: "Viajes PREMIUM® | Experiencias de viaje diseñadas alrededor del mundo",
  description:
    "Descubre experiencias cuidadosamente diseñadas en Japón, Europa, Canadá, Perú y más destinos, con atención personalizada y acompañamiento en español.",
};

export default function Home() {
  return (
    <main id="inicio" className={styles.page}>
      <section className={styles.globeScene} aria-label="Hero principal">
        <HomeHero />
      </section>

      <HomeExperienceBanner />

      <Destinations embedded id="destinations" className={styles.destinationsScene} />

      <section className={styles.testimonialsScene}>
        <Testimonials landing={HOME_SHARED_SECTIONS} disableSakura />
      </section>

      <section className={styles.interludeScene} aria-label="Interludio de marca">
        <HomeInterlude />
      </section>

      <section className={styles.faqScene}>
        <Faqs landing={HOME_SHARED_SECTIONS} />
      </section>

      <SecondForm landing={HOME_FORM_LANDING} />

      <section className={styles.marqueeScene}>
        <Aliances landing={HOME_SHARED_SECTIONS} />
      </section>

      <section className={styles.footerScene}>
        <Footer config={SITE_FOOTER} />
      </section>
    </main>
  );
}
