"use client";

import {
  type CSSProperties,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, Send, X } from "lucide-react";
import { useAnimationsEnabled } from "@/lib/animation-budget";
import { getLeadAttribution } from "@/lib/lead-attribution";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { pushLeadStartedEvent } from "@/lib/gtm";
import styles from "./ChatAssistant.module.css";

type ChatAssistantDockProps = {
  enabled: boolean;
  botSlug: string;
  brandLabel: string;
  avatarSrc: string;
  accentColor: string;
  welcomeMessage: string;
  quickReplies: string[];
};

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  source?: string;
};

type ChatApiResponse = {
  ok?: boolean;
  bot_slug?: string;
  session_id?: string;
  conversation_id?: string;
  stage?: string;
  score?: number;
  handoff?: {
    required?: boolean;
    reason?: string;
  };
  response?: {
    text?: string;
    source?: string;
  };
  knowledge?: {
    slug?: string;
    brand_name?: string;
    display_name?: string;
  };
  lead?: {
    id?: string;
    name?: string;
    phone?: string;
    stage?: string;
    score?: number;
    handoff_required?: boolean;
    handoff_reason?: string;
  };
  error?: string;
};

const STORAGE_PREFIX = "viajes-premium-chat";
const MAX_HISTORY_ITEMS = 30;

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getInitials(value: string) {
  const tokens = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (tokens.length === 0) return "VP";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase();
}

function getStorageKeys(botSlug: string) {
  return {
    session: `${STORAGE_PREFIX}:${botSlug}:session`,
    historyPrefix: `${STORAGE_PREFIX}:${botSlug}:history`,
  };
}

function getLeadStartedStorageKey(
  botSlug: string,
  sessionId: string,
  conversationId?: string,
) {
  const trackingId = conversationId?.trim() || sessionId.trim();
  return `${STORAGE_PREFIX}:${botSlug}:lead_started:${trackingId}`;
}

function normalizeStoredMessages(raw: string | null): ChatMessage[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(
        (item): ChatMessage => ({
          id: typeof item?.id === "string" ? item.id : createId("msg"),
          role: item?.role === "user" ? "user" : "assistant",
          content: typeof item?.content === "string" ? item.content.trim() : "",
          source:
            typeof item?.source === "string" && item.source.trim() !== ""
              ? item.source
              : undefined,
        }),
      )
      .filter((item) => item.content !== "");
  } catch {
    return [];
  }
}

function buildWelcomeMessage(text: string): ChatMessage {
  return {
    id: createId("welcome"),
    role: "assistant",
    content: text,
    source: "system",
  };
}

function buildErrorMessage(): ChatMessage {
  return {
    id: createId("error"),
    role: "assistant",
    content:
      "No pude conectar con el asesor en este momento. Intenta de nuevo en unos segundos.",
    source: "error",
  };
}

function useMobilePageScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked || typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    let unlockScroll: (() => void) | null = null;

    const lockScroll = () => {
      unlockScroll?.();
      unlockScroll = null;

      if (!mobileQuery.matches) return;

      const scrollY = window.scrollY;
      const { body, documentElement } = document;
      const lenis = window.__lenis;
      const wasLenisStopped = lenis?.isStopped === true;
      const previousBodyStyles = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflow: body.style.overflow,
      };
      const previousHtmlOverflow = documentElement.style.overflow;

      lenis?.stop();

      documentElement.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";

      unlockScroll = () => {
        body.style.position = previousBodyStyles.position;
        body.style.top = previousBodyStyles.top;
        body.style.left = previousBodyStyles.left;
        body.style.right = previousBodyStyles.right;
        body.style.width = previousBodyStyles.width;
        body.style.overflow = previousBodyStyles.overflow;
        documentElement.style.overflow = previousHtmlOverflow;

        window.scrollTo(0, scrollY);

        if (lenis && !wasLenisStopped) {
          lenis.start();
          lenis.resize();
        }
      };
    };

    lockScroll();
    mobileQuery.addEventListener("change", lockScroll);

    return () => {
      mobileQuery.removeEventListener("change", lockScroll);
      unlockScroll?.();
    };
  }, [isLocked]);
}

