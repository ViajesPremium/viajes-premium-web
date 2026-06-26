"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import styles from "./FirstForm.module.css";
import ImageSectionForm, {
  type ImageSectionFormConfig,
} from "@/sections/image-section-form/Form";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import type { LandingTheme } from "@/features/landings/data/types";

type FirstFormProps = {
  landing: LandingTheme;
};

const STRENGTH = 18;
const FORM_TITLE = "Cotiza tu viaje ahora";
const FORM_TITLE_LINE_ONE = "Cotiza tu viaje";
const FORM_TITLE_HIGHLIGHT = "ahora";
const FORM_SUBTITLE =
  "Cuéntanos tu idea de viaje y encontraremos el itinerario ideal.";

export default function FirstForm({ landing }: FirstFormProps) {
  const { firstForm } = landing;
  const formConfig: ImageSectionFormConfig = {
    eyebrow: firstForm.eyebrow,
    submitLabel: firstForm.submitLabel,
    contactEmail: firstForm.contactEmail,
    contactPhoneDisplay: firstForm.contactPhoneDisplay,
    contactPhoneLink: firstForm.contactPhoneLink,
    crmTag: firstForm.crmTag ?? `#tags:${landing.label}`,
    labels: firstForm.labels,
    placeholders: firstForm.placeholders,
    experienceOptions: firstForm.experienceOptions as unknown as ImageSectionFormConfig["experienceOptions"],
  };

  const sectionRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  const imgX = useTransform(x, [-1, 1], [-STRENGTH, STRENGTH]);
  const imgY = useTransform(y, [-1, 1], [-STRENGTH, STRENGTH]);

  const sectionStyle = {
    "--first-form-bg-image": `url("${firstForm.backgroundImage}")`,
  } as CSSProperties;

  const titleHighlights = [
    {
      word: FORM_TITLE_HIGHLIGHT,
      useGradient: true,
      gradientColors: ["#BF953F", "#FCF6BA", "#B38728"],
    },
  ];

  return (
    <section ref={sectionRef} className={styles.section} style={sectionStyle}>
      <h2 className="srOnly">{firstForm.srHeading}</h2>
      <motion.div
        className={styles.img}
        aria-hidden="true"
        style={{ x: imgX, y: imgY }}
      />
      <div className={styles.imgOverlay} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.sectionCopy}>
            <div className={styles.sectionTitleStack} aria-label={FORM_TITLE}>
              <BlurredStagger
                text={FORM_TITLE_LINE_ONE}
                className={styles.sectionTitle}
                align="left"
              />
              <BlurredStagger
                text={FORM_TITLE_HIGHLIGHT}
                className={styles.sectionTitle}
                highlights={titleHighlights}
                align="left"
              />
            </div>
            <p className={styles.sectionSubtitle}>{FORM_SUBTITLE}</p>
          </div>
          <ImageSectionForm
            config={formConfig}
            idPrefix="first-form"
            theme="light"
          />

          {firstForm.mobileImage ? (
            <div className={styles.mobileGallery} aria-hidden="true">
              <div className={styles.mobileGalleryItem}>
                <Image
                  src={firstForm.mobileImage.src}
                  alt={firstForm.mobileImage.alt}
                  title={firstForm.mobileImage.alt}
                  width={900}
                  height={1400}
                  sizes="(max-width: 768px) 100vw, 0px"
                  className={styles.mobileGalleryImage}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.right} />
      </div>
    </section>
  );
}
