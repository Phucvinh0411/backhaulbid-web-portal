"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Syncs native DOM `input` and `change` events into React state so programmatic
 * autofill or DevTools `fill` updates controlled MUI inputs even if React's value tracker skips `onChange`.
 */
export function useNativeInputSync(onValue) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node) return undefined;
    const sync = () => onValue(node.value);
    node.addEventListener("input", sync);
    node.addEventListener("change", sync);
    return () => {
      node.removeEventListener("input", sync);
      node.removeEventListener("change", sync);
    };
  }, [node, onValue]);

  return useCallback((element) => {
    setNode(element);
  }, []);
}
