# Glass Effect Library

A performant glass morphism effect library with SVG displacement mapping, chromatic aberration, and customizable shine effects.

## Features

- 🎨 Realistic glass effect with displacement mapping
- 🌈 Chromatic aberration for depth
- ✨ Customizable warp and shine effects
- 🎯 Hover interactions with border glow
- ⚡ Performance optimized with RAF and memoization
- 📦 Zero dependencies
- 🎭 Works on any HTML element

## Installation

```bash
npm install glass-effect
```

## Development & Building

### Setup

```bash
# Install dependencies
npm install
```

### Build

```bash
# Build all bundle formats (ESM, CommonJS, Browser IIFE)
npm run build
```

This creates:

- `dist/glass-effect.js` - ES Module (for modern bundlers)
- `dist/glass-effect.cjs` - CommonJS (for Node.js)
- `dist/glass-effect.browser.js` - Browser IIFE (for direct script tag usage)
- `dist/glass-effect.css` - Optional base styles

### Development Server

```bash
# Start local development server on port 8000
npm run dev
```

## Usage

### As ES Module

```javascript
import { GlassEffect } from "glass-effect";

const element = document.querySelector(".my-glass");
new GlassEffect(element, {
  warp: {
    angle: 195,
    intensity: 0.5,
    color: "hsla(40, 100%, 80%, 1)",
  },
  shine: {
    angle: 135,
    intensity: 0.4,
    color: "hsla(70, 100%, 70%, 0.4)",
    spread: 40,
    type: "shadow",
  },
  hover: {
    borderWidth: 2,
    borderColor: "hsl(200, 100%, 70%)",
    scale: 1.02,
    duration: 0.3,
  },
});
```

### Auto-initialization with Data Attributes

```html
<div
  data-glass-effect
  data-glass-warp-angle="180"
  data-glass-warp-intensity="0.5"
  data-glass-shine-intensity="0.6"
  data-glass-hover-border-width="2"
>
  Your content here
</div>

<script type="module" src="glass-effect.js"></script>
```

### Browser (IIFE)

```html
<script src="glass-effect.browser.js"></script>
<script>
  const { GlassEffect } = window.GlassEffect;
  new GlassEffect(document.querySelector(".my-glass"));
</script>
```

## Configuration

### Core Glass Effect

- `scale` - Chromatic aberration intensity (default: -180)
- `radius` - Border radius in pixels (default: 16)
- `frost` - Background frost opacity 0-1 (default: 0)
- `saturation` - Backdrop saturation multiplier (default: 1)

### Displacement Map

- `border` - Edge blur border size 0-1 (default: 0.07)
- `lightness` - Center lightness 0-100 (default: 50)
- `alpha` - Center opacity 0-1 (default: 0.93)
- `blur` - Center blur amount (default: 11)
- `displace` - Output blur smoothing (default: 0)
- `blend` - Blend mode for gradients (default: "difference")

### Chromatic Aberration

- `x` - X channel selector: "R", "G", "B" (default: "R")
- `y` - Y channel selector: "R", "G", "B" (default: "B")
- `r`, `g`, `b` - RGB channel offsets (default: 0, 10, 20)

### Warp Effect

```javascript
warp: {
  angle: 195,        // 0-360 degrees
  intensity: 0,      // 0-1
  color: 'hsla(...)', // Any CSS color
}
```

### Shine Effect

```javascript
shine: {
  angle: 135,         // 0-360 degrees
  intensity: 0.4,     // 0-1
  color: 'hsla(...)', // Any CSS color
  spread: 40,         // Blur spread in pixels
  type: 'shadow',     // 'shadow' or 'gradient'
}
```

### Hover Effects

```javascript
hover: {
  borderWidth: 1,            // Border thickness in pixels
  borderColor: 'hsl(...)',   // Border color on hover
  scale: 1.05,               // Scale transform
  duration: 0.3,             // Transition duration in seconds
  easing: 'ease-in-out',     // CSS easing function
}
```

## Data Attributes

All config options can be set via data attributes:

- Core: `data-glass-scale`, `data-glass-radius`, `data-glass-frost`
- Warp: `data-glass-warp-angle`, `data-glass-warp-intensity`, `data-glass-warp-color`
- Shine: `data-glass-shine-angle`, `data-glass-shine-intensity`, `data-glass-shine-color`
- Hover: `data-glass-hover-border-width`, `data-glass-hover-scale`

## API

### GlassEffect Class

```javascript
const effect = new GlassEffect(element, config);

// Update effect
effect.update();

// Cleanup
effect.destroy();
```

## Browser Support

- ✅ Chrome/Edge (modern)
- ✅ Safari (with -webkit- prefix)
- ⚠️ Firefox (limited SVG filter support in backdrop-filter)

## License

MIT
