import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import * as Popover from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface ColorPickerCustomProps {
  label: string;
  value: string; // "R, G, B, A" format
  onChange: (value: string) => void;
}

function hslaToRgba(
  h: number,
  s: number,
  l: number,
  _a: number // intentionally unused in this function, but needed for signature
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbaToHsla(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function ColorPickerCustom({
  label,
  value,
  onChange,
}: ColorPickerCustomProps) {
  // Handle hue ring interaction
  const isHueDraggingRef = useRef(false);
  const handleHuePointer = (clientX: number, clientY: number) => {
    if (!hueRingRef.current) return;
    const rect = hueRingRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = angle < 0 ? angle + 360 : angle;
    setHue(Math.round(angle));
  };
  // Mouse events for hue ring
  const handleHueMouseMove = (e: MouseEvent) => {
    if (!isHueDraggingRef.current) return;
    handleHuePointer(e.clientX, e.clientY);
  };
  const handleHueMouseUp = () => {
    isHueDraggingRef.current = false;
    window.removeEventListener("mousemove", handleHueMouseMove);
    window.removeEventListener("mouseup", handleHueMouseUp);
  };
  const handleHueRingMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isHueDraggingRef.current = true;
    handleHuePointer(e.clientX, e.clientY);
    window.addEventListener("mousemove", handleHueMouseMove);
    window.addEventListener("mouseup", handleHueMouseUp);
  };
  // Touch events for hue ring
  const handleHueTouchMove = (e: TouchEvent) => {
    if (!isHueDraggingRef.current) return;
    if (e.touches.length > 0) {
      handleHuePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleHueTouchEnd = () => {
    isHueDraggingRef.current = false;
    window.removeEventListener("touchmove", handleHueTouchMove);
    window.removeEventListener("touchend", handleHueTouchEnd);
  };
  const handleHueRingTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isHueDraggingRef.current = true;
    if (e.touches.length > 0) {
      handleHuePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
    window.addEventListener("touchmove", handleHueTouchMove);
    window.addEventListener("touchend", handleHueTouchEnd);
  };
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(1);
  const timeoutRef = useRef<number | null>(null);
  const prevValueRef = useRef(value);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const containerRef = useRef<HTMLDivElement>(null); // unused
  const isDraggingRef = useRef(false);
  // For square canvas sizing
  // Make the color square smaller so it fits inside the ring
  const [hueRingSize, setHueRingSize] = useState(280); // outer size
  const [canvasSize, setCanvasSize] = useState(168); // 60% of 280 by default
  // Multiplier for color square size (change here for different ratios)
  const colorSquareMultiplier = 0.64;
  const hueRingRef = useRef<HTMLCanvasElement>(null);
  // Draw the hue ring (circular hue slider)
  // Always update sizes after popover is open and visible
  useLayoutEffect(() => {
    if (isOpen && hueRingRef.current) {
      // Wait for next frame to ensure popover is visible
      requestAnimationFrame(() => {
        const rect = hueRingRef.current!.getBoundingClientRect();
        setHueRingSize(rect.width);
        setCanvasSize(
          Math.max(32, Math.floor(rect.width * colorSquareMultiplier))
        );
      });
    }
  }, [isOpen, colorSquareMultiplier]);

  // Keep previous effect for resize and hue changes
  useEffect(() => {
    const drawHueRing = () => {
      if (!hueRingRef.current) return;
      const canvas = hueRingRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(hueRingSize * dpr);
      const ringWidth = 8 * dpr; // fixed 8px thickness (devicePixelRatio aware)
      const markerLineWidth = 2 * dpr;
      const markerRadius = Math.max(
        6 * dpr,
        Math.min(canvasSize * 0.04 * dpr, (size / 2) * 0.12)
      );
      // Padding so marker is always visible at the edge
      const padding = markerRadius + markerLineWidth / 2;
      if (canvas.width !== size) canvas.width = size;
      if (canvas.height !== size) canvas.height = size;
      ctx.clearRect(0, 0, size, size);

      // Draw hue gradient ring
      const cx = size / 2;
      const cy = size / 2;
      const radius = (size - ringWidth) / 2 - padding + ringWidth / 2;
      for (let i = 0; i < 360; i++) {
        const startAngle = ((i - 1) * Math.PI) / 180;
        const endAngle = (i * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle, false);
        ctx.lineWidth = ringWidth;
        ctx.strokeStyle = `hsl(${i}, 100%, 50%)`;
        ctx.stroke();
      }

      // Draw indicator for current hue
      const angle = (hue * Math.PI) / 180;
      const indicatorRadius = radius;
      const ix = cx + indicatorRadius * Math.cos(angle);
      const iy = cy + indicatorRadius * Math.sin(angle);
      ctx.save();
      ctx.beginPath();
      ctx.arc(ix, iy, markerRadius, 0, 2 * Math.PI);
      ctx.lineWidth = markerLineWidth;
      ctx.strokeStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
    };
    // Only draw if the popover is open and the canvas is visible
    if (isOpen) {
      // Wait for layout to stabilize, then draw
      requestAnimationFrame(() => {
        drawHueRing();
      });
    }
    // Redraw and update sizes on hue ring resize
    let resizeObserver: ResizeObserver | undefined;
    const updateSizes = () => {
      if (hueRingRef.current) {
        const rect = hueRingRef.current.getBoundingClientRect();
        setHueRingSize(rect.width);
        setCanvasSize(
          Math.max(32, Math.floor(rect.width * colorSquareMultiplier))
        );
      }
    };
    if (hueRingRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateSizes();
        if (isOpen) {
          drawHueRing();
        }
      });
      resizeObserver.observe(hueRingRef.current);
    }
    if (isOpen) {
      requestAnimationFrame(() => {
        drawHueRing();
      });
    }
    return () => {
      if (resizeObserver && hueRingRef.current) {
        resizeObserver.unobserve(hueRingRef.current);
      }
    };
  }, [hue, isOpen, colorSquareMultiplier]);

  // (removed: now handled by main effect above)

  // Extract rgba values from multiple formats
  const getRgbaValues = (color: string) => {
    // Always return an object with r, g, b, a fields
    if (!color || typeof color !== "string") {
      return { r: 255, g: 255, b: 255, a: 1 };
    }
    // Try "R, G, B, A" format first
    let match = color.match(/^(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: parseFloat(match[4] || "1"),
      };
    }
    // Try rgba(...) format
    match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: parseFloat(match[4] || "1"),
      };
    }
    // Default fallback
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  // Always sync state from value prop on mount and whenever value changes
  useEffect(() => {
    prevValueRef.current = value;
    const { r, g, b, a } = getRgbaValues(value);
    const { h, s, l } = rgbaToHsla(r, g, b);
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a);
  }, [value]);

  // Draw the gradient using a square canvas
  useEffect(() => {
    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Use a square size
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(canvasSize * dpr);
      if (canvas.width !== size) canvas.width = size;
      if (canvas.height !== size) canvas.height = size;
      ctx.clearRect(0, 0, size, size);
      const imgData = ctx.createImageData(size, size);
      let p = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const s = (x / size) * 100;
          const l = 100 - (y / size) * 100;
          const { r, g, b } = hslaToRgba(hue, s, l, 1);
          imgData.data[p++] = r;
          imgData.data[p++] = g;
          imgData.data[p++] = b;
          imgData.data[p++] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Draw marker for current saturation/lightness
      const markerX = (saturation / 100) * size;
      const markerY = ((100 - lightness) / 100) * size;
      const markerRadius = Math.max(6, size * 0.04); // slightly bigger ring

      ctx.save();
      ctx.beginPath();
      ctx.arc(markerX, markerY, markerRadius, 0, 2 * Math.PI);
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
    };

    // Draw immediately, and again after next paint if Popover just opened
    draw();
    if (isOpen) {
      requestAnimationFrame(draw);
    }

    // No need for ResizeObserver here; handled by hue ring observer
  }, [hue, saturation, lightness, isOpen, canvasSize]);

  // Handle canvas click and drag for color selection
  // Stable pointer handler
  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const s = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    const l = Math.max(
      0,
      Math.min(100, Math.round(100 - (y / rect.height) * 100))
    );
    setSaturation(s);
    setLightness(l);
  };

  // Mouse events
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    handlePointer(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    handlePointer(e.clientX, e.clientY);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Touch events
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Update parent when color changes
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange call
    timeoutRef.current = setTimeout(() => {
      const { r, g, b } = hslaToRgba(hue, saturation, lightness, alpha);
      const newValue = `${r}, ${g}, ${b}, ${alpha}`;
      if (newValue !== prevValueRef.current) {
        prevValueRef.current = newValue;
        onChange(newValue);
      }
    }, 16); // ~60fps

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness, alpha]);

  // Close picker when clicking outside (using Popover's built-in functionality)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const { r, g, b } = getRgbaValues(value);
  const previewColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;

  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            // Wait for popover to be fully rendered (post-layout)
            setTimeout(() => {
              if (hueRingRef.current) {
                const rect = hueRingRef.current.getBoundingClientRect();
                setHueRingSize(rect.width);
                setCanvasSize(
                  Math.max(32, Math.floor(rect.width * colorSquareMultiplier))
                );
              }
            }, 0);
          }
        }}
      >
        <Popover.Trigger asChild>
          <button
            className="flex gap-2 items-center w-full p-2 rounded border border-white/20 hover:border-white/40 transition-colors bg-white/5 hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div
              className="w-8 h-8 rounded border border-white/20 flex-shrink-0"
              style={{ backgroundColor: previewColor }}
            />
            <span className="text-xs text-white/70">
              RGB({r}, {g}, {b}) α: {alpha.toFixed(2)}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Content
          side="top"
          align="start"
          className="w-80 p-4 bg-black/80 border border-white/20 rounded-lg z-50"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-4">
            {/* Hue Ring + Color Canvas */}
            <div
              className="flex justify-center items-center relative"
              style={{ width: hueRingSize, height: hueRingSize }}
            >
              {/* Hue Ring Canvas (background, interactive) */}
              <canvas
                ref={hueRingRef}
                width={hueRingSize}
                height={hueRingSize}
                className="absolute left-0 top-0"
                style={{
                  width: hueRingSize,
                  height: hueRingSize,
                  pointerEvents: "auto",
                  zIndex: 1,
                }}
                onMouseDown={handleHueRingMouseDown}
                onTouchStart={handleHueRingTouchStart}
              />
              {/* Color Square Canvas (foreground, centered) */}
              <div
                className="absolute left-0 top-0 flex justify-center items-center"
                style={{
                  width: hueRingSize,
                  height: hueRingSize,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasSize}
                  height={canvasSize}
                  onMouseDown={handleCanvasMouseDown}
                  onTouchStart={handleCanvasTouchStart}
                  className="border border-white/20 rounded"
                  style={{
                    width: canvasSize,
                    height: canvasSize,
                    userSelect: "none",
                    touchAction: "none",
                    pointerEvents: "auto",
                    position: "absolute",
                    left: `calc(50% - ${canvasSize / 2}px)`,
                    top: `calc(50% - ${canvasSize / 2}px)`,
                  }}
                />
              </div>
            </div>

            {/* Alpha Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-white text-xs">Alpha</Label>
                <span className="text-xs text-white/70">
                  {alpha.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[alpha]}
                onValueChange={([a]) => setAlpha(a)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Color Preview */}
            <div
              className="w-full h-12 rounded border border-white/20"
              style={{ backgroundColor: previewColor }}
            />

            <Popover.Close asChild>
              <button className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
