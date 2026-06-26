export type ScrollToHomeDestinationOptions = {
  duration?: number;
  updateHash?: boolean;
  defer?: boolean;
};

export function scrollToHomeDestination(
  destinationRoute: string,
  options: ScrollToHomeDestinationOptions = {},
) {
  if (typeof window === "undefined") return;

  if (options.updateHash) {
    window.history.replaceState(null, "", destinationRoute);
  }

  window.location.assign(destinationRoute);
}
