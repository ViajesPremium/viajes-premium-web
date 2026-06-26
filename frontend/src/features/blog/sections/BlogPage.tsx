"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import Footer from "@/features/landings/sections/footer/Footer";
import { SITE_FOOTER } from "@/features/shared/data/site-footer";
import { BLOG_CONTENT_ENTRIES } from "@/features/blog/data/blog-content";
import BlogHero from "./BlogHero";
import styles from "./BlogPage.module.css";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";

export default function BlogSection() {
  const { triggerTransition } = usePageTransition();

  return (
    <>
      <main className={styles.page}>
        <BlogHero
          title={"BLOGS\nPREMIUM"}
          subtitle="Recorridos que inspiran y transforman"
        />

        <section
          className={styles.questionsBlock}
          aria-label="Preguntas frecuentes"
        >
          <div className={styles.questionsLayout}>
            <div className={styles.questionsLeft}>
              <BlurredStagger
                text="GUIA DEL VIAJERO PREMIUM"
                className={styles.questionsTitle}
                highlights={[{ word: "PREMIUM", useGradient: true }]}
              />{" "}
              <div className={styles.questionsColumn}>
                {BLOG_CONTENT_ENTRIES.map((item, index) => (
                  <p key={item.slug} className={styles.questionItem}>
                    <Link
                      href={`/blog/${item.slug}`}
                      className={styles.questionLink}
                    >
                      {index + 1}. {item.question}
                    </Link>
                  </p>
                ))}
              </div>
            </div>
            <figure className={styles.questionsImageWrap} aria-hidden="true">
              <Image
                src="/media/shared/blog/guia-del-viajero.avif"
                alt=""
                fill
                sizes="(max-width: 980px) 100vw, 48vw"
                className={styles.questionsImage}
              />
            </figure>
          </div>
        </section>

        <section className={styles.topGrid} aria-label="Blogs disponibles">
          {BLOG_CONTENT_ENTRIES.map((item) => (
            <article key={item.id} className={styles.blogCard}>
              <div className={styles.blogContent}>
                <p className={styles.blogIndex}>{item.id}</p>
                <h2 className={styles.blogTitle}>{item.question}</h2>
                <p className={styles.blogSubtitle}>{item.subtitle}</p>
                <Button
                  type="button"
                  variant="outline"
                  className={styles.blogCta}
                  onClick={() => triggerTransition(`/blog/${item.slug}`)}
                >
                  Leer blog
                </Button>
              </div>
              <figure className={styles.blogImageWrap}>
                <Image
                  src={item.image}
                  alt={item.question}
                  fill
                  sizes="(max-width: 980px) 50vw, 16vw"
                  className={styles.blogImage}
                />
              </figure>
            </article>
          ))}
        </section>
      </main>
      <Footer config={SITE_FOOTER} />
    </>
  );
}
