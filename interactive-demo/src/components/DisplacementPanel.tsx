import { useEffect, useState } from "react";

interface Props {
  glassEffectRef: React.MutableRefObject<any>;
}

export function DisplacementPanel({ glassEffectRef }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const url: string | undefined =
          glassEffectRef.current?.cachedDisplacementMap;
        setDataUrl(url || null);

        setFilterId(glassEffectRef.current?.filterId || null);

        if (url && url.startsWith("data:image/svg+xml,")) {
          const decoded = decodeURIComponent(
            url.replace("data:image/svg+xml,", ""),
          );

          let modified = decoded;

          // Ensure the svg preserves aspect ratio and fits the container
          if (!/preserveAspectRatio/i.test(modified)) {
            modified = modified.replace(
              /^<svg\b/i,
              '<svg preserveAspectRatio="xMidYMid meet"',
            );
          }

          // Ensure svg has width/height styling to scale responsively
          if (!/\bwidth\s*=|\bheight\s*=|style=/.test(modified)) {
            modified = modified.replace(
              /^<svg\b/i,
              '<svg style="width:100%;height:auto;display:block;"',
            );
          } else {
            // If style exists, try to append sizing rules
            modified = modified.replace(
              /^<svg\b([^>]*)style=("|')([^"']*)("|')/i,
              (m, before, q1, styleVal) => {
                return `<svg${before}style="${styleVal};width:100%;height:auto;display:block;"`;
              },
            );
          }

          setSvgContent(modified);
        } else {
          setSvgContent(null);
        }
      } catch (e) {
        setDataUrl(null);
        setSvgContent(null);
      }
    };

    update();

    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [glassEffectRef]);

  return (
    <div className="fixed top-4 z-50" style={{ right: 416, width: 320 }}>
      <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-white font-semibold">Displacement</h3>
        </div>
        <div className="p-3 space-y-3 max-h-[30vh] overflow-y-auto">
          <div>
            <div className="text-sm text-white/70 mb-2">Preview</div>
            <div className="w-full h-full bg-white/5 rounded flex items-center justify-center">
              {dataUrl ? (
                dataUrl.startsWith("data:image/svg+xml,") && svgContent ? (
                  <div
                    className="w-full h-full p-1"
                    style={{ boxSizing: "border-box" }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "auto",
                      }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  </div>
                ) : dataUrl.startsWith("data:image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dataUrl}
                    alt="displacement"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div className="text-xs text-white/60 p-2">{dataUrl}</div>
                )
              ) : (
                <div className="text-xs text-white/50">Not generated yet</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-white/70 mb-2">Distortion demo</div>
            <div
              className="w-full h-32 rounded overflow-hidden"
              style={{ background: "linear-gradient(135deg,#1f2937,#4b5563)" }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="rounded w-11/12 h-3/4"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
                    backdropFilter: filterId ? `url(#${filterId})` : undefined,
                    WebkitBackdropFilter: filterId
                      ? `url(#${filterId})`
                      : undefined,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
