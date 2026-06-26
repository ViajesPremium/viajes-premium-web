import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button/Button";
import Footer from "@/features/landings/sections/footer/Footer";
import { SITE_FOOTER } from "@/features/shared/data/site-footer";
import { BLOG_CONTENT_BY_SLUG } from "@/features/blog/data/blog-content";
import styles from "./page.module.css";

const BLOG_DATA_DIR = path.join(process.cwd(), "blog-data");

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

type ImageColumn = "left" | "right";

type BlogVisualConfig = {
  hero?: { src: string };
  byline?: { author: string; date: string };
  primary: { src: string; column: ImageColumn; afterInColumn: number };
  secondary: { src: string; column: ImageColumn; afterInColumn: number };
  lowerLeft?: { src: string };
  lowerRight?: { src: string };
};

function buildBlogVisuals(
  coverSrc: string,
  basePath: string,
  primaryColumn: ImageColumn,
): BlogVisualConfig {
  const secondaryColumn: ImageColumn =
    primaryColumn === "left" ? "right" : "left";

  return {
    hero: {
      src: coverSrc,
    },
    primary: {
      src: `${basePath}-1.avif`,
      column: primaryColumn,
      afterInColumn: 1,
    },
    secondary: {
      src: `${basePath}-2.avif`,
      column: secondaryColumn,
      afterInColumn: 2,
    },
    lowerLeft: {
      src: `${basePath}-3.avif`,
    },
    lowerRight: {
      src: `${basePath}-4.avif`,
    },
  };
}

const DEFAULT_VISUALS: BlogVisualConfig = {
  byline: {
    author: "Ismael Contreras",
    date: "12 de junio de 2026",
  },
  ...buildBlogVisuals(
    "/media/shared/blog/portada-blog-japon.avif",
    "/media/shared/blog/blog-japon",
    "left",
  ),
};

const BLOG_VISUALS: Record<string, BlogVisualConfig> = {
  "blog-01-japon-premium": buildBlogVisuals(
    "/media/shared/blog/portada-blog-japon.avif",
    "/media/shared/blog/blog-japon",
    "left",
  ),
  "blog-02-viajes-familia-premium": buildBlogVisuals(
    "/media/shared/blog/portada-blog-europa.avif",
    "/media/shared/blog/blog-europa",
    "right",
  ),
  "blog-03-viajero-consciente": buildBlogVisuals(
    "/media/shared/blog/portada-blog-canada.avif",
    "/media/shared/blog/blog-canada",
    "left",
  ),
  "blog-04-arte-itinerarios-premium": buildBlogVisuals(
    "/media/shared/blog/portada-blog-peru.avif",
    "/media/shared/blog/blog-peru",
    "right",
  ),
  "blog-05-hospedaje-con-identidad": buildBlogVisuals(
    "/media/shared/blog/portada-blog-barrancas.avif",
    "/media/shared/blog/blog-barrancas",
    "left",
  ),
  "blog-06-experiencias-culturales-curadas": buildBlogVisuals(
    "/media/shared/blog/portada-blog-corea.avif",
    "/media/shared/blog/blog-corea",
    "right",
  ),
};

BLOG_VISUALS["blog-01-japon-premium"].byline = {
  author: "Ismael Contreras",
  date: "3 de mayo de 2026",
};
BLOG_VISUALS["blog-02-viajes-familia-premium"].byline = {
  author: "Ismael Contreras",
  date: "14 de mayo de 2026",
};
BLOG_VISUALS["blog-03-viajero-consciente"].byline = {
  author: "Ismael Contreras",
  date: "28 de mayo de 2026",
};
BLOG_VISUALS["blog-04-arte-itinerarios-premium"].byline = {
  author: "Ismael Contreras",
  date: "4 de junio de 2026",
};
BLOG_VISUALS["blog-05-hospedaje-con-identidad"].byline = {
  author: "Ismael Contreras",
  date: "9 de junio de 2026",
};
BLOG_VISUALS["blog-06-experiencias-culturales-curadas"].byline = {
  author: "Ismael Contreras",
  date: "12 de junio de 2026",
};

async function getBlogText(slug: string) {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "");
  const filePath = path.join(BLOG_DATA_DIR, `${safeSlug}.txt`);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function getReadableBlogTitle(slug: string) {
  const mappedEntry = BLOG_CONTENT_BY_SLUG[slug];
  if (mappedEntry) return mappedEntry.question;

  return slug.replace(/^blog-\d+-/i, "").replace(/-/g, " ");
}

