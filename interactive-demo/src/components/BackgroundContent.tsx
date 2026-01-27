/**
 * BackgroundContent Component
 *
 * Displays lorem ipsum text over the background when enabled.
 * Used for demonstrating the glass effect with text content underneath.
 */

import { LOREM_IPSUM_PARAGRAPHS } from "@/constants";

interface BackgroundContentProps {
  /** Whether to show the lorem ipsum content */
  show: boolean;
  /** Color for the text in "R, G, B, A" format */
  color: string;
  /** Font size in pixels */
  fontSize: number;
  /** Number of paragraphs to display */
  paragraphCount: number;
}

/**
 * BackgroundContent displays formatted lorem ipsum paragraphs
 * as background content for the glass effect demo
 */
export function BackgroundContent({
  show,
  color,
  fontSize,
  paragraphCount,
}: BackgroundContentProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div
        className="max-w-4xl leading-relaxed"
        style={{
          color: `rgba(${color})`,
          fontSize: `${fontSize}px`,
        }}
      >
        {Array.from({ length: paragraphCount }, (_, i) => (
          <p key={i} className="mb-4">
            {LOREM_IPSUM_PARAGRAPHS[i % LOREM_IPSUM_PARAGRAPHS.length]}
          </p>
        ))}
      </div>
    </div>
  );
}
