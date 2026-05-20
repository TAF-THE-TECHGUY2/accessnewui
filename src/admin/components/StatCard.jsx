import { ArrowDownRight, ArrowUpRight } from "lucide-react";

function StatCard({ label, value, hint, delta, deltaDirection = "up", icon: Icon }) {
  return (
    <article className="admin-card min-h-[150px] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="metric-kicker text-[11px]">{label}</p>

          <p className="mt-2 text-[24px] font-semibold leading-none tracking-tight text-ink">
            {value}
          </p>

          {hint ? (
            <p className="mt-3 max-w-[170px] text-xs leading-4 text-gray-500">
              {hint}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef5f4] text-teal-600">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      {delta ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#f7f4ee] px-2.5 py-1 text-[11px] font-medium leading-none">
          {deltaDirection === "up" ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
          )}

          <span
            className={
              deltaDirection === "up" ? "text-emerald-700" : "text-rose-600"
            }
          >
            {delta}
          </span>
        </div>
      ) : null}
    </article>
  );
}

export default StatCard;