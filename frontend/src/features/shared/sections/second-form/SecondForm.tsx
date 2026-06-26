"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import ImageSectionForm, {
  type ImageSectionFormConfig,
} from "@/sections/image-section-form/Form";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import styles from "./SecondForm.module.css";
import type { LandingTheme } from "@/features/landings/data/types";

type SecondFormProps = {
  landing: LandingTheme;
};

const STRENGTH = 18;
const FORM_TITLE = "Cotiza tu viaje ahora";
const FORM_TITLE_HIGHLIGHT = "ahora";
const FORM_SUBTITLE =
  "Cuéntanos tu idea de viaje y encontraremos el itinerario ideal.";

export default function SecondForm({ landing }: SecondFormProps) {
  const { secondForm } = landing;
  const formConfig: ImageSectionFormConfig = {
    eyebrow: secondForm.eyebrow,
    submitLabel: secondForm.submitLabel,
    contactEmail: secondForm.contactEmail,
    contactPhoneDisplay: secondForm.contactPhoneDisplay,
    contactPhoneLink: secondForm.contactPhoneLink,
    crmTag: secondForm.crmTag ?? `#tags:${landing.label}`,
    labels: secondForm.labels,
    placeholders: secondForm.placeholders,
    experienceOptions:
      secondForm.experienceOptions as unknown as ImageSectionFormConfig["experienceOptions"],
  };

  const sectionRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });
  const imgX = useTransform(x, [-1, 1], [-STRENGTH, STRENGTH]);
  const imgY = useTransform(y, [-1, 1], [-STRENGTH, STRENGTH]);

  const sectionStyle = {
    "--cta-form-bg-image": `url("${secondForm.backgroundImage}")`,
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
      <h2 className="srOnly">{secondForm.srHeading}</h2>

      <div className={styles.stage}>
        <motion.div
          className={styles.bgImage}
          aria-hidden="true"
          style={{ x: imgX, y: imgY }}
        />
        <div className={styles.bgOverlay} aria-hidden="true" />

        <div className={styles.formLayer}>
          <div className={styles.inner}>
            <div className={styles.leftPane} aria-hidden="true" />

            <div className={styles.rightPane}>
              <div className={styles.sectionCopy}>
                <BlurredStagger
                  text={FORM_TITLE}
                  className={styles.sectionTitle}
                  highlights={titleHighlights}
                  align="right"
                />
                <p className={styles.sectionSubtitle}>{FORM_SUBTITLE}</p>
              </div>

              <div className={styles.formShell}>
                <ImageSectionForm
                  config={formConfig}
                  idPrefix="second-form"
                  theme="dark"
                />
              </div>

              {secondForm.mobileImage ? (
                <div className={styles.mobileGallery} aria-hidden="true">
                  <div className={styles.mobileGalleryItem}>
                    <Image
                      src={secondForm.mobileImage.src}
                      alt={secondForm.mobileImage.alt}
                      title={secondForm.mobileImage.alt}
                      width={900}
                      height={1400}
                      sizes="(max-width: 768px) 100vw, 0px"
                      className={styles.mobileGalleryImage}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
