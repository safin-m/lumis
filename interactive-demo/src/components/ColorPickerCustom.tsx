import { useEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import * as Popover from "@radix-ui/react-popover";
import { X } from "lucide-react";

interface ColorPickerCustomProps {
  label: string;
  value: string; // "R, G, B, A" format
  onChange: (value: string) => void;
}

function hslaToRgba(
  h: number,
  s: number,
  l: number,
  a: number
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
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const prevValueRef = useRef(value);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Extract rgba values from multiple formats
  const getRgbaValues = (color: string) => {
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

  // Initialize state from value when it changes externally
  useEffect(() => {
    if (value === prevValueRef.current) return; // Don't update if value hasn't changed

    prevValueRef.current = value;
    const { r, g, b, a } = getRgbaValues(value);
    const { h, s, l } = rgbaToHsla(r, g, b);

    setHue(h);
    setSaturation(s);
    setLightness(l);
    setAlpha(a);
  }, [value]);

  // Update canvas when hue changes
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw saturation/lightness gradient
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s = (x / width) * 100;
        const l = 100 - (y / height) * 100;
        const { r, g, b } = hslaToRgba(hue, s, l, 1);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  // Handle canvas click for color selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);

    setSaturation(s);
    setLightness(l);
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
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
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
          className="w-72 p-4 bg-black/80 border border-white/20 rounded-lg z-50"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="space-y-4">
            {/* Hue Picker Canvas */}
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                width={250}
                height={150}
                onClick={handleCanvasClick}
                className="w-full h-24 border border-white/20 rounded cursor-crosshair"
              />
            </div>

            {/* Hue Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-white text-xs">Hue</Label>
                <span className="text-xs text-white/70">{hue}°</span>
              </div>
              <div
                className="h-6 rounded"
                style={{
                  background:
                    "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
                }}
              />
              <Slider
                value={[hue]}
                onValueChange={([h]) => setHue(h)}
                min={0}
                max={360}
                step={1}
                className="w-full"
              />
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
