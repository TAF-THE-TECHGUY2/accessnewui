function ChartCard({ title, subtitle, children, actions }) {
  return (
    <section className="admin-card p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="metric-kicker">{title}</p>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-gray-500">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      <div className="h-[300px] rounded-[18px] bg-[#fcfaf7] p-4">{children}</div>
    </section>
  );
}

export default ChartCard;
