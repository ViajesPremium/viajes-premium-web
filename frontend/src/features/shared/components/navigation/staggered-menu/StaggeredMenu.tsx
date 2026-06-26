"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePageTransition } from "@/components/providers/page-transition/TransitionProvider";
import { scrollToSection } from "@/lib/scroll-to-section";
import { scrollToHomeDestination } from "@/lib/home-destination-navigation";
import { SocialIcon } from "@/components/ui/social-icon/SocialIcon";

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="sm-panel-dropdownIcon"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  children?: StaggeredMenuItem[];
  destinationRoute?: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  homeCta?: {
    label: string;
    href: string;
    ariaLabel?: string;
  };
  displaySocials?: boolean;
  socialsTitle?: string;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  isFixed?: boolean;
}

const DEFAULT_MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "Inicio", ariaLabel: "Ir a inicio", link: "/" },
  { label: "Nosotros", ariaLabel: "Ir a nosotros", link: "/nosotros" },
  { label: "Blog", ariaLabel: "Ir a blog", link: "/blog" },
];

const NOSOTROS_MENU_ITEM: StaggeredMenuItem = {
  label: "Nosotros",
  ariaLabel: "Ir a nosotros",
  link: "/nosotros",
};

function normalizeMenuItemLabel(item: StaggeredMenuItem): string {
  return item.label.trim().toLowerCase();
}

