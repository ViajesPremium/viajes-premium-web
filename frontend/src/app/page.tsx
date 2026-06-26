import type { Metadata } from "next";
import styles from "./page.module.css";
import HomeHero from "@/features/home/sections/HomeHero";
import HomeExperienceBanner from "@/features/home/sections/HomeExperienceBanner";
import Destinations from "@/features/home/sections/Destinations";
import HomeFaqs from "@/features/home/sections/HomeFaqs";
import HomeInterlude from "@/features/home/sections/HomeInterlude";
import HomeTestimonials from "@/features/home/sections/HomeTestimonials";
import Footer from "@/features/landings/sections/footer/Footer";
import HomeMarquee from "@/features/home/sections/HomeMarquee";
import SecondForm from "@/features/shared/sections/second-form/SecondForm";
import { HOME_SECOND_FORM } from "@/features/home/data/home-second-form";
import { SITE_FOOTER } from "@/features/shared/data/site-footer";

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

      <Destinations embedded id="destinations" className={styles.destinationsScene} />

      <section className={styles.testimonialsScene}>
        <HomeTestimonials />
      </section>

      <section className={styles.interludeScene} aria-label="Interludio de marca">
        <HomeInterlude />
      </section>

      <section className={styles.faqScene}>
        <HomeFaqs />
      </section>

      <SecondForm content={HOME_SECOND_FORM} />

      <section className={styles.marqueeScene}>
        <HomeMarquee />
      </section>

      <section className={styles.footerScene}>
        <Footer config={SITE_FOOTER} />
      </section>
    </main>
  );
}
