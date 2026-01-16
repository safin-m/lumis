import type { GlassConfig } from "@/types/glass-config";

declare module "@/assets/js/glass-effect.esm.js" {
  export class GlassEffect {
    config: GlassConfig;
    cachedDisplacementMap?: string;
    constructor(element: HTMLElement, config: GlassConfig);
    update(): void;
    destroy(): void;
    exportSVGFilterMarkup?(): string;
  }
}

export {};
