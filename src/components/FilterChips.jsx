import { getPinColor } from "../lib/helpers";

const FILTERS = [
  { key: "all",                       label: "Todos"       },
  { key: "open",                      label: "Abierto"     },
  { key: "in_progress",               label: "En progreso" },
  { key: "closed_pending_validation", label: "Pendiente"   },
  { key: "validated",                 label: "Validado"    },
  { key: "closed",                    label: "Cerrado"     },
];

export default function FilterChips({
  activeFilter,
  onFilterChange,
  statusCounts,
  totalCount,
}) {
  return (
    <div className="absolute top-3 left-0 right-0 z-10 px-2 sm:px-3 pointer-events-none">
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pointer-events-auto pb-1">
        {FILTERS.map((f) => {
          const count =
            f.key === "all" ? totalCount : (statusCounts[f.key] ?? 0);
          const isActive = activeFilter === f.key;
          const dotColor =
            f.key === "all" ? "#1F2937" : getPinColor(f.key);

          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex-shrink-0 flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 pr-2 sm:pr-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all min-h-[44px] sm:min-h-auto ${
                isActive
                  ? "bg-gray-900 text-white scale-105"
                  : "bg-white/95 text-gray-700 hover:bg-gray-50 active:scale-95"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: dotColor }}
              />
              <span className="hidden sm:inline">{f.label}</span>
              <span className="sm:hidden text-xs">{f.label.charAt(0)}</span>
              <span
                className={`font-normal text-xs ${
                  isActive ? "text-gray-400" : "text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
