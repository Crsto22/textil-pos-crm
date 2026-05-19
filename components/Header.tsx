"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";

import { navSections } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  clearSession,
  getStoredSession,
  type CrmSession,
} from "@/lib/auth/session";

interface HeaderProps {
  onMenuToggle: () => void;
  showMenuButton?: boolean;
}

const pageTitles: Record<string, string> = {
  "/chat": "Chat",
  "/conexion": "Conexion",
  "/contacto": "Contacto",
  "/configuracion": "Configuracion",
  "/reportes": "Reportes",
};

export function Header({ onMenuToggle, showMenuButton = true }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [session] = useState<CrmSession | null>(() => getStoredSession());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const modalFilteredSections = useMemo(
    () =>
      navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            if (!searchQuery.trim()) return true;

            const query = searchQuery.toLowerCase();
            return (
              item.label.toLowerCase().includes(query) ||
              item.href.toLowerCase().includes(query) ||
              section.subtitle.toLowerCase().includes(query)
            );
          }),
        }))
        .filter((section) => section.items.length > 0),
    [searchQuery],
  );

  const totalModules = navSections.flatMap((section) => section.items).length;
  const title = pageTitles[pathname] ?? "Panel";
  const sectionLabel = pathname.startsWith("/reportes") ? "Reportes" : "CRM";

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleLogout = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[oklch(0.13_0_0/.95)]">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
                aria-label="Abrir menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            )}

            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-widest text-blue-600 sm:inline-flex dark:bg-blue-500/10 dark:text-blue-400">
                {sectionLabel}
              </span>
              <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-white/10" />
              <h1 className="truncate text-[15px] font-semibold text-slate-900 dark:text-white">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-600 lg:flex dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-slate-300"
            >
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
              <span className="w-64 text-left text-xs">Buscar modulo...</span>
              <span className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-medium text-slate-400 dark:border-white/10 dark:bg-white/5">
                Ctrl K
              </span>
            </button>

            <ThemeToggle
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            />

            <span className="mx-0.5 hidden h-5 w-px bg-slate-200 sm:block dark:bg-white/10" />

            <div className="hidden min-w-0 max-w-[160px] text-right leading-none sm:block">
              <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                {session?.name ?? "Usuario CRM"}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-blue-600 dark:text-blue-400">
                {session?.email ?? "Sesion activa"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
              aria-label="Cerrar sesion"
              title="Cerrar sesion"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-20">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeSearch}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-700/60">
              <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar modulo o pagina..."
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {modalFilteredSections.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Sin resultados para &quot;{searchQuery}&quot;
                </p>
              ) : (
                modalFilteredSections.map((section) => (
                  <div key={section.subtitle} className="mb-1">
                    <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {section.subtitle}
                    </p>
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== "/chat" && pathname.startsWith(`${item.href}/`));
                      const Icon = active ? item.iconActive : item.icon;

                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            closeSearch();
                            router.push(item.href);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                            active
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              active ? "text-blue-500 dark:text-blue-400" : "text-slate-400"
                            }`}
                          />
                          <span className="flex-1 text-left">{item.label}</span>
                          {active && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                              Activo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-700/60 dark:text-slate-500">
              {totalModules} modulos disponibles - Ctrl K para abrir/cerrar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
