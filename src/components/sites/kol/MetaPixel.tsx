"use client";

import { useEffect } from "react";
import { initMetaPixel, trackStay15s } from "./pixel";

/**
 * Meta Pixel mount point. Base pixel code + PageView fire once on first load;
 * Stay15s is measured per full page load.
 */
export function MetaPixel() {
  useEffect(() => {
    initMetaPixel();
    trackStay15s();
  }, []);

  return null;
}
