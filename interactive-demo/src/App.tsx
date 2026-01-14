import { useState } from "react";
import { GlassObject } from "./components/GlassObject";
import { SettingsPanel } from "./components/SettingsPanel";
import type { DemoConfig } from "./types/glass-config";

const initialConfig: DemoConfig = {
  scale: -180,
  radius: 16,
  frost: 0,
  saturation: 1,
  backdropBlur: 0,
  overLight: false,
  mode: "standard",
  edgeMask: false,
  edgeMaskPreserveDistortion: false,
  edgeMaskArithmeticBlend: false,
  aberrationIntensity: 2,

  interactions: {
    enabled: true,
    elasticity: 0.15,
    activationZone: 200,
  },

  overlays: {
    enabled: true,
    advancedBorder: true,
    borderColor: "255, 255, 255, 1",
    borderThickness: 1.5,
    hoverLightColor: "255, 255, 255, 1",
    hoverLightAngle: 0,
    hoverLightIntensity: 1,
    hoverOverlay1Opacity: 0.5,
    hoverOverlay2Opacity: 0,
    extraOverlay: {
      enabled: false,
      background:
        "radial-gradient(circle at center, rgba(186, 85, 211, 0.4) 0%, rgba(255, 0, 255, 0.3) 100%)",
      opacity: 1,
      blendMode: "color",
    },
  },

  border: 0.07,
  lightness: 50,
  alpha: 0.93,
  blur: 11,
  displace: 0,
  blend: "difference",

  x: "R",
  y: "B",
  r: 0,
  g: 10,
  b: 20,

  warp: {
    angle: 195,
    intensity: 0,
    color: "rgba(255, 221, 153, 1)",
  },

  shine: {
    angle: 135,
    intensity: 0.4,
    color: "hsla(0, 100%, 74%, 0.29)",
    spread: 40,
    type: "shadow",
  },

  hover: {
    borderWidth: 1,
    borderColor: "hsl(0, 0%, 100%)",
    scale: 1,
    duration: 0.3,
    easing: "ease-in-out",
  },

  width: 400,
  height: 300,
  text: "",
  backgroundImage: "https://picsum.photos/1920/1080?random=1",
  showLoremIpsum: false,
  loremIpsumColor: "255, 255, 255, 0.8",
  loremIpsumFontSize: 18,
  loremIpsumParagraphs: 3,
};

function App() {
  const [config, setConfig] = useState<DemoConfig>(initialConfig);
  const [position, setPosition] = useState({ x: 200, y: 200 });

  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${config.backgroundImage})`,
        }}
      />

      {config.showLoremIpsum && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div
            className="max-w-4xl leading-relaxed"
            style={{
              color: `rgba(${config.loremIpsumColor})`,
              fontSize: `${config.loremIpsumFontSize}px`,
            }}
          >
            {Array.from({ length: config.loremIpsumParagraphs }, (_, i) => {
              const paragraphs = [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
                "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
                "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa.",
              ];
              return (
                <p key={i} className="mb-4">
                  {paragraphs[i % paragraphs.length]}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute inset-0">
        <GlassObject
          config={config}
          position={position}
          onPositionChange={setPosition}
        />
      </div>

      <SettingsPanel config={config} onConfigChange={setConfig} />
    </div>
  );
}

export default App;
