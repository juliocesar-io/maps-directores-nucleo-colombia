"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Feature, GeoJsonObject } from "geojson";
import L from "leaflet";
import { Check, Copy } from "lucide-react";
import { GeoJSON, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import type { DepartmentCoordinator } from "@/lib/coordinators";
import { getDepartmentFlagUrl } from "@/lib/department-flags";

type Props = {
  data: GeoJsonObject | null;
  selectedId: string | null;
  selectedDepartment?: DepartmentCoordinator | null;
  onSelectDepartment: (departmentId: string) => void;
  onClearSelection?: () => void;
  resetSignal?: number;
  isDark?: boolean;
  className?: string;
};

function InitialFit({ data }: { data: GeoJsonObject | null }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (!data || done.current) return;
    const bounds = L.geoJSON(data as GeoJSON.GeoJSON).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [96, 96] });
      done.current = true;
    }
  }, [data, map]);

  return null;
}

function ResetToInitial({
  data,
  resetSignal,
}: {
  data: GeoJsonObject | null;
  resetSignal: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!data || resetSignal === 0) return;
    const bounds = L.geoJSON(data as GeoJSON.GeoJSON).getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [96, 96],
        animate: true,
        duration: 0.9,
        easeLinearity: 0.2,
      });
    }
  }, [data, map, resetSignal]);

  return null;
}

function FlyToSelected({
  selectedId,
  getBounds,
}: {
  selectedId: string | null;
  getBounds: (id: string) => L.LatLngBounds | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const b = getBounds(selectedId);
    if (b?.isValid()) {
      map.flyToBounds(b, {
        padding: [56, 56],
        maxZoom: 9,
        animate: true,
        duration: 1.15,
        easeLinearity: 0.2,
      });
    }
  }, [selectedId, getBounds, map]);

  return null;
}

export function ColombiaDepartmentMap({
  data,
  selectedId,
  selectedDepartment,
  onSelectDepartment,
  onClearSelection,
  resetSignal = 0,
  isDark = false,
  className,
}: Props) {
  const geoRef = useRef<L.GeoJSON | null>(null);
  const [boundsById, setBoundsById] = useState<Record<string, L.LatLngBounds>>(
    {},
  );
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const styleFor = useCallback(
    (id: string): L.PathOptions => ({
      color: isDark ? "#d7e3dc" : "#ffffff",
      weight: 1,
      opacity: 1,
      fillColor: id === selectedId ? "#dc2626" : isDark ? "#0f766e" : "#14b8a6",
      fillOpacity: id === selectedId ? 0.95 : isDark ? 0.78 : 0.82,
    }),
    [isDark, selectedId],
  );

  useEffect(() => {
    const layer = geoRef.current;
    if (!layer) return;
    layer.eachLayer((ly) => {
      const f = (ly as L.Layer & { feature?: Feature }).feature;
      const props = f?.properties as Record<string, unknown> | undefined;
      const id = String(props?.DPTO_CCDGO ?? "");
      if (!id || !(ly instanceof L.Path)) return;
      ly.setStyle(styleFor(id));
    });
  }, [selectedId, styleFor, data]);

  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const props = feature.properties as Record<string, unknown> | undefined;
      const id = String(props?.DPTO_CCDGO ?? "");
      const withBounds = layer as L.Layer & {
        getBounds?: () => L.LatLngBounds;
      };
      if (typeof withBounds.getBounds === "function") {
        const bounds = withBounds.getBounds();
        queueMicrotask(() => {
          setBoundsById((prev) => (prev[id] ? prev : { ...prev, [id]: bounds }));
        });
      }
      layer.on("click", () => {
        onSelectDepartment(id);
      });
      const name = String(props?.DPTO_CNMBR ?? id);
      layer.bindTooltip(name, {
        sticky: true,
        direction: "center",
        className:
          "!rounded-md !border-none !bg-white/95 !px-1.5 !py-0.5 !text-[11px] !font-semibold !shadow-sm",
      });
    },
    [onSelectDepartment],
  );

  const getBounds = useCallback(
    (id: string) => boundsById[id],
    [boundsById],
  );

  const popupPosition = useMemo(() => {
    if (!selectedId) return null;
    const bounds = boundsById[selectedId];
    return bounds?.isValid() ? bounds.getCenter() : null;
  }, [boundsById, selectedId]);
  const selectedFlagUrl = selectedId ? getDepartmentFlagUrl(selectedId) : null;

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail((prev) => (prev === email ? null : prev)), 1400);
    } catch {
      setCopiedEmail(null);
    }
  }

  if (!data) {
    return (
      <div
        className={cn(
          "flex h-[min(78vh,720px)] w-full items-center justify-center rounded-xl border bg-muted/40 text-sm text-muted-foreground",
          className,
        )}
      >
        Cargando mapa…
      </div>
    );
  }

  return (
    <MapContainer
      center={[4.57, -72.95]}
      zoom={5}
      className={cn(
        "z-0 h-[min(78vh,720px)] w-full overflow-hidden rounded-xl border border-border [&_.leaflet-control-zoom]:rounded-md [&_.leaflet-control-zoom]:border [&_.leaflet-control-zoom]:border-border",
        className,
      )}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>'
        url={
          isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        }
      />
      <InitialFit data={data} />
      <ResetToInitial data={data} resetSignal={resetSignal} />
      <FlyToSelected selectedId={selectedId} getBounds={getBounds} />
      <GeoJSON
        ref={geoRef}
        data={data}
        style={(f) => {
          const id = String(
            (f?.properties as Record<string, unknown> | undefined)?.DPTO_CCDGO ??
              "",
          );
          return styleFor(id);
        }}
        onEachFeature={onEachFeature}
      />
      {popupPosition && selectedDepartment ? (
        <Popup
          position={popupPosition}
          autoPan
          keepInView
          className="department-popup"
          eventHandlers={{
            remove: () => onClearSelection?.(),
          }}
        >
          <div className="w-72 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {selectedFlagUrl ? (
                <img
                  src={selectedFlagUrl}
                  alt={`Bandera de ${selectedDepartment.departmentName}`}
                  className="h-5 w-7 rounded-[2px] border object-cover"
                  loading="lazy"
                />
              ) : null}
              <p className="text-xs font-medium text-muted-foreground uppercase">
                {selectedDepartment.departmentName}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">
                {selectedDepartment.coordinator.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedDepartment.coordinator.title}
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-muted-foreground">
                Código DANE: {selectedDepartment.departmentId}
              </p>
              <div className="flex items-center gap-1.5">
                <a
                  href={`mailto:${selectedDepartment.coordinator.email}`}
                  className="text-primary underline-offset-3 hover:underline"
                >
                  {selectedDepartment.coordinator.email}
                </a>
                <button
                  type="button"
                  onClick={() => copyEmail(selectedDepartment.coordinator.email)}
                  className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Copiar correo"
                  title="Copiar correo"
                >
                  {copiedEmail === selectedDepartment.coordinator.email ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copiedEmail === selectedDepartment.coordinator.email
                    ? "Copiado"
                    : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        </Popup>
      ) : null}
    </MapContainer>
  );
}
