/**
 * GlassObject Component
 *
 * A draggable glass effect element that demonstrates the glass effect library.
 * This component initializes and manages the glass effect on a DOM element,
 * handles drag interactions, and updates the effect when configuration changes.
 */

import type { DemoConfig } from "@/types/glass-config";
import { toCssColor } from "@/utils/colorUtils";
import { useEffect, useRef } from "react";

interface GlassObjectProps {
  /** The glass effect configuration */
  config: DemoConfig;
  /** The current position of the glass object */
  position: { x: number; y: number };
  /** Callback fired when the position changes */
  onPositionChange: (position: { x: number; y: number }) => void;
  /** Reference to the glass effect instance */
  glassEffectRef: React.MutableRefObject<any>;
}

/**
 * Converts color values in the config to CSS-compatible format
 * The glass effect library expects certain colors in specific formats.
 * This function normalizes color strings to valid CSS while preserving
 * the "R, G, B, A" format for properties that need it.
 *
 * @param cfg - The configuration object to process
 * @returns Configuration with normalized color values
 */
function withCssColors(cfg: DemoConfig): DemoConfig {
  return {
    ...cfg,
    overlays: {
      ...cfg.overlays,
      // Note: borderColor and hoverLightColor remain in "R, G, B, A" format
      // as the glass effect library expects this format for these properties
    },
    warp: {
      ...cfg.warp,
      color: toCssColor(cfg.warp.color),
    },
    shine: {
      ...cfg.shine,
      color: toCssColor(cfg.shine.color),
    },
  };
}

/**
 * GlassObject renders a draggable element with the glass effect applied
 */
export function GlassObject({
  config,
  position,
  onPositionChange,
  glassEffectRef,
}: GlassObjectProps) {
  const glassRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  /**
   * Initialize or recreate the glass effect when critical settings change
   * This effect handles the creation and destruction of the glass effect instance
   */
  useEffect(() => {
    const element = glassRef.current;
    if (!element) return;

    // Remove any existing glass effect layers (except React content)
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

    // Dynamically import and initialize the glass effect
    // @ts-expect-error - glass-effect is a plain JS module
    import("../../../dist/glass-effect.esm.js").then((module: any) => {
      if (destroyed) return;
      const GlassEffect = module.GlassEffect;

      // Clean up previous instance if it exists
      if (glassEffectRef.current?.destroy) {
        glassEffectRef.current.destroy();
      }

      // Create new glass effect instance
      glassEffectRef.current = new GlassEffect(element, configWithCssColors);
    });

    return () => {
      destroyed = true;
      if (glassEffectRef.current?.destroy) {
        glassEffectRef.current.destroy();
      }
    };
  }, [
    // Dependencies that require full recreation of the effect
    config.interactions.enabled,
    config.interactions.elasticity,
    config.interactions.activationZone,
    config.edgeMask,
    config.edgeMaskPreserveDistortion,
    config.edgeMaskArithmeticBlend,
  ]);

  /**
   * Update the glass effect configuration when it changes
   * This effect performs a deep merge of configuration changes
   * without recreating the entire effect instance
   */
  useEffect(() => {
    if (glassEffectRef.current) {
      const configWithCssColors = withCssColors(config);

      // Deep merge config to preserve nested object changes
      glassEffectRef.current.config = {
        ...glassEffectRef.current.config,
        ...configWithCssColors,
        // Ensure all shader parameters are included
        shaderEdgeFadeStart: configWithCssColors.shaderEdgeFadeStart,
        shaderEdgeFadeOffset: configWithCssColors.shaderEdgeFadeOffset,
        shaderCornerRadius: configWithCssColors.shaderCornerRadius,
        shaderWidthFactor: configWithCssColors.shaderWidthFactor,
        shaderHeightFactor: configWithCssColors.shaderHeightFactor,
        shaderEdgeDistanceDivisor:
          configWithCssColors.shaderEdgeDistanceDivisor,
        // Deep merge nested objects
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

      // Trigger a visual update with the new configuration
      glassEffectRef.current.update();
    }
  }, [config]);

  /**
   * Handle mouse down event to initiate dragging
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  /**
   * Set up global mouse event listeners for drag functionality
   */
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