export default function ChatAssistantDock({
  enabled,
  botSlug,
  brandLabel,
  avatarSrc,
  accentColor,
  welcomeMessage,
  quickReplies,
}: ChatAssistantDockProps) {
  const inputId = useId();
  const animationsEnabled = useAnimationsEnabled();
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const loadedHistoryRef = useRef(false);
  const storageKeys = useMemo(() => getStorageKeys(botSlug), [botSlug]);
  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const [isManuallyClosed, setIsManuallyClosed] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const isOpen = isManuallyOpen || (hasAutoOpened && !isManuallyClosed);
  const [isSending, setIsSending] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";

    const storedSessionId = window.localStorage.getItem(storageKeys.session);
    if (storedSessionId) return storedSessionId;

    const nextSessionId = createId("chat");
    window.localStorage.setItem(storageKeys.session, nextSessionId);
    return nextSessionId;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    buildWelcomeMessage(welcomeMessage),
  ]);
  const [draft, setDraft] = useState("");
  const [stage, setStage] = useState("new");
  const [score, setScore] = useState(0);
  const [handoffReason, setHandoffReason] = useState("");
  const [responseSource, setResponseSource] = useState("rules");

  useMobilePageScrollLock(enabled && isOpen);

  const fallbackInitials = useMemo(() => getInitials(brandLabel), [brandLabel]);
  const panelVariants = useMemo(
    () => ({
      closed: {
        opacity: 0,
        y: 14,
        clipPath: "inset(0 0 100% 0 round 2rem)",
        transition: {
          duration: 0.12,
          ease: "easeIn" as const,
        },
      },
      open: {
        opacity: 1,
        y: 0,
        clipPath: "inset(0 0 0% 0 round 2rem)",
        transition: {
          type: "spring" as const,
          stiffness: 240,
          damping: 26,
          mass: 0.9,
        },
      },
    }),
    [],
  );
  const fabIconVariants = useMemo(
    () => ({
      closed: {
        opacity: 0,
        rotate: -18,
      },
      open: {
        opacity: 1,
        rotate: 0,
      },
      exit: {
        opacity: 0,
        rotate: 18,
      },
    }),
    [],
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const timer = window.setTimeout(() => {
      if (!isManuallyOpen && !isManuallyClosed) {
        setHasAutoOpened(true);
      }
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [enabled, isManuallyClosed, isManuallyOpen]);

  useEffect(() => {
    if (
      !enabled ||
      !sessionId ||
      typeof window === "undefined" ||
      loadedHistoryRef.current
    ) {
      return;
    }

    const storedMessages = normalizeStoredMessages(
      window.localStorage.getItem(
        `${storageKeys.historyPrefix}:${sessionId}`,
      ),
    );

    loadedHistoryRef.current = true;

    if (storedMessages.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessages(storedMessages);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [enabled, sessionId, storageKeys.historyPrefix]);

  useEffect(() => {
    if (!enabled || !sessionId || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      `${storageKeys.historyPrefix}:${sessionId}`,
      JSON.stringify(messages.slice(-MAX_HISTORY_ITEMS)),
    );
  }, [enabled, sessionId, messages, storageKeys.historyPrefix]);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    messageList.scrollTop = messageList.scrollHeight;
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (isOpen && !isSending) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen, isSending]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const sendMessage = async (rawValue: string) => {
    const value = rawValue.trim();
    if (!enabled || !value || isSending) return;

    if (typeof window === "undefined") return;

    const nextSessionId =
      sessionId ||
      (() => {
        const fallbackSessionId = createId("chat");
        window.localStorage.setItem(storageKeys.session, fallbackSessionId);
        return fallbackSessionId;
      })();

    appendMessage({
      id: createId("user"),
      role: "user",
      content: value,
    });
    setDraft("");
    setIsSending(true);

    try {
      const response = await fetch("/api/v1/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bot_slug: botSlug,
          session_id: nextSessionId,
          landing_url: window.location.href,
          message: value,
          attribution: getLeadAttribution(window.location.pathname),
        }),
      });

      const payload = (await response
        .json()
        .catch(() => null)) as ChatApiResponse | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error || `No se pudo responder (${response.status})`,
        );
      }

      const leadName = payload.lead?.name?.trim() ?? "";
      const leadPhone = payload.lead?.phone?.trim() ?? "";
      const trackingSessionId = payload.session_id || nextSessionId;
      const trackingKey = getLeadStartedStorageKey(
        botSlug,
        trackingSessionId,
        payload.conversation_id,
      );

      if (
        leadName &&
        leadPhone &&
        window.localStorage.getItem(trackingKey) !== "1"
      ) {
        pushLeadStartedEvent({
          pathname: window.location.pathname,
          botSlug,
          sessionId: trackingSessionId,
          conversationId: payload.conversation_id,
          stage: payload.stage,
          score: typeof payload.score === "number" ? payload.score : undefined,
        });
        window.localStorage.setItem(trackingKey, "1");
      }

      const assistantText =
        payload.response?.text?.trim() ||
        "Con gusto. Un asesor especializado le dara seguimiento en breve.";

      appendMessage({
        id: createId("assistant"),
        role: "assistant",
        content: assistantText,
        source: payload.response?.source || "rules",
      });

      setStage(payload.stage || "new");
      setScore(typeof payload.score === "number" ? payload.score : 0);
      setHandoffReason(payload.handoff?.reason || "");
      setResponseSource(payload.response?.source || "rules");
    } catch {
      appendMessage(buildErrorMessage());
      setResponseSource("error");
    } finally {
      setIsSending(false);
    }
  };

  if (!enabled) return null;

  return (
    <div
      className={styles.dock}
      onPointerDownCapture={(event) => event.stopPropagation()}
      style={{ "--chat-accent": accentColor } as CSSProperties}
    >
      <AnimatePresence mode="sync">
        {isOpen ? (
          <motion.section
            key={`${botSlug}-panel`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            className={styles.panel}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerBg} />
              <div className={styles.headerRow}>
                <div className={styles.headerLeft}>
                  <div className={styles.avatarWrap}>
                    <Avatar className={styles.headerAvatar}>
                      <AvatarImage src={avatarSrc} alt={brandLabel} />
                      <AvatarFallback
                        className={styles.headerAvatarFallback}
                        aria-hidden="true"
                      >
                        {fallbackInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className={styles.statusDot} />
                  </div>

                  <div className={styles.agentInfo}>
                    <p className={styles.agentName}>Concierge Premium</p>
                    <p className={styles.agentStatus}>Disponible ahora</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsManuallyClosed(true);
                    setIsManuallyOpen(false);
                  }}
                  className={styles.closeBtn}
                  aria-label="Cerrar chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {/* Messages */}
              <div ref={messageListRef} className={styles.messageList} data-lenis-prevent>
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : ""}`}
                    >
                      <Avatar
                        className={`${styles.msgAvatar} ${isUser ? styles.msgAvatarUser : styles.msgAvatarAssistant}`}
                      >
                        {isUser ? (
                          <AvatarFallback
                            className={`${styles.msgAvatarFallback} ${styles.msgAvatarFallbackUser}`}
                          >
                            TU
                          </AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src={avatarSrc} alt={brandLabel} />
                            <AvatarFallback
                              className={`${styles.msgAvatarFallback} ${styles.msgAvatarFallbackAssistant}`}
                            >
                              {fallbackInitials}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>

                      <div
                        className={`${styles.bubbleWrap} ${isUser ? styles.bubbleWrapUser : ""}`}
                      >
                        <div
                          className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}
                        >
                          <p className={styles.bubbleText}>{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isSending ? (
                  <div className={styles.typingRow}>
                    <Avatar className={styles.typingAvatar}>
                      <AvatarImage src={avatarSrc} alt={brandLabel} />
                      <AvatarFallback className={styles.typingAvatarFallback}>
                        {fallbackInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={styles.typingBubble}>
                      <span className={styles.typingDots}>
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                        <span className={styles.typingDot} />
                      </span>
                    </div>
                  </div>
                ) : null}

              </div>

              {/* Input form */}
              <form
                className={styles.form}
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(draft);
                }}
              >
                <label className={styles.srOnly} htmlFor={inputId}>
                  Escribe tu mensaje
                </label>
                <input
                  ref={inputRef}
                  id={inputId}
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className={styles.input}
                  autoComplete="off"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className={styles.sendBtn}
                  aria-label="Enviar mensaje"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsManuallyClosed(true);
            setIsManuallyOpen(false);
            return;
          }

          setIsManuallyClosed(false);
          setIsManuallyOpen(true);
        }}
        animate={
          animationsEnabled && !isOpen
            ? { y: [0, -3, 0], boxShadow: ["0 10px 24px rgba(0,0,0,0.18)", "0 16px 36px rgba(0,0,0,0.28)", "0 10px 24px rgba(0,0,0,0.18)"] }
            : undefined
        }
        transition={
          animationsEnabled && !isOpen
            ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        whileHover={
          animationsEnabled
            ? {
                scale: 1.04,
                y: -2,
                transition: { type: "spring", stiffness: 260, damping: 18 },
              }
            : undefined
        }
        whileTap={animationsEnabled ? { scale: 0.985 } : undefined}
        className={`${styles.fab} ${isOpen ? styles.fabOpen : styles.fabClosed}`}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            className={styles.fabIconWrap}
            variants={fabIconVariants}
            initial="closed"
            animate="open"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
