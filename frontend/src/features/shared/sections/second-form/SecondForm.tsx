"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import ImageSectionForm, {
  type ImageSectionFormConfig,
  type ImageSectionFormTheme,
} from "@/sections/image-section-form/Form";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import styles from "./SecondForm.module.css";
import type { LandingFormSection, LandingTheme } from "@/features/landings/data/types";

const DEFAULT_CTA_FORM_MOBILE_FIGURE_IMAGE =
  "/media/shared/home/form/form-sola.webp";
const DEFAULT_CTA_FORM_TITLE_HIGHLIGHT_COLORS = [
  "#BF953F",
  "#FCF6BA",
  "#B38728",
];
const CTA_FORM_MOBILE_FIGURE_IMAGE_BY_LANDING: Record<
  LandingTheme["slug"],
  string
> = {
  "barrancas-premium": "/media/landings/barrancas/forms/formulario-barrancas-2.webp",
  "europa-premium": "/media/landings/europa/forms/form-europa-sola.webp",
  "corea-premium": "/media/landings/corea/forms/form-corea-sola.webp",
  "japon-premium": "/media/shared/home/form/form-sola.webp",
};

export type SecondFormContent = Pick<
  LandingFormSection,
  | "srHeading"
  | "eyebrow"
  | "title"
  | "description"
  | "backgroundImage"
  | "mobileImage"
  | "submitLabel"
  | "contactEmail"
  | "contactPhoneDisplay"
  | "contactPhoneLink"
  | "crmTag"
  | "labels"
  | "placeholders"
  | "experienceOptions"
> & {
  theme?: ImageSectionFormTheme;
  titleHighlightWord?: string;
};

type SecondFormProps =
  | {
      landing: LandingTheme;
      id?: string;
    }
  | {
      content: SecondFormContent;
      id?: string;
    };

function inferHighlightWord(title: string): string | undefined {
  const normalized = title
    .replace(/[.!?¡¿]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return normalized.at(-1);
}

function buildContentFromLanding(landing: LandingTheme): SecondFormContent {
  const { slug, secondForm } = landing;

  return {
    ...secondForm,
    mobileImage:
      secondForm.mobileImage ?? {
        src:
          CTA_FORM_MOBILE_FIGURE_IMAGE_BY_LANDING[slug] ??
          DEFAULT_CTA_FORM_MOBILE_FIGURE_IMAGE,
        alt: `Imagen decorativa del formulario de ${landing.label}`,
      },
    theme: "dark",
    titleHighlightWord: inferHighlightWord(secondForm.title),
  };
}

function normalizeContent(props: SecondFormProps): SecondFormContent {
  return "landing" in props ? buildContentFromLanding(props.landing) : props.content;
}

function buildFormConfig(
  content: SecondFormContent,
  fallbackCrmTag?: string,
): ImageSectionFormConfig {
  return {
    eyebrow: content.eyebrow,
    submitLabel: content.submitLabel,
    contactEmail: content.contactEmail,
    contactPhoneDisplay: content.contactPhoneDisplay,
    contactPhoneLink: content.contactPhoneLink,
    crmTag: content.crmTag ?? fallbackCrmTag,
    labels: content.labels,
    placeholders: content.placeholders,
    experienceOptions:
      content.experienceOptions as unknown as ImageSectionFormConfig["experienceOptions"],
  };
}

export default function SecondForm(props: SecondFormProps) {
  const content = normalizeContent(props);
  const formTheme = content.theme ?? "dark";
  const formConfig = buildFormConfig(
    content,
    "landing" in props ? `#tags:${props.landing.label}` : undefined,
  );
  const titleHighlightWord =
    content.titleHighlightWord ?? inferHighlightWord(content.title);
  const mobileFigureImage =
    content.mobileImage?.src ?? DEFAULT_CTA_FORM_MOBILE_FIGURE_IMAGE;
  const mobileFigureAlt =
    content.mobileImage?.alt ?? "Imagen decorativa del formulario";
  const sectionId = props.id ?? "second-form";

  const sectionStyle = {
    "--cta-form-bg-image": `url("${content.backgroundImage}")`,
  } as CSSProperties;

  const titleHighlights = titleHighlightWord
    ? [
        {
          word: titleHighlightWord,
          useGradient: true,
          gradientColors: DEFAULT_CTA_FORM_TITLE_HIGHLIGHT_COLORS,
        },
      ]
    : [];

  return (
    <section id={sectionId} className={styles.section} style={sectionStyle}>
      <h2 className="srOnly">{content.srHeading}</h2>

      <div className={styles.stage}>
        <div className={styles.bgImage} aria-hidden="true" />
        <div className={styles.bgOverlay} aria-hidden="true" />

        <div className={styles.formLayer}>
          <div className={styles.inner}>
            <div className={styles.leftPane} aria-hidden="true" />

            <div className={styles.rightPane}>
              <div className={styles.sectionCopy}>
                <BlurredStagger
                  text={content.title}
                  className={styles.sectionTitle}
                  highlights={titleHighlights}
                  align="right"
                />
                <p className={styles.sectionSubtitle}>{content.description}</p>
              </div>

              <div className={styles.formShell}>
                <ImageSectionForm
                  config={formConfig}
                  idPrefix={sectionId}
                  theme={formTheme}
                />
              </div>

              <div className={styles.mobileGallery} aria-hidden="true">
                <div className={styles.mobileGalleryItem}>
                  <Image
                    src={mobileFigureImage}
                    alt={mobileFigureAlt}
                    title={mobileFigureAlt}
                    width={900}
                    height={1400}
                    sizes="(max-width: 768px) 100vw, 0px"
                    className={styles.mobileGalleryImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
