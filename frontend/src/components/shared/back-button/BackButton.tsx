"use client";

import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { Button } from "@/components/ui/button/Button";
import styles from "./BackButton.module.css";

type BackButtonProps = {
  /**
   * Si se proporciona, usa page-transition para navegar a esa ruta.
   * Si no se proporciona, usa router.back() + router.refresh().
   */
  href?: string;
  variant?: "outline" | "primary";
};

export default function BackButton({ href, variant = "outline" }: BackButtonProps) {
  const { triggerTransition } = usePageTransition();
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      triggerTransition(href);
    } else {
      router.back();
      setTimeout(() => {
        router.refresh();
      }, 50);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={href ? styles.backButton : undefined}
      onClick={handleClick}
    >
      Regresar
    </Button>
  );
}
