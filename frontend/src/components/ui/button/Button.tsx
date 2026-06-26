import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import "./button.css";

type ButtonVariant = "primary" | "secondary" | "outline";

const BASE_CLASSNAME = "buttonBase";

const VARIANT_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: "buttonPrimary",
  secondary: "buttonSecondary",
  outline: "buttonOutline",
};

export const buttonVariants = (variant: ButtonVariant = "primary") =>
  `${BASE_CLASSNAME} ${VARIANT_CLASSNAMES[variant]}`;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", children, fullWidth = false, style, ...props },
    ref,
  ) => {
    const nextClassName = `${buttonVariants(variant)} ${className}`.trim();
    const wrapperStyle: React.CSSProperties = fullWidth
      ? { position: "relative", display: "block", width: "100%" }
      : { position: "relative", display: "inline-block" };
    const buttonStyle: React.CSSProperties | undefined = fullWidth
      ? { ...style, width: "100%", maxWidth: "none" }
      : style;

    return (
      <div className="buttonWrapper" style={wrapperStyle}>
        <button ref={ref} className={nextClassName} style={buttonStyle} {...props}>
          <span className="buttonLabel">{children}</span>

          {variant === "primary" && (
            <span className="buttonIcon" aria-hidden="true">
              <ArrowUpRight size={16} />
            </span>
          )}
        </button>
      </div>
    );
  },
);

Button.displayName = "Button";

export { Button };
