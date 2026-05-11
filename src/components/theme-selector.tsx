"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const modes: Array<{ id: Mode; label: string; icon: typeof Sun }> = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Laptop },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const active = (theme ?? "system") as Mode;

  return (
    <div className="inline-flex items-center rounded-lg border bg-background/80 p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = active === mode.id;

        return (
          <Button
            key={mode.id}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTheme(mode.id)}
            className={cn("h-7 px-2.5 text-xs", !isActive && "text-muted-foreground")}
            aria-pressed={isActive}
          >
            <Icon className="size-3.5" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
}
