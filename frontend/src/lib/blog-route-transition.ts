const LOCK_CLASS = "blog-route-transition-lock";

export function lockBlogRouteScroll() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(LOCK_CLASS);
  document.body.classList.add(LOCK_CLASS);
}

export function unlockBlogRouteScroll() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(LOCK_CLASS);
  document.body.classList.remove(LOCK_CLASS);
}
