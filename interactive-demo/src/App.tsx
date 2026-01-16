/**
 * Main Application Component
 *
 * This is the root component of the glass effect interactive demo.
 * It manages the overall application state and coordinates between
 * the glass object, settings panel, and background content.
 */

import { useRef, useState } from "react";
import { BackgroundContent } from "./components/BackgroundContent";
import { GlassObject } from "./components/GlassObject";
import { SettingsPanel } from "./components/SettingsPanel";
import { DEFAULT_POSITION, INITIAL_CONFIG } from "./constants";
import type { DemoConfig } from "./types/glass-config";

/**
 * App Component
 *
 * The main application component that provides an interactive demo
 * for the glass effect library. Features include:
 * - Draggable glass object with configurable properties
 * - Real-time settings panel for adjusting glass effect parameters
 * - Background image and lorem ipsum content for testing
 * - Code generation for implementing the effect in your own projects
 */
function App() {
  // State for glass effect configuration
  const [config, setConfig] = useState<DemoConfig>(INITIAL_CONFIG);

  // State for glass object position
  const [position, setPosition] = useState(DEFAULT_POSITION);

  // Reference to the glass effect instance for direct API access
  const glassEffectRef = useRef<any>(null);

  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${config.backgroundImage})`,
        }}
      />

      {/* Lorem ipsum content layer (when enabled) */}
      <BackgroundContent
        show={config.showLoremIpsum}
        color={config.loremIpsumColor}
        fontSize={config.loremIpsumFontSize}
        paragraphCount={config.loremIpsumParagraphs}
      />

      {/* Glass object layer */}
      <div className="absolute inset-0">
        <GlassObject
          config={config}
          position={position}
          onPositionChange={setPosition}
          glassEffectRef={glassEffectRef}
        />
      </div>

      {/* Settings panel overlay */}
      <SettingsPanel
        config={config}
        onConfigChange={setConfig}
        glassEffectRef={glassEffectRef}
      />
    </div>
  );
}

export default App;
