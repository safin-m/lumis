import type { GlassConfig } from "./glass-config";

declare module "../../dist/glass-effect.esm.js" {
  export class GlassEffect {
    config: GlassConfig;
    cachedDisplacementMap?: string;
    constructor(element: HTMLElement, config: GlassConfig);
    update(): void;
    destroy(): void;
    exportSVGFilterMarkup?(): string;
  }
}

export type { GlassEffect } from "../../dist/glass-effect.esm.js";
