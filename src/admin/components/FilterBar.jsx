import { ListFilter, Search, X } from "lucide-react";

function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchDisabled = false,
  filters = [],
  onClear,
  actions,
}) {
  return (
    <section className="admin-card p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.2fr)_repeat(4,minmax(170px,1fr))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="admin-input pl-11"
              placeholder={searchPlaceholder}
              disabled={searchDisabled}
            />
          </label>

          {filters.map((filter) => (
            <label key={filter.name} className="relative block">
              <span className="sr-only">{filter.label}</span>
              <ListFilter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="admin-select pl-11"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <button type="button" className="admin-button-secondary" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
