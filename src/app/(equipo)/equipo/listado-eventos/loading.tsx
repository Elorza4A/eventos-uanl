export default function LoadingListadoEventos() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando eventos">
      <div>
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-8 w-40 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="h-24 animate-pulse rounded-xl border border-gray-200 bg-white" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="h-11 animate-pulse bg-slate-100" />
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex h-12 items-center gap-4 border-t border-slate-100 px-4"
          >
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
