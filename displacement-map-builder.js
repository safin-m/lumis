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

  // Builds a shader-generated displacement map using liquid glass algorithm
  buildShaderMap(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const smoothStep = (a, b, t) => {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const length2 = (x, y) => Math.hypot(x, y);
    const roundedRectSDF = (x, y, w, h, r) => {
      const qx = Math.abs(x) - w + r;
      const qy = Math.abs(y) - h + r;
      return (
        Math.min(Math.max(qx, qy), 0) +
        length2(Math.max(qx, 0), Math.max(qy, 0)) -
        r
      );
    };

    let maxScale = 1;
    const raw = new Float32Array(width * height * 2);
    let ri = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const uvx = x / width;
        const uvy = y / height;
        const ix = uvx - 0.5;
        const iy = uvy - 0.5;
        const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6);
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
        const scaled = smoothStep(0, 1, displacement);
        const px = ix * scaled + 0.5;
        const py = iy * scaled + 0.5;
        const dx = px * width - x;
        const dy = py * height - y;
        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
        raw[ri++] = dx;
        raw[ri++] = dy;
      }
    }
    maxScale = Math.max(1, maxScale);
    ri = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = raw[ri++];
        const dy = raw[ri++];
        const edgeDistance = Math.min(x, y, width - x - 1, height - y - 1);
        const edgeFactor = Math.min(1, edgeDistance / 2);
        const r = (dx * edgeFactor) / maxScale + 0.5;
        const g = (dy * edgeFactor) / maxScale + 0.5;
        const off = (y * width + x) * 4;
        data[off] = Math.max(0, Math.min(255, r * 255));
        data[off + 1] = Math.max(0, Math.min(255, g * 255));
        data[off + 2] = Math.max(0, Math.min(255, g * 255));
        data[off + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  build() {
    const { width, height, border, lightness, alpha, blur, blend, mode } =
      this.config;
    const { intensity: warpIntensity } = this.config.warp;

    // Calculate border size and inner dimensions
    const borderSize = Math.min(width, height) * (border * 0.5);
    const innerWidth = width - borderSize * 2;
    const innerHeight = height - borderSize * 2;
    // Shader mode: combine shader map with gradient overlays
    if (mode === "shader") {
      const shaderMap = this.buildShaderMap(width, height);
      return `
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.createGradient(`red-${this.filterId}`, "horizontal")}
    ${this.createGradient(`blue-${this.filterId}`, "vertical")}
    ${this.createWarpGradient()}
  </defs>
  <image href="${shaderMap}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none"/>
  ${this.createRect(
    0,
    0,
    width,
    height,
    `url(#red-${this.filterId})`,
    `style="mix-blend-mode: screen"`
  )}
  ${this.createRect(
    0,
    0,
    width,
    height,
    `url(#blue-${this.filterId})`,
    `style="mix-blend-mode: ${blend}"`
  )}
  ${this.createRect(
    borderSize,
    borderSize,
    innerWidth,
    innerHeight,
    `hsl(0 0% ${lightness}% / ${alpha})`,
    `style="filter:blur(${blur}px)"`
  )}
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
