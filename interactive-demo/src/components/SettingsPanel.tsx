import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { DemoConfig } from "@/types/glass-config";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";

interface SettingsPanelProps {
  config: DemoConfig;
  onConfigChange: (config: DemoConfig) => void;
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract rgba values
  const getRgbaValues = (rgba: string) => {
    const match = rgba.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (!match) return { r: 255, g: 255, b: 255, a: 1 };
    const [, r, g, b, a = "1"] = match;
    return {
      r: parseInt(r),
      g: parseInt(g),
      b: parseInt(b),
      a: parseFloat(a),
    };
  };

  // Convert rgba to hex
  const rgbaToHex = (rgba: string) => {
    const { r, g, b } = getRgbaValues(rgba);
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}, ${alpha}`;
  };

  const currentHex = rgbaToHex(value);
  const currentAlpha = getRgbaValues(value).a;

  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <div className="flex gap-2">
        <div
          className="w-10 h-10 rounded border-2 border-white/20 cursor-pointer"
          style={{ backgroundColor: `rgba(${value})` }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <Input
          value={currentHex}
          onChange={(e) => onChange(hexToRgba(e.target.value, currentAlpha))}
          className="flex-1"
        />
      </div>
      {isOpen && (
        <div className="mt-2 space-y-2">
          <HexColorPicker
            color={currentHex}
            onChange={(hex) => onChange(hexToRgba(hex, currentAlpha))}
          />
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label className="text-white text-xs">Alpha</Label>
              <span className="text-xs text-white/70">
                {currentAlpha.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[currentAlpha]}
              onValueChange={([a]) => onChange(hexToRgba(currentHex, a))}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-white">{label}</Label>
        <span className="text-sm text-white/70">{value.toFixed(2)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between text-white hover:bg-white/10"
        >
          <span className="font-semibold">{title}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SettingsPanel({ config, onConfigChange }: SettingsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updateConfig = (updates: Partial<DemoConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateNestedConfig = <K extends keyof DemoConfig>(
    key: K,
    updates: Partial<DemoConfig[K]>
  ) => {
    onConfigChange({
      ...config,
      [key]: { ...(config[key] as object), ...updates },
    });
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-white" />
          <h2 className="font-semibold text-white">Glass Effect Settings</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="p-4 max-h-[80vh] overflow-y-auto space-y-4">
          <Section title="Dimensions" defaultOpen>
            <SliderControl
              label="Width"
              value={config.width}
              onChange={(v) => updateConfig({ width: v })}
              min={100}
              max={800}
              step={10}
            />
            <SliderControl
              label="Height"
              value={config.height}
              onChange={(v) => updateConfig({ height: v })}
              min={100}
              max={800}
              step={10}
            />
            <SliderControl
              label="Border Radius"
              value={config.radius}
              onChange={(v) => updateConfig({ radius: v })}
              min={0}
              max={100}
              step={1}
            />
            <div className="space-y-2">
              <Label className="text-white">Background Image URL</Label>
              <Input
                value={config.backgroundImage}
                onChange={(e) =>
                  updateConfig({ backgroundImage: e.target.value })
                }
                placeholder="Enter image URL..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateConfig({
                    backgroundImage: `https://picsum.photos/1920/1080?random=${Math.random()}`,
                  })
                }
                className="w-full"
              >
                Random Image
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Show Lorem Ipsum</Label>
                <input
                  type="checkbox"
                  checked={config.showLoremIpsum}
                  onChange={(e) =>
                    updateConfig({ showLoremIpsum: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </div>
            </div>
            <ColorPicker
              label="Lorem Ipsum Color"
              value={`rgba(${config.loremIpsumColor})`}
              onChange={(v) => updateConfig({ loremIpsumColor: v })}
            />
            <SliderControl
              label="Font Size (px)"
              value={config.loremIpsumFontSize}
              onChange={(v) => updateConfig({ loremIpsumFontSize: v })}
              min={12}
              max={32}
              step={1}
            />
            <SliderControl
              label="Paragraph Count"
              value={config.loremIpsumParagraphs}
              onChange={(v) => updateConfig({ loremIpsumParagraphs: v })}
              min={1}
              max={5}
              step={1}
            />
          </Section>

          <Section title="Core Effects">
            <SliderControl
              label="Scale"
              value={config.scale}
              onChange={(v) => updateConfig({ scale: v })}
              min={-200}
              max={200}
              step={1}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Mode</Label>
                <select
                  value={config.mode}
                  onChange={(e) =>
                    updateConfig({
                      mode: e.target.value as "standard" | "shader",
                    })
                  }
                  className="h-9 rounded border border-white/20 bg-black/80 px-3 text-white text-sm"
                >
                  <option value="standard" className="bg-black text-white">
                    Standard
                  </option>
                  <option value="shader" className="bg-black text-white">
                    Shader
                  </option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Over Light</Label>
                <input
                  type="checkbox"
                  checked={config.overLight}
                  onChange={(e) =>
                    updateConfig({ overLight: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Edge Mask</Label>
                <input
                  type="checkbox"
                  checked={config.edgeMask}
                  onChange={(e) => updateConfig({ edgeMask: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </div>
            </div>
            <SliderControl
              label="Radius"
              value={config.radius}
              onChange={(v) => updateConfig({ radius: v })}
              min={0}
              max={100}
              step={1}
            />
            <SliderControl
              label="Frost"
              value={config.frost}
              onChange={(v) => updateConfig({ frost: v })}
              min={0}
              max={1}
            />
            <SliderControl
              label="Saturation"
              value={config.saturation}
              onChange={(v) => updateConfig({ saturation: v })}
              min={0}
              max={2}
            />
            <SliderControl
              label="Backdrop Blur"
              value={config.backdropBlur}
              onChange={(v) => updateConfig({ backdropBlur: v })}
              min={0}
              max={1}
            />
          </Section>

          <Section title="Overlays">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Enabled</Label>
                <input
                  type="checkbox"
                  checked={config.overlays.enabled}
                  onChange={(e) =>
                    updateNestedConfig("overlays", {
                      enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Advanced Border</Label>
                <input
                  type="checkbox"
                  checked={config.overlays.advancedBorder}
                  onChange={(e) =>
                    updateNestedConfig("overlays", {
                      advancedBorder: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
              </div>
            </div>
            <ColorPicker
              label="Border Color"
              value={`rgba(${config.overlays.borderColor})`}
              onChange={(v) =>
                updateNestedConfig("overlays", { borderColor: v })
              }
            />
            <SliderControl
              label="Border Thickness"
              value={config.overlays.borderThickness}
              onChange={(v) =>
                updateNestedConfig("overlays", { borderThickness: v })
              }
              min={0.5}
              max={5}
            />
            <ColorPicker
              label="Hover Light Color"
              value={`rgba(${config.overlays.hoverLightColor})`}
              onChange={(v) =>
                updateNestedConfig("overlays", { hoverLightColor: v })
              }
            />
            <SliderControl
              label="Hover Light Angle"
              value={config.overlays.hoverLightAngle}
              onChange={(v) =>
                updateNestedConfig("overlays", { hoverLightAngle: v })
              }
              min={0}
              max={360}
              step={1}
            />
            <SliderControl
              label="Hover Overlay 1 Opacity"
              value={config.overlays.hoverOverlay1Opacity}
              onChange={(v) =>
                updateNestedConfig("overlays", { hoverOverlay1Opacity: v })
              }
              min={0}
              max={1}
            />
            <SliderControl
              label="Hover Overlay 2 Opacity"
              value={config.overlays.hoverOverlay2Opacity}
              onChange={(v) =>
                updateNestedConfig("overlays", { hoverOverlay2Opacity: v })
              }
              min={0}
              max={1}
            />
          </Section>

          <Section title="Warp Effect">
            <SliderControl
              label="Intensity"
              value={config.warp.intensity}
              onChange={(v) => updateNestedConfig("warp", { intensity: v })}
              min={0}
              max={1}
            />
            <SliderControl
              label="Angle"
              value={config.warp.angle}
              onChange={(v) => updateNestedConfig("warp", { angle: v })}
              min={0}
              max={360}
              step={1}
            />
            <ColorPicker
              label="Warp Color"
              value={config.warp.color}
              onChange={(v) => updateNestedConfig("warp", { color: v })}
            />
          </Section>

          <Section title="Shine">
            <SliderControl
              label="Intensity"
              value={config.shine.intensity}
              onChange={(v) => updateNestedConfig("shine", { intensity: v })}
              min={0}
              max={1}
            />
            <SliderControl
              label="Angle"
              value={config.shine.angle}
              onChange={(v) => updateNestedConfig("shine", { angle: v })}
              min={0}
              max={360}
              step={1}
            />
            <SliderControl
              label="Spread"
              value={config.shine.spread}
              onChange={(v) => updateNestedConfig("shine", { spread: v })}
              min={0}
              max={100}
              step={1}
            />
            <div className="space-y-2">
              <Label className="text-white">Color</Label>
              <Input
                value={config.shine.color}
                onChange={(e) =>
                  updateNestedConfig("shine", { color: e.target.value })
                }
                placeholder="CSS color (e.g. rgba(255,255,255,0.3))"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Type</Label>
                <select
                  value={config.shine.type}
                  onChange={(e) =>
                    updateNestedConfig("shine", {
                      type: e.target.value as "shadow" | "gradient",
                    })
                  }
                  className="h-9 rounded border border-white/20 bg-black/80 px-3 text-white text-sm"
                >
                  <option value="shadow" className="bg-black text-white">
                    Shadow
                  </option>
                  <option value="gradient" className="bg-black text-white">
                    Gradient
                  </option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Chromatic Aberration">
            <SliderControl
              label="Red Offset"
              value={config.r}
              onChange={(v) => updateConfig({ r: v })}
              min={-50}
              max={50}
              step={1}
            />
            <SliderControl
              label="Green Offset"
              value={config.g}
              onChange={(v) => updateConfig({ g: v })}
              min={-50}
              max={50}
              step={1}
            />
            <SliderControl
              label="Blue Offset"
              value={config.b}
              onChange={(v) => updateConfig({ b: v })}
              min={-50}
              max={50}
              step={1}
            />
          </Section>

          <Section title="Hover Effects">
            <SliderControl
              label="Border Width"
              value={config.hover.borderWidth}
              onChange={(v) => updateNestedConfig("hover", { borderWidth: v })}
              min={0}
              max={10}
              step={0.5}
            />
            <div className="space-y-2">
              <Label className="text-white">Border Color</Label>
              <Input
                value={config.hover.borderColor}
                onChange={(e) =>
                  updateNestedConfig("hover", { borderColor: e.target.value })
                }
              />
            </div>
            <SliderControl
              label="Scale"
              value={config.hover.scale}
              onChange={(v) => updateNestedConfig("hover", { scale: v })}
              min={0.5}
              max={2}
              step={0.05}
            />
            <SliderControl
              label="Duration (s)"
              value={config.hover.duration}
              onChange={(v) => updateNestedConfig("hover", { duration: v })}
              min={0}
              max={1}
              step={0.05}
            />
            <div className="space-y-2">
              <Label className="text-white">Easing</Label>
              <Input
                value={config.hover.easing}
                onChange={(e) =>
                  updateNestedConfig("hover", { easing: e.target.value })
                }
              />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
