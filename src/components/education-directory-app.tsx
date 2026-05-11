"use client";

import type { GeoJsonObject } from "geojson";
import { Landmark, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { DepartmentSearchField } from "@/components/department-search-field";
import { Badge } from "@/components/ui/badge";
import { getDepartmentById } from "@/lib/coordinators";

const ColombiaDepartmentMap = dynamic(
  () =>
    import("@/components/colombia-department-map").then(
      (m) => m.ColombiaDepartmentMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[60vh] w-full items-center justify-center bg-muted/40 text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  },
);

const ThemeSelector = dynamic(
  () => import("@/components/theme-selector").then((m) => m.ThemeSelector),
  {
    ssr: false,
    loading: () => <div className="h-7 w-[190px]" aria-hidden />,
  },
);

function SidesedLogoMark() {
  return (
    <svg
      viewBox="0 0 260 62"
      aria-hidden
      className="h-8 w-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="31" cy="31" r="27" fill="none" stroke="#14b8a6" strokeWidth="8" />
      <text
        x="31"
        y="38"
        textAnchor="middle"
        fontSize="24"
        fontWeight="700"
        fill="#14b8a6"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
      >
        S
      </text>
      <text
        x="66"
        y="42"
        fontSize="40"
        fontWeight="700"
        fill="#14b8a6"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
      >
        SIDESED
      </text>
    </svg>
  );
}

export function EducationDirectoryApp() {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    void fetch("/geo/colombia-departamentos.geojson")
      .then((res) => res.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  const selectDepartment = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const resetMapView = useCallback(() => {
    setSelectedId(null);
    setResetSignal((prev) => prev + 1);
  }, []);

  const entry = selectedId ? getDepartmentById(selectedId) : undefined;

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-muted/30">
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-[470] bg-transparent">
        <div className="pointer-events-auto mx-3 mt-3 mb-8 flex items-center gap-3 overflow-x-auto rounded-xl border border-border/50 bg-background/35 px-4 py-2.5 shadow-sm backdrop-blur-md md:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <a
              href="https://comunidad.sidesed.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 transition-opacity hover:opacity-85"
              aria-label="Ir a Comunidad Sidesed"
            >
              <SidesedLogoMark />
              <span className="rounded-md border bg-background/70 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Ir a Comunidad
              </span>
            </a>
          </div>
          <h1 className="shrink-0 font-heading text-sm font-semibold tracking-tight md:text-base">
              Directorio Coordinadores de Núcleo, Colombia
          </h1>
          <p className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            Educación Pública
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg"
              alt="Bandera de Colombia"
              className="h-3.5 w-5 rounded-[2px] border object-cover"
              loading="lazy"
            />
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Badge variant="outline" className="inline-flex">
              <Landmark className="size-3" />
              33 departamentos
            </Badge>
            {entry ? (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <MapPin className="size-3" />
                {entry.departmentName}
              </Badge>
            ) : null}
            <ThemeSelector />
          </div>
        </div>
      </footer>
      <main className="relative min-h-0 flex-1">
        <ColombiaDepartmentMap
          data={geoData}
          selectedId={selectedId}
          selectedDepartment={entry ?? null}
          onSelectDepartment={selectDepartment}
          onClearSelection={() => setSelectedId(null)}
          resetSignal={resetSignal}
          isDark={resolvedTheme === "dark"}
          className="h-full w-full rounded-none border-0"
        />
        <div className="pointer-events-none absolute inset-x-4 top-4 z-[460] flex justify-center">
          <DepartmentSearchField
            onPick={selectDepartment}
            onResetView={resetMapView}
            className="pointer-events-auto w-full max-w-xl"
          />
        </div>

      </main>
    </div>
  );
}
