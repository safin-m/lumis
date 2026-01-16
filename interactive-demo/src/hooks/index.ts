/**
 * Custom React Hooks
 *
 * This module contains reusable custom React hooks for common patterns
 * used throughout the application.
 */

import { useCallback, useRef } from "react";

/**
 * Custom hook for debouncing function calls
 * Delays the execution of a function until after a specified delay period
 * has elapsed since the last time it was invoked.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the callback function
 *
 * @example
 * const debouncedSearch = useDebounce((query) => {
 *   performSearch(query);
 * }, 300);
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFunction as T;
}

/**
 * Custom hook for handling drag functionality
 * Provides mouse and touch event handlers for dragging elements
 *
 * @param onDragMove - Callback function called during drag with delta x and y
 * @param onDragStart - Optional callback when drag starts
 * @param onDragEnd - Optional callback when drag ends
 * @returns Object with event handlers for mouse and touch events
 */
export function useDrag(
  onDragMove: (deltaX: number, deltaY: number) => void,
  onDragStart?: () => void,
  onDragEnd?: () => void
) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      startPosRef.current = { x: clientX, y: clientY };
      onDragStart?.();
    },
    [onDragStart]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;

      const deltaX = clientX - startPosRef.current.x;
      const deltaY = clientY - startPosRef.current.y;
      startPosRef.current = { x: clientX, y: clientY };

      onDragMove(deltaX, deltaY);
    },
    [onDragMove]
  );

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    onDragEnd?.();
  }, [onDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX, e.clientY);

      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        handleEnd();
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [handleStart, handleMove, handleEnd]
  );

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleTouchEnd = () => {
        handleEnd();
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };

      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    },
    [handleStart, handleMove, handleEnd]
  );

  return {
    handleMouseDown,
    handleTouchStart,
    isDragging: isDraggingRef.current,
  };
}
