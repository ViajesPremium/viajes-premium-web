"use client";

import type { ButtonHTMLAttributes, CSSProperties, ForwardedRef } from "react";
import { forwardRef } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "outline";

const BASE_CLASSNAME = styles.buttonBase;

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  outline: styles.buttonOutline,
};

export const buttonVariants = (variant: ButtonVariant = "primary") =>
  `${BASE_CLASSNAME} ${VARIANT_CLASSNAMES[variant]}`;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const Button = forwardRef(function Button(
  {
    className = "",
    variant = "primary",
    children,
    fullWidth = false,
    style,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const nextClassName = `${buttonVariants(variant)} ${className}`.trim();
  const wrapperStyle: CSSProperties = fullWidth
    ? { position: "relative", display: "block", width: "100%" }
    : { position: "relative", display: "inline-block" };
  const buttonStyle: CSSProperties | undefined = fullWidth
    ? { ...style, width: "100%", maxWidth: "none" }
    : style;

  return (
    <div className={styles.buttonWrapper} style={wrapperStyle}>
      <button ref={ref} className={nextClassName} style={buttonStyle} {...props}>
        <span className={styles.buttonLabel}>{children}</span>

        {variant === "primary" && (
          <span className={styles.buttonIcon} aria-hidden="true">
            <ArrowUpRightIcon />
          </span>
        )}
      </button>
    </div>
  );
});

Button.displayName = "Button";

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export { Button };
