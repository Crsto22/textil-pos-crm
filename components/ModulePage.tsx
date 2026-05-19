interface ModulePageProps {
  title: string;
  description: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  items: string[];
}

export function ModulePage({
  title,
  description,
  metrics,
  items,
}: ModulePageProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          Kiments CRM
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              {metric.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              {metric.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/[0.08]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Actividad reciente
            </h3>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              En vivo
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.08]">
            {items.map((item) => (
              <div key={item} className="flex items-center gap-3 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <p className="text-sm text-slate-600 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-white/[0.08]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
            Estado
          </p>
          <p className="mt-4 text-3xl font-semibold">Operativo</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Base visual lista para conectar servicios reales del CRM.
          </p>
        </div>
      </div>
    </section>
  );
}
