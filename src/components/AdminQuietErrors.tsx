"use client";

import { useEffect } from "react";
import { silenceNextFilePickerRefresh } from "@/src/utils/silence-next-file-picker";

function hideNextJsonOverlay() {
  const portals = document.querySelectorAll("nextjs-portal, [data-nextjs-dialog], [data-nextjs-toast]");
  portals.forEach((node) => {
    const text = node.textContent ?? "";
    if (/Failed to execute 'json' on 'Response'|Unexpected end of JSON input/i.test(text)) {
      node.remove();
    }
  });
}

/** Stops Next.js from treating a file-dialog blur as a fatal RSC JSON error. */
export function AdminQuietErrors() {
  useEffect(() => {
    const restore = silenceNextFilePickerRefresh(60 * 60 * 1000);
    const observer = new MutationObserver(hideNextJsonOverlay);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    hideNextJsonOverlay();
    return () => {
      restore();
      observer.disconnect();
    };
  }, []);
  return null;
}