function getBlogSubtitle(slug: string) {
  return BLOG_CONTENT_BY_SLUG[slug]?.subtitle;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blogSubtitle = getBlogSubtitle(slug);

  return {
    title: `${getReadableBlogTitle(slug)} | Blog Viajes Premium`,
    description: blogSubtitle,
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const content = await getBlogText(slug);
  const visuals = BLOG_VISUALS[slug] ?? DEFAULT_VISUALS;
  const blogSubtitle = getBlogSubtitle(slug);

  if (!content) {
    notFound();
  }

  const paragraphs = content
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const splitAt = Math.ceil(paragraphs.length / 2);
  const leftParagraphs = paragraphs.slice(0, splitAt);
  const rightParagraphs = paragraphs.slice(splitAt);

  function renderColumn(
    columnName: ImageColumn,
    columnParagraphs: string[],
    paragraphOffset: number,
  ) {
    const primaryAfter =
      visuals.primary.column === columnName
        ? Math.min(
            Math.max(visuals.primary.afterInColumn, 1),
            Math.max(columnParagraphs.length, 1),
          )
        : -1;
    const secondaryAfter =
      visuals.secondary.column === columnName
        ? Math.min(
            Math.max(visuals.secondary.afterInColumn, 1),
            Math.max(columnParagraphs.length, 1),
          )
        : -1;
    const lowerImageSrc =
      columnName === "left"
        ? (visuals.lowerLeft?.src ?? visuals.secondary.src)
        : (visuals.lowerRight?.src ?? visuals.primary.src);
    const lowerAfter =
      columnParagraphs.length > 2
        ? columnParagraphs.length - 1
        : columnParagraphs.length;

    return columnParagraphs.map((paragraph, index) => {
      const inColumnNumber = index + 1;
      const globalIndex = paragraphOffset + index;
      return (
        <div
          key={`${slug}-${columnName}-${globalIndex}`}
          className={styles.flowBlock}
        >
          <p
            className={
              globalIndex === 0 ? styles.firstParagraph : styles.paragraph
            }
          >
            {paragraph}
          </p>

          {inColumnNumber === primaryAfter ? (
            <figure className={styles.imageFigure} aria-hidden="true">
              <Image
                src={visuals.primary.src}
                alt=""
                width={980}
                height={640}
                className={styles.inlineImage}
                priority
              />
            </figure>
          ) : null}

          {inColumnNumber === secondaryAfter ? (
            <figure className={styles.imageFigure} aria-hidden="true">
              <Image
                src={visuals.secondary.src}
                alt=""
                width={980}
                height={640}
                className={styles.inlineImage}
              />
            </figure>
          ) : null}

          {inColumnNumber === lowerAfter ? (
            <figure className={styles.imageFigure} aria-hidden="true">
              <Image
                src={lowerImageSrc}
                alt=""
                width={980}
                height={640}
                className={styles.inlineImage}
              />
            </figure>
          ) : null}
        </div>
      );
    });
  }

  return (
    <>
      <main className={`${styles.page} ${styles.pageEnter}`}>
        <article className={styles.article}>
          <div className={styles.buttonContainer}>
            <Button href="/blog" variant="secondary">
              Volver al blog
            </Button>
          </div>
          <h1 className={styles.title}>{getReadableBlogTitle(slug)}</h1>
          {blogSubtitle ? (
            <p className={styles.subtitle}>{blogSubtitle}</p>
          ) : null}
          <p className={styles.byline}>
            {visuals.byline?.author ?? "Ismael Contreras"} ·{" "}
            {visuals.byline?.date ?? "Julio 2026"}
          </p>
          <figure className={styles.heroFigure} aria-hidden="true">
            <Image
              src={visuals.hero?.src ?? visuals.primary.src}
              alt=""
              width={1600}
              height={760}
              className={styles.heroImage}
              priority
            />
          </figure>
          <section className={styles.newspaperBody}>
            <div className={styles.column}>
              {renderColumn("left", leftParagraphs, 0)}
            </div>
            <div className={styles.column}>
              {renderColumn("right", rightParagraphs, splitAt)}
            </div>
          </section>
        </article>
      </main>
      <Footer config={SITE_FOOTER} />
    </>
  );
}
