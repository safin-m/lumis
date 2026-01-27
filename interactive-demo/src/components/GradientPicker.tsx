/**
 * GradientPicker Component
 *
 * A component for creating and editing gradients with two color stops.
 * Supports both linear and radial gradients with adjustable angle.
 * Provides a visual preview of the gradient as it's being edited.
 */

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { rgbaString } from "@/utils/colorUtils";
import { useEffect, useRef, useState } from "react";
import { ColorPickerCustom } from "./ColorPickerCustom";

interface GradientPickerProps {
  /** Optional label for the gradient picker */
  label?: string;
  /** Gradient configuration value */
  value: {
    color1: string; // "R, G, B, A"
    color2: string; // "R, G, B, A"
    angle: number; // degrees
    type: "linear" | "radial";
  };
  /** Callback fired when gradient changes */
  onChange: (value: GradientPickerProps["value"]) => void;
}

/**
 * GradientPicker provides an intuitive interface for creating
 * and editing gradients with live preview
 */
export function GradientPicker({
  label,
  value,
  onChange,
}: GradientPickerProps) {
  const [color1, setColor1] = useState(value.color1);
  const [color2, setColor2] = useState(value.color2);
  const [angle, setAngle] = useState(value.angle);
  const [type, setType] = useState<"linear" | "radial">(value.type || "linear");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Notify parent component of gradient changes
   */
  useEffect(() => {
    onChange({ color1, color2, angle, type });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color1, color2, angle, type]);

  /**
   * Draw gradient preview on canvas
   * Updates whenever gradient properties change
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    let grad: CanvasGradient;

    if (type === "linear") {
      // Calculate start/end points based on angle
      const rad = (angle * Math.PI) / 180;
      const x0 = w / 2 + (Math.cos(rad + Math.PI) * w) / 2;
      const y0 = h / 2 + (Math.sin(rad + Math.PI) * h) / 2;
      const x1 = w / 2 + (Math.cos(rad) * w) / 2;
      const y1 = h / 2 + (Math.sin(rad) * h) / 2;
      grad = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      // Radial gradient from center
      grad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) / 2
      );
    }

    grad.addColorStop(0, rgbaString(color1));
    grad.addColorStop(1, rgbaString(color2));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, [color1, color2, angle, type]);

  return (
    <div className="space-y-2">
      {label && <Label className="text-white">{label}</Label>}
      <div className="flex gap-4">
        <div className="flex-1">
          <ColorPickerCustom
            label="Color 1"
            value={color1}
            onChange={setColor1}
          />
        </div>
        <div className="flex-1">
          <ColorPickerCustom
            label="Color 2"
            value={color2}
            onChange={setColor2}
          />
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <Label className="text-white">Angle</Label>
        <Slider
          value={[angle]}
          onValueChange={([v]) => setAngle(v)}
          min={0}
          max={360}
          step={1}
          className="flex-1"
        />
        <span className="text-white/70 text-xs w-8">{angle}°</span>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <Label className="text-white">Radial</Label>
        <Switch
          checked={type === "radial"}
          onChange={(e) => setType(e.target.checked ? "radial" : "linear")}
        />
        <Label className="text-white">Linear</Label>
      </div>
      <div className="w-full flex justify-center mt-2">
        <canvas
          ref={canvasRef}
          width={240}
          height={48}
          className="rounded border border-white/20"
          style={{ background: "#222" }}
        />
      </div>
    </div>
  );
}
