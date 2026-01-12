/**
 * Builds displacement map SVG for distortion effect
 */
export class DisplacementMapBuilder {
  constructor(filterId, config) {
    this.filterId = filterId;
    this.config = config;
  }

  createGradient(id, direction) {
    const isHorizontal = direction === "horizontal";
    const color = isHorizontal ? "red" : "blue";

    return `
      <linearGradient 
        id="${id}" 
        x1="${isHorizontal ? "100%" : "0%"}" 
        y1="0%" 
        x2="${isHorizontal ? "0%" : "0%"}" 
        y2="${isHorizontal ? "0%" : "100%"}">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="100%" stop-color="${color}"/>
      </linearGradient>
    `;
  }

  createRect(x, y, width, height, fill, extraAttrs = "") {
    const { radius } = this.config;

    return `<rect 
      x="${x}" 
      y="${y}" 
      width="${width}" 
      height="${height}" 
      rx="${radius}" 
      fill="${fill}" 
      ${extraAttrs}/>`;
  }

  createWarpGradient() {
    const { angle, intensity, color } = this.config.warp;

    if (intensity === 0) return "";

    // Convert angle to radians and calculate gradient direction
    const angleRad = (angle * Math.PI) / 180;
    const x1 = 50 + 50 * Math.cos(angleRad + Math.PI);
    const y1 = 50 + 50 * Math.sin(angleRad + Math.PI);
    const x2 = 50 + 50 * Math.cos(angleRad);
    const y2 = 50 + 50 * Math.sin(angleRad);

    return `
      <linearGradient id="warp-${this.filterId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
        <stop offset="50%" stop-color="${color}" stop-opacity="${intensity}"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </linearGradient>
    `;
  }

  build() {
    const { width, height, border, lightness, alpha, blur, blend } =
      this.config;
    const { intensity: warpIntensity } = this.config.warp;

    // Calculate border size and inner dimensions
    const borderSize = Math.min(width, height) * (border * 0.5);
    const innerWidth = width - borderSize * 2;
    const innerHeight = height - borderSize * 2;

    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${this.createGradient(`red-${this.filterId}`, "horizontal")}
          ${this.createGradient(`blue-${this.filterId}`, "vertical")}
          ${this.createWarpGradient()}
        </defs>
        
        <!-- Black background -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
        
        <!-- Red gradient for horizontal displacement -->
        ${this.createRect(0, 0, width, height, `url(#red-${this.filterId})`)}
        
        <!-- Blue gradient for vertical displacement -->
        ${this.createRect(
          0,
          0,
          width,
          height,
          `url(#blue-${this.filterId})`,
          `style="mix-blend-mode: ${blend}"`
        )}
        
        <!-- Center blur to reduce edge distortion -->
        ${this.createRect(
          borderSize,
          borderSize,
          innerWidth,
          innerHeight,
          `hsl(0 0% ${lightness}% / ${alpha})`,
          `style="filter:blur(${blur}px)"`
        )}
        
        <!-- Warp effect -->
        ${
          warpIntensity > 0
            ? this.createRect(
                0,
                0,
                width,
                height,
                `url(#warp-${this.filterId})`,
                `style="mix-blend-mode: lighten"`
              )
            : ""
        }
      </svg>
    `;
  }
}
