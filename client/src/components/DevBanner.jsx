export function DevBanner() {
  if (!import.meta.env.DEV) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/80 dark:text-amber-100">
      Development server — data and auth are for local testing only.
    </div>
  );
}
