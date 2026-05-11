"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { RotateCcw, Search } from "lucide-react";
import {
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DepartmentCoordinator } from "@/lib/coordinators";
import { filterDepartmentCoordinators } from "@/lib/coordinators";
import { getDepartmentFlagUrl } from "@/lib/department-flags";
import { cn } from "@/lib/utils";
import SuggestiveSearch from "@/components/ui/suggestive-search";

type Props = {
  onPick: (departmentId: string) => void;
  onResetView?: () => void;
  className?: string;
};

export function DepartmentSearchField({
  onPick,
  onResetView,
  className,
}: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setAnchorWidth(el.offsetWidth);
    });
    ro.observe(el);
    setAnchorWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const results = useMemo(
    () => filterDepartmentCoordinators(deferredQuery),
    [deferredQuery],
  );
  const isSearching = query !== deferredQuery;

  const canSearch = query.trim().length >= 2;
  const showList = open && canSearch;

  function handleSelect(entry: DepartmentCoordinator) {
    onPick(entry.departmentId);
    setOpen(false);
    setQuery("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      <BasePopover.Root
        open={showList}
        onOpenChange={(next) => {
          if (!next) setOpen(false);
        }}
        modal={false}
      >
        <div ref={anchorRef} className="relative w-full">
          <p className="sr-only">
            Buscar por nombre del coordinador o del departamento
          </p>
          <SuggestiveSearch
            value={query}
            onChange={(val) => {
              setQuery(val);
              setOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setOpen(true);
              }
            }}
            onEnter={() => {
              if (results[0]) {
                handleSelect(results[0]);
              }
            }}
            Leading={() => <Search className="size-4 text-muted-foreground" />}
            showTrailing
            Trailing={() => (
              <button
                type="button"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/65 hover:text-foreground"
                aria-label="Restablecer vista del mapa"
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                  onResetView?.();
                }}
              >
                <RotateCcw className="size-4" />
              </button>
            )}
            effect="typewriter"
            suggestions={[
              "Buscar coordinador por nombre",
              "Buscar departamento por nombre",
            ]}
            className="h-12 rounded-full border-border/70 bg-background/95 px-4"
          />
        </div>
        <BasePopover.Portal>
          <BasePopover.Positioner
            anchor={anchorRef}
            side="bottom"
            align="start"
            sideOffset={6}
            className="isolate z-[500]"
          >
            <BasePopover.Popup
              initialFocus={false}
              finalFocus={false}
              style={
                anchorWidth != null
                  ? { width: anchorWidth, maxWidth: "calc(100vw - 2rem)" }
                  : { maxWidth: "min(28rem, calc(100vw - 2rem))" }
              }
              className={cn(
                "z-[500] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border/50 bg-background/35 p-0 text-popover-foreground shadow-sm backdrop-blur-md outline-none duration-100",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
                "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              )}
            >
              <BasePopover.Title className="sr-only">
                Resultados de búsqueda
              </BasePopover.Title>
              <div className="border-b border-border/40 bg-background/25 px-3 py-2 text-xs font-medium text-muted-foreground">
                Resultados {results.length > 0 ? `(${results.length})` : ""}
              </div>
              <div className="max-h-[min(24rem,calc(100vh-6rem))] overflow-y-auto overscroll-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
                {isSearching ? (
                  <div className="px-3 py-5 text-sm text-muted-foreground">
                    Buscando...
                  </div>
                ) : results.length > 0 ? (
                  <ul className="py-1">
                    {results.map((entry) => (
                      <li
                        key={entry.departmentId}
                        className="border-b/60 last:border-b-0"
                      >
                        <button
                          type="button"
                        className="flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-background/45 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelect(entry);
                          }}
                        >
                          <span className="text-sm font-semibold">
                            {entry.coordinator.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {getDepartmentFlagUrl(entry.departmentId) ? (
                              <img
                                src={getDepartmentFlagUrl(entry.departmentId)!}
                                alt={`Bandera de ${entry.departmentName}`}
                                className="h-3.5 w-5 rounded-[2px] border object-cover"
                                loading="lazy"
                              />
                            ) : null}
                            {entry.departmentName} · Cód. {entry.departmentId}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-5 text-sm text-muted-foreground">
                    No hay resultados para tu búsqueda.
                  </div>
                )}
              </div>
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    </div>
  );
}
