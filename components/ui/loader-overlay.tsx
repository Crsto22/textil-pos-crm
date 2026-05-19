export function LoaderOverlay() {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Cargando...
      </div>
    </div>
  );
}
