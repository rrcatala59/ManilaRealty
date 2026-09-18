/** Next App Router refetches RSC when the window focuses after a file dialog. That fetch often has an empty body and throws json() in the overlay. */
export function silenceNextFilePickerRefresh(durationMs = 12000) {
  const isNoisyJson = (value: unknown) => {
    const message = value instanceof Error ? value.message : String(value ?? "");
    return /Failed to execute 'json' on 'Response'|Unexpected end of JSON input/i.test(message);
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    if (isNoisyJson(event.reason)) event.preventDefault();
  };
  const onError = (event: ErrorEvent) => {
    if (isNoisyJson(event.error) || isNoisyJson(event.message)) {
      event.preventDefault();
    }
  };
  const stopFocusRefresh = (event: Event) => event.stopImmediatePropagation();

  window.addEventListener("unhandledrejection", onRejection);
  window.addEventListener("error", onError);
  window.addEventListener("focus", stopFocusRefresh, true);
  document.addEventListener("visibilitychange", stopFocusRefresh, true);

  const timer = window.setTimeout(restore, durationMs);

  function restore() {
    window.clearTimeout(timer);
    window.removeEventListener("unhandledrejection", onRejection);
    window.removeEventListener("error", onError);
    window.removeEventListener("focus", stopFocusRefresh, true);
    document.removeEventListener("visibilitychange", stopFocusRefresh, true);
  }

  return restore;
}
