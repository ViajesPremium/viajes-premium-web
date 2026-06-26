export type ScrollToSectionOptions = {
  duration?: number;
  updateHash?: boolean;
  defer?: boolean;
};

export function scrollToSection(
  selector: string,
  options: ScrollToSectionOptions = {},
) {
  if (typeof window === "undefined") return false;

  const hash = selector.startsWith("#") ? selector.slice(1) : selector;
  const target = document.getElementById(hash);

  if (!target) return false;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  if (options.updateHash) {
    window.history.replaceState(null, "", `#${hash}`);
  }

  return true;
}
