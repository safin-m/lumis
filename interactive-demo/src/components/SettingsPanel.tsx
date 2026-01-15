import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { DemoConfig } from "@/types/glass-config";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ColorPickerCustom } from "./ColorPickerCustom";
import { debounce } from "./debounce";
import { GradientPicker } from "./GradientPicker";
import "./settings-panel-scrollbar.css";

// Helper for rgba string
function rgbaString(color: string) {
  const match = color.match(/^(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$/);
  if (match) {
    const [r, g, b, a] = [match[1], match[2], match[3], match[4] ?? "1"];
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color;
}

interface SettingsPanelProps {
  config: DemoConfig;
  onConfigChange: (config: DemoConfig) => void;
  glassEffectRef: React.MutableRefObject<any>;
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
  header,
  children,
  defaultOpen = false,
}: {
  title: string;
  header?: React.ReactNode;
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
          {header ?? <span className="font-semibold">{title}</span>}
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

export function SettingsPanel({
  config,
  onConfigChange,
  glassEffectRef,
}: SettingsPanelProps) {
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

  // Local state for elasticity and activation zone
  const [elasticity, setElasticity] = useState(config.interactions.elasticity);
  const [activationZone, setActivationZone] = useState(
    config.interactions.activationZone
  );

  // Keep local state in sync with config changes from outside
  useEffect(() => {
    setElasticity(config.interactions.elasticity);
  }, [config.interactions.elasticity]);
  useEffect(() => {
    setActivationZone(config.interactions.activationZone);
  }, [config.interactions.activationZone]);

  // Debounced config update for elasticity
  const debouncedSetElasticity = useCallback(
    debounce((v: number) => {
      updateNestedConfig("interactions", { elasticity: v });
    }, 200),
    []
  );
  // Debounced config update for activation zone
  const debouncedSetActivationZone = useCallback(
    debounce((v: number) => {
      updateNestedConfig("interactions", { activationZone: v });
    }, 200),
    []
  );

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
          <Section
            title="Interactions"
            header={
              <div className="flex items-center justify-between w-full">
                <span>Interactions</span>
                <Switch
                  checked={config.interactions.enabled}
                  onChange={(e) =>
                    updateNestedConfig("interactions", {
                      enabled: e.target.checked,
                    })
                  }
                  className="h-6 w-11"
                />
              </div>
            }
            defaultOpen
          >
            {config.interactions.enabled && (
              <>
                <SliderControl
                  label="Elasticity"
                  value={elasticity}
                  onChange={(v) => {
                    setElasticity(v);
                    debouncedSetElasticity(v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <SliderControl
                  label="Activation Zone"
                  value={activationZone}
                  onChange={(v) => {
                    setActivationZone(v);
                    debouncedSetActivationZone(v);
                  }}
                  min={0}
                  max={500}
                  step={1}
                />
              </>
            )}
          </Section>
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
            <Section title="Background" defaultOpen>
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
                  <Switch
                    checked={config.showLoremIpsum}
                    onChange={(e) =>
                      updateConfig({ showLoremIpsum: e.target.checked })
                    }
                    className="h-6 w-11"
                  />
                </div>
              </div>
              <ColorPickerCustom
                label="Lorem Ipsum Color"
                value={config.loremIpsumColor}
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
          </Section>

          <Section title="Core Effects">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Mode</Label>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      config.mode === "standard"
                        ? "text-white"
                        : "text-white/40"
                    }`}
                  >
                    Standard
                  </span>
                  <Switch
                    checked={config.mode === "shader"}
                    onChange={(e) =>
                      updateConfig({
                        mode: e.target.checked ? "shader" : "standard",
                      })
                    }
                    className="h-6 w-11"
                  />
                  <span
                    className={`text-xs ${
                      config.mode === "shader" ? "text-white" : "text-white/40"
                    }`}
                  >
                    Shader
                  </span>
                </div>
              </div>
            </div>

            {config.mode === "shader" && (
              <Section title="Shader Parameters" defaultOpen={false}>
                <SliderControl
                  label="Edge Fade Start"
                  value={config.shaderEdgeFadeStart}
                  onChange={(v) => updateConfig({ shaderEdgeFadeStart: v })}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <SliderControl
                  label="Edge Fade Offset"
                  value={config.shaderEdgeFadeOffset}
                  onChange={(v) => updateConfig({ shaderEdgeFadeOffset: v })}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <SliderControl
                  label="Corner Radius"
                  value={config.shaderCornerRadius}
                  onChange={(v) => updateConfig({ shaderCornerRadius: v })}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <SliderControl
                  label="Width Factor"
                  value={config.shaderWidthFactor}
                  onChange={(v) => updateConfig({ shaderWidthFactor: v })}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <SliderControl
                  label="Height Factor"
                  value={config.shaderHeightFactor}
                  onChange={(v) => updateConfig({ shaderHeightFactor: v })}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <SliderControl
                  label="Edge Distance Divisor"
                  value={config.shaderEdgeDistanceDivisor}
                  onChange={(v) =>
                    updateConfig({ shaderEdgeDistanceDivisor: v })
                  }
                  min={1}
                  max={10}
                  step={0.1}
                />
              </Section>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Over Light</Label>
                <Switch
                  checked={config.overLight}
                  onChange={(e) =>
                    updateConfig({ overLight: e.target.checked })
                  }
                  className="h-6 w-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Edge Mask</Label>
                <Switch
                  checked={config.edgeMask}
                  onChange={(e) => updateConfig({ edgeMask: e.target.checked })}
                  className="h-6 w-11"
                />
              </div>
            </div>
            {config.edgeMask && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-sm">
                      Preserve Center Distortion
                    </Label>
                    <Switch
                      checked={config.edgeMaskPreserveDistortion}
                      onChange={(e) =>
                        updateConfig({
                          edgeMaskPreserveDistortion: e.target.checked,
                        })
                      }
                      className="h-6 w-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-sm">
                      Arithmetic Blend (Experimental)
                    </Label>
                    <Switch
                      checked={config.edgeMaskArithmeticBlend}
                      onChange={(e) =>
                        updateConfig({
                          edgeMaskArithmeticBlend: e.target.checked,
                        })
                      }
                      className="h-6 w-11"
                    />
                  </div>
                </div>
              </>
            )}

            <SliderControl
              label="Scale"
              value={config.scale}
              onChange={(v) => updateConfig({ scale: v })}
              min={-200}
              max={200}
              step={1}
            />
            <SliderControl
              label="Border Fade"
              value={config.border}
              onChange={(v) => updateConfig({ border: v })}
              min={0}
              max={1}
              step={0.01}
            />
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
            <SliderControl
              label="Lightness"
              value={config.lightness}
              onChange={(v) => updateConfig({ lightness: v })}
              min={0}
              max={100}
              step={1}
            />
            <SliderControl
              label="Alpha"
              value={config.alpha}
              onChange={(v) => updateConfig({ alpha: v })}
              min={0}
              max={1}
              step={0.01}
            />
            <SliderControl
              label="Center Blur"
              value={config.blur}
              onChange={(v) => updateConfig({ blur: v })}
              min={0}
              max={50}
              step={1}
            />
            <SliderControl
              label="Output Blur (Displace)"
              value={config.displace}
              onChange={(v) => updateConfig({ displace: v })}
              min={0}
              max={10}
              step={0.1}
            />
            <div className="space-y-2">
              <Label className="text-white">Blend Mode</Label>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-2 py-1 text-white text-sm mt-1"
                value={config.blend}
                onChange={(e) => updateConfig({ blend: e.target.value })}
              >
                <option value="difference" className="bg-black/90 text-white">
                  Difference
                </option>
                <option value="normal" className="bg-black/90 text-white">
                  Normal
                </option>
                <option value="multiply" className="bg-black/90 text-white">
                  Multiply
                </option>
                <option value="screen" className="bg-black/90 text-white">
                  Screen
                </option>
                <option value="color" className="bg-black/90 text-white">
                  Color
                </option>
                <option value="color-dodge" className="bg-black/90 text-white">
                  Color Dodge
                </option>
                <option value="color-burn" className="bg-black/90 text-white">
                  Color Burn
                </option>
                <option value="darken" className="bg-black/90 text-white">
                  Darken
                </option>
                <option value="lighten" className="bg-black/90 text-white">
                  Lighten
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">X Channel</Label>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-2 py-1 text-white text-sm mt-1"
                value={config.x}
                onChange={(e) =>
                  updateConfig({ x: e.target.value as "R" | "G" | "B" })
                }
              >
                <option value="R" className="bg-black/90 text-white">
                  R
                </option>
                <option value="G" className="bg-black/90 text-white">
                  G
                </option>
                <option value="B" className="bg-black/90 text-white">
                  B
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Y Channel</Label>
              <select
                className="w-full rounded border border-white/20 bg-black/30 px-2 py-1 text-white text-sm mt-1"
                value={config.y}
                onChange={(e) =>
                  updateConfig({ y: e.target.value as "R" | "G" | "B" })
                }
              >
                <option value="R" className="bg-black/90 text-white">
                  R
                </option>
                <option value="G" className="bg-black/90 text-white">
                  G
                </option>
                <option value="B" className="bg-black/90 text-white">
                  B
                </option>
              </select>
            </div>
          </Section>

          <Section title="Overlays">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Enable Overlays</Label>
                <Switch
                  checked={config.overlays.enabled}
                  onChange={(e) =>
                    updateNestedConfig("overlays", {
                      enabled: e.target.checked,
                    })
                  }
                  className="h-6 w-11"
                />
              </div>
            </div>
            {config.overlays.enabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-white">Hover Overlay Blend Mode</Label>
                  <select
                    className="w-full rounded border border-white/20 bg-black/30 px-2 py-1 text-white text-sm"
                    value={config.overlays.hoverOverlayBlendMode || "overlay"}
                    onChange={(e) =>
                      updateNestedConfig("overlays", {
                        hoverOverlayBlendMode: e.target.value,
                      })
                    }
                  >
                    <option value="overlay" className="bg-black/90 text-white">
                      Overlay (default)
                    </option>
                    <option value="normal" className="bg-black/90 text-white">
                      Normal
                    </option>
                    <option value="multiply" className="bg-black/90 text-white">
                      Multiply
                    </option>
                    <option value="screen" className="bg-black/90 text-white">
                      Screen
                    </option>
                    <option value="color" className="bg-black/90 text-white">
                      Color
                    </option>
                    <option
                      value="color-dodge"
                      className="bg-black/90 text-white"
                    >
                      Color Dodge
                    </option>
                    <option
                      value="color-burn"
                      className="bg-black/90 text-white"
                    >
                      Color Burn
                    </option>
                    <option value="darken" className="bg-black/90 text-white">
                      Darken
                    </option>
                    <option value="lighten" className="bg-black/90 text-white">
                      Lighten
                    </option>
                    <option
                      value="difference"
                      className="bg-black/90 text-white"
                    >
                      Difference
                    </option>
                    <option
                      value="exclusion"
                      className="bg-black/90 text-white"
                    >
                      Exclusion
                    </option>
                    <option value="hue" className="bg-black/90 text-white">
                      Hue
                    </option>
                    <option
                      value="saturation"
                      className="bg-black/90 text-white"
                    >
                      Saturation
                    </option>
                    <option
                      value="luminosity"
                      className="bg-black/90 text-white"
                    >
                      Luminosity
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Advanced Border</Label>
                    <Switch
                      checked={config.overlays.advancedBorder}
                      onChange={(e) =>
                        updateNestedConfig("overlays", {
                          advancedBorder: e.target.checked,
                        })
                      }
                      className="h-6 w-11"
                    />
                  </div>
                </div>
                <ColorPickerCustom
                  label="Border Color"
                  value={config.overlays.borderColor}
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
                <ColorPickerCustom
                  label="Hover Overlay 1 Light Color"
                  value={config.overlays.hoverOverlay1LightColor}
                  onChange={(v) =>
                    updateNestedConfig("overlays", {
                      hoverOverlay1LightColor: v,
                    })
                  }
                />
                <SliderControl
                  label="Hover Overlay 1 Angle"
                  value={config.overlays.hoverOverlay1Angle}
                  onChange={(v) =>
                    updateNestedConfig("overlays", { hoverOverlay1Angle: v })
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
                <ColorPickerCustom
                  label="Hover Overlay 2 Light Color"
                  value={config.overlays.hoverOverlay2LightColor}
                  onChange={(v) =>
                    updateNestedConfig("overlays", {
                      hoverOverlay2LightColor: v,
                    })
                  }
                />
                <SliderControl
                  label="Hover Overlay 2 Angle"
                  value={config.overlays.hoverOverlay2Angle}
                  onChange={(v) =>
                    updateNestedConfig("overlays", { hoverOverlay2Angle: v })
                  }
                  min={0}
                  max={360}
                  step={1}
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

                {config.overlays.enabled && config.overlays.advancedBorder && (
                  <Section title="Border Gradient" defaultOpen={false}>
                    <SliderControl
                      label="Start Base"
                      value={config.hover.borderGradient.startBase}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            startBase: v,
                          },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                    <SliderControl
                      label="Start Offset Multiplier"
                      value={config.hover.borderGradient.startOffsetMultiplier}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            startOffsetMultiplier: v,
                          },
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                    />
                    <SliderControl
                      label="End Base"
                      value={config.hover.borderGradient.endBase}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            endBase: v,
                          },
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                    <SliderControl
                      label="End Offset Multiplier"
                      value={config.hover.borderGradient.endOffsetMultiplier}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            endOffsetMultiplier: v,
                          },
                        })
                      }
                      min={0}
                      max={1}
                      step={0.05}
                    />
                    <SliderControl
                      label="Opacity Base"
                      value={config.hover.borderGradient.opacityBase}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            opacityBase: v,
                          },
                        })
                      }
                      min={0}
                      max={1}
                      step={0.01}
                    />
                    <SliderControl
                      label="Opacity Multiplier"
                      value={config.hover.borderGradient.opacityMultiplier}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            opacityMultiplier: v,
                          },
                        })
                      }
                      min={0}
                      max={0.05}
                      step={0.001}
                    />
                    <SliderControl
                      label="Peak Opacity Base"
                      value={config.hover.borderGradient.peakOpacityBase}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            peakOpacityBase: v,
                          },
                        })
                      }
                      min={0}
                      max={1}
                      step={0.01}
                    />
                    <SliderControl
                      label="Peak Opacity Multiplier"
                      value={config.hover.borderGradient.peakOpacityMultiplier}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            peakOpacityMultiplier: v,
                          },
                        })
                      }
                      min={0}
                      max={0.05}
                      step={0.001}
                    />
                    <SliderControl
                      label="Secondary Boost"
                      value={config.hover.borderGradient.secondaryBoost}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            secondaryBoost: v,
                          },
                        })
                      }
                      min={0}
                      max={0.5}
                      step={0.01}
                    />
                    <SliderControl
                      label="Angle Base"
                      value={config.hover.borderGradient.angleBase}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            angleBase: v,
                          },
                        })
                      }
                      min={0}
                      max={360}
                      step={1}
                    />
                    <SliderControl
                      label="Angle Multiplier"
                      value={config.hover.borderGradient.angleMultiplier}
                      onChange={(v) =>
                        updateNestedConfig("hover", {
                          borderGradient: {
                            ...config.hover.borderGradient,
                            angleMultiplier: v,
                          },
                        })
                      }
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </Section>
                )}

                <Section title="Additive Overlay" defaultOpen={false}>
                  <Label className="text-white font-semibold">
                    Extra Overlay
                  </Label>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enabled</Label>
                    <Switch
                      checked={config.overlays.extraOverlay?.enabled || false}
                      onChange={(e) =>
                        updateNestedConfig("overlays", {
                          extraOverlay: {
                            ...config.overlays.extraOverlay,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="h-6 w-11"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Background Gradient</Label>
                    <GradientPicker
                      label=""
                      value={
                        config.overlays.extraOverlay?.gradient || {
                          color1: "186, 85, 211, 0.4",
                          color2: "255, 0, 255, 0.3",
                          angle: 135,
                          type: "radial",
                        }
                      }
                      onChange={(gradient) => {
                        // Compose CSS gradient string
                        let background = "";
                        if (gradient.type === "radial") {
                          background = `radial-gradient(circle at center, ${rgbaString(
                            gradient.color1
                          )} 0%, ${rgbaString(gradient.color2)} 100%)`;
                        } else {
                          background = `linear-gradient(${
                            gradient.angle
                          }deg, ${rgbaString(gradient.color1)} 0%, ${rgbaString(
                            gradient.color2
                          )} 100%)`;
                        }
                        updateNestedConfig("overlays", {
                          extraOverlay: {
                            ...config.overlays.extraOverlay,
                            background,
                            gradient,
                          },
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Opacity</Label>
                    <SliderControl
                      label=""
                      value={
                        typeof config.overlays.extraOverlay?.opacity ===
                        "number"
                          ? config.overlays.extraOverlay.opacity
                          : 1
                      }
                      onChange={(v) =>
                        updateNestedConfig("overlays", {
                          extraOverlay: {
                            ...config.overlays.extraOverlay,
                            opacity: v,
                          },
                        })
                      }
                      min={0}
                      max={1}
                      step={0.01}
                    />
                  </div>
                  <div>
                    <Label className="text-white">Blend Mode</Label>
                    <select
                      className="w-full rounded border border-white/20 bg-black/30 px-2 py-1 text-white text-sm mt-1"
                      value={config.overlays.extraOverlay?.blendMode || "color"}
                      onChange={(e) =>
                        updateNestedConfig("overlays", {
                          extraOverlay: {
                            ...config.overlays.extraOverlay,
                            blendMode: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="color" className="bg-black/90 text-white">
                        Color (default)
                      </option>
                      <option value="hue" className="bg-black/90 text-white">
                        Hue
                      </option>
                      <option
                        value="overlay"
                        className="bg-black/90 text-white"
                      >
                        Overlay
                      </option>
                      <option value="screen" className="bg-black/90 text-white">
                        Screen
                      </option>
                      <option
                        value="multiply"
                        className="bg-black/90 text-white"
                      >
                        Multiply
                      </option>
                      <option value="normal" className="bg-black/90 text-white">
                        Normal
                      </option>
                    </select>
                  </div>
                </Section>
              </>
            )}
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
            <ColorPickerCustom
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
            <ColorPickerCustom
              label="Color"
              value={config.shine.color}
              onChange={(v) => updateNestedConfig("shine", { color: v })}
            />
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
                  className="h-9 rounded border border-white/20 bg-black/30 px-3 text-white text-sm"
                >
                  <option value="shadow" className="bg-black/90 text-white">
                    Shadow
                  </option>
                  <option value="gradient" className="bg-black/90 text-white">
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
            <ColorPickerCustom
              label="Border Color"
              value={config.hover.borderColor}
              onChange={(v) => updateNestedConfig("hover", { borderColor: v })}
            />
            {!config.interactions.enabled && (
              <SliderControl
                label="Scale"
                value={config.hover.scale}
                onChange={(v) => updateNestedConfig("hover", { scale: v })}
                min={0.5}
                max={2}
                step={0.05}
              />
            )}
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
              <select
                className="h-9 rounded border border-white/20 bg-black/30 px-3 text-white text-sm w-full"
                value={config.hover.easing}
                onChange={(e) =>
                  updateNestedConfig("hover", { easing: e.target.value })
                }
              >
                <option value="ease" className="bg-black/90 text-white">
                  ease
                </option>
                <option value="linear" className="bg-black/90 text-white">
                  linear
                </option>
                <option value="ease-in" className="bg-black/90 text-white">
                  ease-in
                </option>
                <option value="ease-out" className="bg-black/90 text-white">
                  ease-out
                </option>
                <option value="ease-in-out" className="bg-black/90 text-white">
                  ease-in-out
                </option>
                <option
                  value="cubic-bezier(0.4, 0, 0.2, 1)"
                  className="bg-black/90 text-white"
                >
                  cubic-bezier(0.4, 0, 0.2, 1) (standard)
                </option>
                <option
                  value="cubic-bezier(0.4, 0, 1, 1)"
                  className="bg-black/90 text-white"
                >
                  cubic-bezier(0.4, 0, 1, 1) (accelerate)
                </option>
                <option
                  value="cubic-bezier(0, 0, 0.2, 1)"
                  className="bg-black/90 text-white"
                >
                  cubic-bezier(0, 0, 0.2, 1) (decelerate)
                </option>
              </select>
            </div>
          </Section>

          <Section title="Export Configuration">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-semibold">
                    JavaScript Config
                  </Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const configCode = generateConfigCode(config);
                      navigator.clipboard.writeText(configCode);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    Copy
                  </Button>
                </div>
                <pre className="p-3 bg-black/40 rounded border border-white/10 text-xs text-white overflow-x-auto max-h-[300px] overflow-y-auto">
                  <code>{generateConfigCode(config)}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-semibold">
                    HTML Data Attributes
                  </Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const dataAttrs = generateDataAttributes(config);
                      navigator.clipboard.writeText(dataAttrs);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    Copy
                  </Button>
                </div>
                <pre className="p-3 bg-black/40 rounded border border-white/10 text-xs text-white overflow-x-auto max-h-[300px] overflow-y-auto">
                  <code>{generateDataAttributes(config)}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-semibold">
                    SVG Displacement Map
                  </Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const svg = generateSVGCode(glassEffectRef);
                      navigator.clipboard.writeText(svg);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    Copy
                  </Button>
                </div>
                <pre className="p-3 bg-black/40 rounded border border-white/10 text-xs text-white overflow-x-auto max-h-[300px] overflow-y-auto">
                  <code>{generateSVGCode(glassEffectRef)}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-semibold">
                    SVG Filter Markup
                  </Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const markup =
                        glassEffectRef.current?.exportSVGFilterMarkup?.() ||
                        "<!-- Glass effect not initialized yet -->";
                      navigator.clipboard.writeText(markup);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    Copy
                  </Button>
                </div>
                <pre className="p-3 bg-black/40 rounded border border-white/10 text-xs text-white overflow-x-auto max-h-[300px] overflow-y-auto">
                  <code>
                    {glassEffectRef.current?.exportSVGFilterMarkup?.() ||
                      "<!-- Glass effect not initialized yet -->"}
                  </code>
                </pre>
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

// Helper functions for code generation
function generateConfigCode(config: DemoConfig): string {
  const cleanConfig = {
    scale: config.scale,
    radius: config.radius,
    frost: config.frost,
    saturation: config.saturation,
    backdropBlur: config.backdropBlur,
    overLight: config.overLight,
    mode: config.mode,
    ...(config.mode === "shader" && {
      shaderEdgeFadeStart: config.shaderEdgeFadeStart,
      shaderEdgeFadeOffset: config.shaderEdgeFadeOffset,
      shaderCornerRadius: config.shaderCornerRadius,
      shaderWidthFactor: config.shaderWidthFactor,
      shaderHeightFactor: config.shaderHeightFactor,
      shaderEdgeDistanceDivisor: config.shaderEdgeDistanceDivisor,
    }),
    edgeMask: config.edgeMask,
    edgeMaskPreserveDistortion: config.edgeMaskPreserveDistortion,
    edgeMaskArithmeticBlend: config.edgeMaskArithmeticBlend,
    border: config.border,
    lightness: config.lightness,
    alpha: config.alpha,
    blur: config.blur,
    displace: config.displace,
    blend: config.blend,
    x: config.x,
    y: config.y,
    r: config.r,
    g: config.g,
    b: config.b,
    warp: config.warp,
    shine: config.shine,
    hover: config.hover,
    interactions: config.interactions,
    overlays: config.overlays,
  };

  return `const glassConfig = ${JSON.stringify(cleanConfig, null, 2)};

// Usage:
// new GlassEffect(element, glassConfig);`;
}

function generateDataAttributes(config: DemoConfig): string {
  const attrs: string[] = [];

  attrs.push(`data-glass-scale="${config.scale}"`);
  attrs.push(`data-glass-radius="${config.radius}"`);
  attrs.push(`data-glass-frost="${config.frost}"`);
  attrs.push(`data-glass-saturation="${config.saturation}"`);
  attrs.push(`data-glass-backdrop-blur="${config.backdropBlur}"`);
  attrs.push(`data-glass-over-light="${config.overLight}"`);
  attrs.push(`data-glass-mode="${config.mode}"`);

  if (config.mode === "shader") {
    attrs.push(
      `data-glass-shader-edge-fade-start="${config.shaderEdgeFadeStart}"`
    );
    attrs.push(
      `data-glass-shader-edge-fade-offset="${config.shaderEdgeFadeOffset}"`
    );
    attrs.push(
      `data-glass-shader-corner-radius="${config.shaderCornerRadius}"`
    );
    attrs.push(`data-glass-shader-width-factor="${config.shaderWidthFactor}"`);
    attrs.push(
      `data-glass-shader-height-factor="${config.shaderHeightFactor}"`
    );
    attrs.push(
      `data-glass-shader-edge-distance-divisor="${config.shaderEdgeDistanceDivisor}"`
    );
  }

  attrs.push(`data-glass-edge-mask="${config.edgeMask}"`);
  attrs.push(
    `data-glass-edge-mask-preserve-distortion="${config.edgeMaskPreserveDistortion}"`
  );
  attrs.push(
    `data-glass-edge-mask-arithmetic-blend="${config.edgeMaskArithmeticBlend}"`
  );
  attrs.push(`data-glass-border="${config.border}"`);
  attrs.push(`data-glass-lightness="${config.lightness}"`);
  attrs.push(`data-glass-alpha="${config.alpha}"`);
  attrs.push(`data-glass-blur="${config.blur}"`);
  attrs.push(`data-glass-displace="${config.displace}"`);
  attrs.push(`data-glass-blend="${config.blend}"`);
  attrs.push(`data-glass-x="${config.x}"`);
  attrs.push(`data-glass-y="${config.y}"`);
  attrs.push(`data-glass-r="${config.r}"`);
  attrs.push(`data-glass-g="${config.g}"`);
  attrs.push(`data-glass-b="${config.b}"`);

  return `<div data-glass-effect"\n  ${attrs.join(
    "\n  "
  )}>\n  <!-- Your content here -->\n</div>`;
}

function generateSVGCode(glassEffectRef: React.MutableRefObject<any>): string {
  try {
    if (!glassEffectRef.current) {
      return "<!-- Glass effect not initialized yet -->";
    }

    // Get the displacement map data URL from the glass effect
    const dataUrl = glassEffectRef.current.cachedDisplacementMap;
    if (!dataUrl) {
      return "<!-- Displacement map not generated yet -->";
    }

    // If it's a data URL with SVG, decode it
    if (dataUrl.startsWith("data:image/svg+xml,")) {
      const svgContent = decodeURIComponent(
        dataUrl.replace("data:image/svg+xml,", "")
      );
      return svgContent;
    }

    // If it's a shader mode (canvas data URL), return info
    if (dataUrl.startsWith("data:image/png")) {
      return `<!-- Shader mode uses a canvas-generated PNG data URL.
   This cannot be exported as static SVG.
   Data URL: ${dataUrl.substring(0, 100)}... -->`;
    }

    return dataUrl;
  } catch (e) {
    return `<!-- SVG generation error: ${e} -->`;
  }
}
