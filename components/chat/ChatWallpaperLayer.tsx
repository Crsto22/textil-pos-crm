const chatWallpaperClass =
  "bg-[image:url('/img/fondos/ModoClaro.png')] bg-cover bg-center dark:bg-[image:url('/img/fondos/ModoOscuro.png')]";

export function ChatWallpaperLayer() {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 opacity-10 ${chatWallpaperClass}`}
    />
  );
}
