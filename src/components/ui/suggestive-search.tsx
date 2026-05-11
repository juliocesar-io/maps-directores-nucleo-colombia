"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DefaultLeading = () => <Search className="size-4 text-muted-foreground" />;

export interface EffectRendererProps {
  text: string;
  isActive: boolean;
  allowDelete?: boolean;
  typeDurationMs: number;
  deleteDurationMs: number;
  pauseAfterTypeMs: number;
  prefersReducedMotion?: boolean;
  onDeleteComplete?: () => void;
  containerRef?: RefObject<HTMLElement | null>;
}

export type BuiltinEffect = "typewriter" | "slide" | "fade" | "none";

export interface SuggestiveSearchProps {
  value?: string;
  onChange?: (val: string) => void;
  onEnter?: () => void;
  suggestions?: string[];
  className?: string;
  Leading?: () => React.ReactNode;
  showLeading?: boolean;
  Trailing?: () => React.ReactNode;
  showTrailing?: boolean;
  effect?: BuiltinEffect;
  EffectComponent?: React.ComponentType<EffectRendererProps>;
  typeDurationMs?: number;
  deleteDurationMs?: number;
  pauseAfterTypeMs?: number;
  animateMode?: "infinite" | "once";
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export const TypewriterEffect: React.FC<EffectRendererProps> = ({
  text,
  isActive,
  allowDelete = true,
  typeDurationMs,
  deleteDurationMs,
  pauseAfterTypeMs,
  prefersReducedMotion,
  onDeleteComplete,
  containerRef,
}) => {
  const [phase, setPhase] = useState<"typing" | "paused" | "deleting">(
    "typing",
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [text, isActive, allowDelete]);

  useEffect(() => {
    if (!isActive || !prefersReducedMotion || !allowDelete) return;
    const t = setTimeout(
      () => onDeleteComplete?.(),
      Math.max(200, pauseAfterTypeMs),
    );
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [
    isActive,
    prefersReducedMotion,
    allowDelete,
    pauseAfterTypeMs,
    onDeleteComplete,
  ]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement> | undefined}
      style={{
        display: "inline-block",
        overflow: "hidden",
        whiteSpace: "nowrap",
        alignItems: "center",
      }}
    >
      {prefersReducedMotion ? (
        <span className="select-none text-sm text-muted-foreground">{text}</span>
      ) : (
        <motion.div
          key={text}
          initial={{ width: "0%" }}
          animate={
            phase === "typing"
              ? { width: "100%" }
              : phase === "deleting"
                ? { width: "0%" }
                : { width: "100%" }
          }
          transition={
            phase === "typing"
              ? { duration: typeDurationMs / 1000, ease: "linear" }
              : phase === "deleting"
                ? { duration: deleteDurationMs / 1000, ease: "linear" }
                : {}
          }
          onAnimationComplete={() => {
            if (phase === "typing") {
              setPhase("paused");
              if (allowDelete) {
                const t = setTimeout(
                  () => setPhase("deleting"),
                  pauseAfterTypeMs,
                );
                timers.current.push(t);
              }
            } else if (phase === "deleting") {
              onDeleteComplete?.();
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <span className="select-none text-sm text-muted-foreground">{text}</span>
          <motion.span
            aria-hidden
            style={{
              display: "inline-block",
              width: 1,
              marginLeft: 4,
              height: "1.1em",
              verticalAlign: "middle",
            }}
            className="bg-muted-foreground"
            animate={
              phase === "typing" || phase === "paused"
                ? { opacity: [0, 1, 0] }
                : { opacity: 0 }
            }
            transition={
              phase === "typing" || phase === "paused"
                ? { repeat: Infinity, duration: 0.9, ease: "linear" }
                : { duration: 0.1 }
            }
          />
        </motion.div>
      )}
    </div>
  );
};

export const SlideEffect: React.FC<EffectRendererProps> = ({
  text,
  isActive,
  allowDelete = true,
  typeDurationMs,
  deleteDurationMs,
  pauseAfterTypeMs,
  prefersReducedMotion,
  onDeleteComplete,
  containerRef,
}) => {
  const [phase, setPhase] = useState<"enter" | "pause" | "exit">("enter");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [text, isActive, allowDelete]);

  useEffect(() => {
    if (!isActive || !prefersReducedMotion || !allowDelete) return;
    const t = setTimeout(
      () => onDeleteComplete?.(),
      Math.max(200, pauseAfterTypeMs),
    );
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [
    isActive,
    prefersReducedMotion,
    allowDelete,
    pauseAfterTypeMs,
    onDeleteComplete,
  ]);

  if (!isActive) return null;

  if (prefersReducedMotion) {
    return <span className="select-none text-sm text-muted-foreground">{text}</span>;
  }

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement> | undefined}
      style={{
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "nowrap",
        alignItems: "center",
      }}
    >
      <motion.div
        key={text}
        initial={{ y: "-100%" }}
        animate={
          phase === "enter"
            ? { y: "0%" }
            : phase === "exit"
              ? { y: "100%" }
              : { y: "0%" }
        }
        transition={
          phase === "enter"
            ? { duration: typeDurationMs / 1000, ease: "easeOut" }
            : { duration: deleteDurationMs / 1000, ease: "easeIn" }
        }
        onAnimationComplete={() => {
          if (phase === "enter") {
            setPhase("pause");
            if (allowDelete) {
              const t = setTimeout(
                () => setPhase("exit"),
                pauseAfterTypeMs,
              );
              timers.current.push(t);
            }
          } else if (phase === "exit") {
            onDeleteComplete?.();
          }
        }}
        style={{ display: "inline-block" }}
      >
        <span className="select-none text-sm text-muted-foreground">{text}</span>
      </motion.div>
    </div>
  );
};

export const FadeEffect: React.FC<EffectRendererProps> = ({
  text,
  isActive,
  allowDelete = true,
  typeDurationMs,
  deleteDurationMs,
  pauseAfterTypeMs,
  prefersReducedMotion,
  onDeleteComplete,
  containerRef,
}) => {
  const [phase, setPhase] = useState<"fadeIn" | "hold" | "fadeOut">("fadeIn");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [text, isActive, allowDelete]);

  useEffect(() => {
    if (!isActive || !prefersReducedMotion || !allowDelete) return;
    const t = setTimeout(
      () => onDeleteComplete?.(),
      Math.max(200, pauseAfterTypeMs),
    );
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [
    isActive,
    prefersReducedMotion,
    allowDelete,
    pauseAfterTypeMs,
    onDeleteComplete,
  ]);

  if (!isActive) return null;

  if (prefersReducedMotion) {
    return <span className="select-none text-sm text-muted-foreground">{text}</span>;
  }

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement> | undefined}
      style={{
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      <motion.div
        key={text}
        initial={{ opacity: 0 }}
        animate={
          phase === "fadeIn"
            ? { opacity: 1 }
            : phase === "fadeOut"
              ? { opacity: 0 }
              : { opacity: 1 }
        }
        transition={
          phase === "fadeIn"
            ? { duration: typeDurationMs / 1000 }
            : { duration: deleteDurationMs / 1000 }
        }
        onAnimationComplete={() => {
          if (phase === "fadeIn") {
            setPhase("hold");
            if (allowDelete) {
              const t = setTimeout(
                () => setPhase("fadeOut"),
                pauseAfterTypeMs,
              );
              timers.current.push(t);
            }
          } else if (phase === "fadeOut") {
            onDeleteComplete?.();
          }
        }}
        style={{ display: "inline-block" }}
      >
        <span className="select-none text-sm text-muted-foreground">{text}</span>
      </motion.div>
    </div>
  );
};

export const SuggestiveSearch: React.FC<SuggestiveSearchProps> = ({
  value,
  onChange,
  onEnter,
  suggestions = ["Buscar coordinador", "Buscar departamento por nombre o código"],
  className,
  Leading = DefaultLeading,
  showLeading = true,
  Trailing,
  showTrailing = false,
  effect = "typewriter",
  EffectComponent,
  typeDurationMs = 500,
  deleteDurationMs = 300,
  pauseAfterTypeMs = 1500,
  animateMode = "infinite",
  placeholder,
  onFocus,
  onBlur,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const search = value ?? internalValue;
  const [isFocused, setIsFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const prefersReduced = useReducedMotionPreference();

  const current = useMemo(() => suggestions[index] ?? "", [suggestions, index]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const leadingRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const trailingRef = useRef<HTMLDivElement | null>(null);

  const [leftOffsetPx, setLeftOffsetPx] = useState<number | null>(null);
  const [rightOffsetPx, setRightOffsetPx] = useState<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const lead = leadingRef.current;
    const trail = trailingRef.current;
    if (!wrapper) return;

    const update = () => {
      const cs = getComputedStyle(wrapper);
      const padLeft = parseFloat(cs.paddingLeft || "0");
      const padRight = parseFloat(cs.paddingRight || "0");
      const leadW = showLeading ? lead?.getBoundingClientRect().width ?? 0 : 0;
      const trailW = showTrailing ? trail?.getBoundingClientRect().width ?? 0 : 0;
      setLeftOffsetPx(padLeft + leadW + 8);
      setRightOffsetPx(padRight + trailW);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    if (lead) ro.observe(lead);
    if (trail) ro.observe(trail);
    return () => ro.disconnect();
  }, [showLeading, showTrailing]);

  const builtinMap: Record<BuiltinEffect, React.ComponentType<EffectRendererProps>> =
    {
      typewriter: TypewriterEffect,
      slide: SlideEffect,
      fade: FadeEffect,
      none: () => null,
    };
  const ChosenEffect = EffectComponent ?? builtinMap[effect];

  const overlayActive = !search && !isFocused;
  const isLast = index === suggestions.length - 1;
  const allowDelete = animateMode === "infinite" ? true : !isLast;

  function nextSuggestion() {
    if (suggestions.length === 0) return;
    setIndex((i) => (i + 1) % suggestions.length);
  }

  function handleInputChange(val: string) {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onEnter?.();
    }
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative flex items-center gap-x-2 rounded-full border border-border/50 bg-background/35 px-4 py-2 shadow-sm backdrop-blur-md",
        className,
      )}
      style={{ maxWidth: "100%" }}
    >
      <div ref={leadingRef} className="flex shrink-0 items-center">
        {showLeading && <Leading />}
      </div>

      <input
        type="text"
        value={search}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
        onChange={(e) => handleInputChange(e.target.value)}
        className="w-full bg-transparent text-sm text-foreground outline-none"
        placeholder={placeholder ?? ""}
        aria-label="Buscar"
      />

      {search ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-muted-foreground"
          onClick={() => handleInputChange("")}
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </Button>
      ) : null}

      <div ref={trailingRef} className="flex shrink-0 items-center">
        {showTrailing && Trailing ? <Trailing /> : null}
      </div>

      {overlayActive ? (
        <div
          ref={overlayRef}
          aria-hidden
          style={{
            position: "absolute",
            left:
              leftOffsetPx != null
                ? `${leftOffsetPx}px`
                : "calc(0.5rem + 1.5rem + 8px)",
            right: rightOffsetPx != null ? `${rightOffsetPx}px` : "0.5rem",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <ChosenEffect
            key={`${current}-${overlayActive ? "on" : "off"}`}
            text={current}
            isActive={overlayActive}
            allowDelete={allowDelete}
            typeDurationMs={typeDurationMs}
            deleteDurationMs={deleteDurationMs}
            pauseAfterTypeMs={pauseAfterTypeMs}
            prefersReducedMotion={prefersReduced}
            onDeleteComplete={nextSuggestion}
            containerRef={overlayRef}
          />
        </div>
      ) : null}
    </div>
  );
};

export default SuggestiveSearch;
