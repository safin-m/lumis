declare module "../../../glass-effect.js" {
  export class GlassEffect {
    constructor(element: HTMLElement, config: any);
    update(): void;
    destroy(): void;
  }
}
