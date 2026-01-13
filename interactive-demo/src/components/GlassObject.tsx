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

  // Initialize glass effect once
  useEffect(() => {
    const element = glassRef.current;
    if (!element) return;

    // Import and initialize glass effect dynamically
    // @ts-expect-error - glass-effect is a plain JS module
    import("../../../dist/glass-effect.esm.js").then((module: any) => {
      const GlassEffect = module.GlassEffect;
      glassEffectRef.current = new GlassEffect(element, config);
    });

    return () => {
      if (glassEffectRef.current?.destroy) {
        glassEffectRef.current.destroy();
      }
    };
  }, []);

  // Update config when it changes
  useEffect(() => {
    if (glassEffectRef.current) {
      Object.assign(glassEffectRef.current.config, config);
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
