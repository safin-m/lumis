import type { DemoConfig } from "@/types/glass-config";
import { useEffect, useRef } from "react";

interface GlassObjectProps {
  config: DemoConfig;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

export function GlassObject({
  config,
  position,
  onPositionChange,
}: GlassObjectProps) {
  const glassRef = useRef<HTMLDivElement>(null);
  const glassEffectRef = useRef<any>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Normalize color strings to valid CSS so the library gets usable values
  const toCssColor = (val: string) => {
    const trimmed = (val || "").trim();
    if (!trimmed) return trimmed;

    const lower = trimmed.toLowerCase();
    const looksLikeCss =
      lower.startsWith("#") ||
      lower.startsWith("rgb") ||
      lower.startsWith("hsl") ||
      lower.startsWith("var(") ||
      lower.includes("gradient");

    if (looksLikeCss) return trimmed;

    // Matches "R, G, B" or "R, G, B, A"
    const rgbaList = /^\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?$/;
    if (rgbaList.test(trimmed)) return `rgba(${trimmed})`;

    return trimmed; // Fallback: leave as-is
  };

  const withCssColors = (cfg: DemoConfig): DemoConfig => ({
    ...cfg,
    overlays: {
      ...cfg.overlays,
      // Don't convert borderColor/hoverLightColor - glass effect expects "R, G, B, A" format
      // borderColor: toCssColor(cfg.overlays.borderColor),
      // hoverLightColor: toCssColor(cfg.overlays.hoverLightColor),
    },
    warp: {
      ...cfg.warp,
      color: toCssColor(cfg.warp.color),
    },
    shine: {
      ...cfg.shine,
      color: toCssColor(cfg.shine.color),
    },
    // Hover borderColor already CSS; leave other hover props as-is
  });

  // Recreate glass effect when interactions or edge mask settings change
  useEffect(() => {
    const element = glassRef.current;
    if (!element) return;

    // Remove all child nodes except the React content (text, etc.)
    Array.from(element.children).forEach((child) => {
      if (
        child instanceof HTMLElement &&
        child.style.pointerEvents === "none"
      ) {
        element.removeChild(child);
      }
    });

    const configWithCssColors = withCssColors(config);

    let destroyed = false;
    // Import and initialize glass effect dynamically
    // @ts-expect-error - glass-effect is a plain JS module
    import("../../../dist/glass-effect.esm.js").then((module: any) => {
      if (destroyed) return;
      const GlassEffect = module.GlassEffect;
      if (glassEffectRef.current?.destroy) {
        glassEffectRef.current.destroy();
      }
      glassEffectRef.current = new GlassEffect(element, configWithCssColors);
    });

    return () => {
      destroyed = true;
      if (glassEffectRef.current?.destroy) {
        glassEffectRef.current.destroy();
      }
    };
  }, [
    config.interactions.enabled,
    config.interactions.elasticity,
    config.interactions.activationZone,
    config.edgeMask,
    config.edgeMaskPreserveDistortion,
    config.edgeMaskArithmeticBlend,
  ]);

  // Update config when it changes
  useEffect(() => {
    if (glassEffectRef.current) {
      const configWithCssColors = withCssColors(config);
      // Deep merge config to preserve nested object changes
      glassEffectRef.current.config = {
        ...glassEffectRef.current.config,
        ...configWithCssColors,
        warp: {
          ...glassEffectRef.current.config.warp,
          ...configWithCssColors.warp,
        },
        shine: {
          ...glassEffectRef.current.config.shine,
          ...configWithCssColors.shine,
        },
        hover: {
          ...glassEffectRef.current.config.hover,
          ...configWithCssColors.hover,
        },
        interactions: {
          ...glassEffectRef.current.config.interactions,
          ...configWithCssColors.interactions,
        },
        overlays: {
          ...glassEffectRef.current.config.overlays,
          ...configWithCssColors.overlays,
          extraOverlay: {
            ...glassEffectRef.current.config.overlays.extraOverlay,
            ...configWithCssColors.overlays.extraOverlay,
          },
        },
      };
      glassEffectRef.current.update();
    }
  }, [config]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        onPositionChange({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onPositionChange]);

  return (
    <div
      ref={glassRef}
      className="glass-effect absolute cursor-move flex items-center justify-center select-none"
      style={{
        left: position.x,
        top: position.y,
        width: config.width,
        height: config.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {config.text && (
        <div className="text-white font-bold text-2xl z-10 pointer-events-none">
          {config.text}
        </div>
      )}
    </div>
  );
}