function withNosotrosItem(items: StaggeredMenuItem[]): StaggeredMenuItem[] {
  if (!items.length) return [NOSOTROS_MENU_ITEM];

  const alreadyHasNosotros = items.some((item) => {
    const normalizedLabel = normalizeMenuItemLabel(item);
    return normalizedLabel === "nosotros" || item.link === "/nosotros";
  });

  if (!alreadyHasNosotros) {
    return [items[0], NOSOTROS_MENU_ITEM, ...items.slice(1)];
  }

  return items.map((item) => {
    if (normalizeMenuItemLabel(item) !== "nosotros") return item;
    return {
      ...item,
      link: "/nosotros",
      ariaLabel: "Ir a nosotros",
    };
  });
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  colors = ["var(--primary)", "var(--secondary)"],
  items: providedItems,
  socialItems = [],
  homeCta,
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = "/media/shared/logos/principal-logo.svg",
  menuButtonColor = "#ffffff",
  openMenuButtonColor = "#000000",
  changeMenuColorOnOpen = true,
  accentColor = "var(--secondary)",
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) => {
  const { triggerTransition } = usePageTransition();
  const pathname = usePathname();
  const items = React.useMemo<StaggeredMenuItem[]>(() => {
    if (providedItems && providedItems.length > 0) return providedItems;
    return withNosotrosItem(DEFAULT_MENU_ITEMS);
  }, [providedItems]);

  const [open, setOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {},
  );
  const openRef = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const textWrapRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>(["Menú", "Cerrar"]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(
          preContainer.querySelectorAll(".sm-prelayer"),
        ) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current)
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(
      panel.querySelectorAll(".sm-panel-itemLabel"),
    ) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"),
    ) as HTMLElement[];
    const socialTitle = panel.querySelector(
      ".sm-socials-title",
    ) as HTMLElement | null;
    const socialLinks = Array.from(
      panel.querySelectorAll(".sm-socials-link"),
    ) as HTMLElement[];

    const layerStates = layers.map((el) => ({
      el,
      start: Number(gsap.getProperty(el, "xPercent")),
    }));
    const panelStart = Number(gsap.getProperty(panel, "xPercent"));

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { "--sm-num-opacity": 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07,
      );
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;
    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime,
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.1, from: "start" },
        },
        itemsStart,
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.08, from: "start" },
          },
          itemsStart + 0.1,
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          socialsStart,
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" });
            },
          },
          socialsStart + 0.04,
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(
          panel.querySelectorAll(".sm-panel-itemLabel"),
        ) as HTMLElement[];
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(
          panel.querySelectorAll(
            ".sm-panel-list[data-numbering] .sm-panel-item",
          ),
        ) as HTMLElement[];
        if (numberEls.length) {
          gsap.set(numberEls, { "--sm-num-opacity": 0 });
        }
        const socialTitle = panel.querySelector(
          ".sm-socials-title",
        ) as HTMLElement | null;
        const socialLinks = Array.from(
          panel.querySelectorAll(".sm-socials-link"),
        ) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busyRef.current = false;
      },
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, {
        rotate: 225,
        duration: 0.8,
        ease: "power4.out",
        overwrite: "auto",
      });
    } else {
      spinTweenRef.current = gsap.to(icon, {
        rotate: 0,
        duration: 0.35,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    }
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen],
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current
          ? openMenuButtonColor
          : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? "Menú" : "Cerrar";
    const targetLabel = opening ? "Cerrar" : "Menú";
    const cycles = 3;
    const seq: string[] = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === "Menú" ? "Cerrar" : "Menú";
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: "power4.out",
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      setOpenDropdowns({});
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [
    playOpen,
    playClose,
    animateIcon,
    animateColor,
    animateText,
    onMenuClose,
    onMenuOpen,
  ]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      setOpenDropdowns({});
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  React.useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdowns((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }, []);

  const handleNavItemClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, item: StaggeredMenuItem) => {
      const { link, destinationRoute } = item;
      closeMenu();

      if (destinationRoute) {
        event.preventDefault();
        scrollToHomeDestination(destinationRoute, {
          duration: 1.15,
          updateHash: true,
          defer: true,
        });
        return;
      }

      if (!link.startsWith("#")) {
        return;
      }

      event.preventDefault();
      scrollToSection(link, { duration: 1.15, updateHash: true, defer: true });
    },
    [closeMenu],
  );

  const handleLogoClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const didScroll = scrollToSection("#inicio", { duration: 1.15 });
      if (!didScroll) {
        triggerTransition("/");
      }
    },
    [triggerTransition],
  );

  const handleHomeCtaClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      closeMenu();
      triggerTransition(homeCta?.href ?? "/");
    },
    [closeMenu, homeCta?.href, triggerTransition],
  );

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  return (
    <div
      className={
        (className ? className + " " : "") +
        "staggered-menu-wrapper" +
        (isFixed ? " fixed-wrapper" : "")
      }
      style={
        accentColor
          ? ({ "--sm-accent": accentColor } as React.CSSProperties)
          : undefined
      }
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw =
            colors && colors.length
              ? colors.slice(0, 4)
              : ["#1e1e22", "#35353c"];
          const arr = [...raw];
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2);
            arr.splice(mid, 1);
          }
          return arr.map((c, i) => (
            <div key={i} className="sm-prelayer" style={{ background: c }} />
          ));
        })()}
      </div>
      <header
        className="staggered-menu-header"
        aria-label="Main navigation header"
      >
        <div className="sm-logo" aria-label="Logo">
          <a href="#inicio" onClick={handleLogoClick} title="Ir al inicio">
            <Image
              src={logoUrl || "/media/shared/logos/principal-logo.svg"}
              alt="Logo"
              title="Logo"
              className="sm-logo-img"
              draggable={false}
              width={110}
              height={24}
            />
          </a>
        </div>
        <div className="sm-toggle-container">
          <button
            ref={toggleBtnRef}
            className="sm-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              ref={textWrapRef}
              className="sm-toggle-textWrap"
              aria-hidden="true"
            >
              <span ref={textInnerRef} className="sm-toggle-textInner">
                {textLines.map((l, i) => (
                  <span className="sm-toggle-line" key={i}>
                    {l}
                  </span>
                ))}
              </span>
            </span>
            <span ref={iconRef} className="sm-icon" aria-hidden="true">
              <span ref={plusHRef} className="sm-icon-line" />
              <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
            </span>
          </button>
        </div>
      </header>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
        data-lenis-prevent
      >
        <div className="sm-panel-inner">
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items && items.length ? (
              items.map((it, idx) => {
                const isDropdown = Boolean(it.children && it.children.length);
                const isDropdownOpen = Boolean(openDropdowns[it.label]);

                return (
                  <li className="sm-panel-itemWrap" key={it.label + idx}>
                    {isDropdown ? (
                      <>
                        <button
                          type="button"
                          className="sm-panel-item sm-panel-button"
                          aria-label={it.ariaLabel}
                          aria-expanded={isDropdownOpen}
                          title={it.ariaLabel}
                          onClick={() => toggleDropdown(it.label)}
                        >
                          <span className="sm-panel-itemLabel">
                            {it.label}
                          </span>
                          <ChevronDownIcon />
                        </button>

                        {isDropdownOpen ? (
                          <ul className="sm-panel-sublist" role="list">
                            {it.children?.map((child, childIdx) => (
                              <li
                                className="sm-panel-subitemWrap"
                                key={child.label + childIdx}
                              >
                                <a
                                  className="sm-panel-subitem"
                                  href={child.link}
                                  aria-label={child.ariaLabel}
                                  title={child.ariaLabel}
                                  onClick={(event) =>
                                    handleNavItemClick(event, child)
                                  }
                                >
                                  <span className="sm-panel-subitemLabel">
                                    {child.label}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : (
                      <a
                        className="sm-panel-item"
                        href={it.link}
                        aria-label={it.ariaLabel}
                        title={it.ariaLabel}
                        data-index={idx + 1}
                        onClick={(event) => handleNavItemClick(event, it)}
                      >
                        <span className="sm-panel-itemLabel">{it.label}</span>
                      </a>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>
          {homeCta ? (
            <div className="sm-home-cta">
              <a
                href={homeCta.href}
                className="sm-home-cta-button"
                aria-label={
                  homeCta.ariaLabel ?? homeCta.label
                }
                title={homeCta.label}
                onClick={handleHomeCtaClick}
              >
                {homeCta.label}
              </a>
            </div>
          ) : null}
          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <span className="sm-socials-title">Síguenos en:</span>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                      aria-label={s.label}
                      title={s.label}
                    >
                      <span className="sm-socials-icon">
                        <SocialIcon platform={s.label} size={30} />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
