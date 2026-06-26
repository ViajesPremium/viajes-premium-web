"use client";

import Badge from "@/components/ui/badge/Badge";
import { BlurredStagger } from "@/components/ui/blurred-stagger-text/BlurredStaggerText";
import FlickCardsSlider from "@/components/ui/flick-cards-slider/FlickCardsSlider";
import type { LandingTheme } from "@/features/landings/data/types";
import BracketHoverBox from "./BracketHoverBox";
import styles from "./Benefits.module.css";

type BenefitsProps = {
  landing: LandingTheme;
};

function getToneClass(
  tone: "ot" | "epochal" | undefined,
  classes: typeof styles,
) {
  return tone === "epochal" ? classes.epochal : classes.ot;
}

function splitByHighlight(text: string, highlight: string) {
  const normalizedText = text.toLowerCase();
  const normalizedHighlight = highlight.toLowerCase();
  const index = normalizedHighlight
    ? normalizedText.indexOf(normalizedHighlight)
    : -1;

  if (index < 0) {
    return { before: text, highlighted: highlight };
  }

  return {
    before: text.slice(0, index).trim(),
    highlighted: text.slice(index, index + highlight.length).trim(),
  };
}

export default function Benefits({ landing }: BenefitsProps) {
  const { benefits } = landing;
  const line4Parts = splitByHighlight(
    benefits.line4.text,
    benefits.line4.highlightWord,
  );

  return (
    <section className={styles.highlights}>
      <h2 className="srOnly">{benefits.srHeading}</h2>
      <div className={styles.container}>
        <div className={styles.badgeRow}>
          <Badge text={benefits.badgeText} variant="dark" align="center" />
        </div>

        <header className={styles.kicker}>
          <BlurredStagger
            text={benefits.kickerTop}
            className={styles.kickerTop}
          />
          <p className={styles.kickerBottom}>{benefits.kickerBottom}</p>
        </header>

        <div className={styles.editorialGrid}>
          <div className={`${styles.lineRow} ${styles.lineRowWithBracket}`}>
            <p className={`${styles.megaText} ${styles.lineText}`}>
              {benefits.line1.lead}
            </p>
            <BracketHoverBox
              className={styles.inlineBracket}
              imageSrc={benefits.line1.bracket.imageSrc}
              imageAlt={benefits.line1.bracket.imageAlt}
            >
              <p
                className={`${getToneClass(
                  benefits.line1.bracket.textTone,
                  styles,
                )} ${styles.flipInner}`}
              >
                {benefits.line1.bracket.label}
              </p>
            </BracketHoverBox>
            <p className={`${styles.megaText} ${styles.lineText}`}>
              {benefits.line1.tail}
            </p>
          </div>

          <div className={`${styles.lineRow} ${styles.lineRowWithBracket}`}>
            <BlurredStagger
              text={benefits.line2.text}
              className={`${styles.megaText} ${styles.lineText}`}
              highlights={[
                {
                  word: benefits.line2.highlightWord,
                  className: `${styles.japanWord} ${styles.secondaryUnderline}`,
                },
              ]}
            />
            <BracketHoverBox
              className={styles.inlineBracket}
              imageSrc={benefits.line2.bracket.imageSrc}
              imageAlt={benefits.line2.bracket.imageAlt}
            >
              <p
                className={`${getToneClass(
                  benefits.line2.bracket.textTone,
                  styles,
                )} ${styles.flipInner}`}
              >
                {benefits.line2.bracket.label}
              </p>
            </BracketHoverBox>
            <p className={`${styles.megaText} ${styles.lineText}`}>
              {benefits.line2.tail}
            </p>
          </div>

          <div className={`${styles.lineRow} ${styles.lineRowWithBracket}`}>
            <p className={`${styles.megaText} ${styles.lineText}`}>
              {benefits.line3.lead}
            </p>
            <BracketHoverBox
              className={styles.inlineBracket}
              imageSrc={benefits.line3.bracket.imageSrc}
              imageAlt={benefits.line3.bracket.imageAlt}
            >
              <p
                className={`${getToneClass(
                  benefits.line3.bracket.textTone,
                  styles,
                )} ${styles.flipInner}`}
              >
                {benefits.line3.bracket.label}
              </p>
            </BracketHoverBox>
            <p className={`${styles.megaText} ${styles.lineText}`}>
              {benefits.line3.tail}
            </p>
          </div>

          <div className={styles.lineRow}>
            <BlurredStagger
              text={benefits.line4.text}
              className={`${styles.megaText} ${styles.lineText}`}
              highlights={[
                {
                  word: benefits.line4.highlightWord,
                  className: styles.secondaryUnderline,
                },
              ]}
            />
          </div>
        </div>

        <div className={styles.editorialGridMobile}>
          <div className={styles.mobileLineRow}>
            <p className={`${styles.megaText} ${styles.mobileLineText}`}>
              {benefits.line1.lead}
            </p>
            <BracketHoverBox
              className={`${styles.inlineBracket} ${styles.mobileBracket}`}
              imageSrc={benefits.line1.bracket.imageSrc}
              imageAlt={benefits.line1.bracket.imageAlt}
            >
              <p
                className={`${getToneClass(
                  benefits.line1.bracket.textTone,
                  styles,
                )} ${styles.flipInner}`}
              >
                {benefits.line1.bracket.label}
              </p>
            </BracketHoverBox>
            <p className={`${styles.megaText} ${styles.mobileLineText}`}>
              {benefits.line1.tail}
            </p>
          </div>

          <div className={styles.mobileLineRow}>
            <BlurredStagger
              text={benefits.line2.text}
              className={`${styles.megaText} ${styles.mobileLineText}`}
              highlights={[
                {
                  word: benefits.line2.highlightWord,
                  className: `${styles.japanWord} ${styles.secondaryUnderline}`,
                },
              ]}
            />
            <BracketHoverBox
              className={`${styles.inlineBracket} ${styles.mobileBracket}`}
              imageSrc={benefits.line2.bracket.imageSrc}
              imageAlt={benefits.line2.bracket.imageAlt}
            >
              <p
                className={`${getToneClass(
                  benefits.line2.bracket.textTone,
                  styles,
                )} ${styles.flipInner}`}
              >
                {benefits.line2.bracket.label}
              </p>
            </BracketHoverBox>
            <p className={`${styles.megaText} ${styles.mobileLineText}`}>
              {benefits.line2.tail}
            </p>
          </div>

          <div className={styles.mobileLineRow}>
            <p className={`${styles.megaText} ${styles.mobileLineText}`}>
              {benefits.line3.lead}
            </p>
            <BracketHoverBox
              className={`${styles.inlineBracket} ${styles.mobileBracket}`}
              imageSrc={benefits.line3.bracket.imageSrc}
              imageAlt={benefits.line3.bracket.imageAlt}
            >
              <p
                className={`${getToneClass(
                  benefits.line3.bracket.textTone,
                  styles,
                )} ${styles.flipInner}`}
              >
                {benefits.line3.bracket.label}
              </p>
            </BracketHoverBox>
            <p className={`${styles.megaText} ${styles.mobileLineText}`}>
              {benefits.line3.tail}
            </p>
          </div>

          <div className={styles.mobileLineRow}>
            <BlurredStagger
              text={line4Parts.before || benefits.line4.text}
              className={`${styles.megaText} ${styles.mobileLineText}`}
            />
            <BlurredStagger
              text={line4Parts.highlighted}
              className={`${styles.megaText} ${styles.mobileLineText}`}
              highlights={[
                {
                  word: benefits.line4.highlightWord,
                  className: styles.secondaryUnderline,
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className={styles.skiperSection}>
        <FlickCardsSlider
          items={benefits.focusRailItems}
          ctaLabel={benefits.ctaPrimary.label}
        />
      </div>
    </section>
  );
}
