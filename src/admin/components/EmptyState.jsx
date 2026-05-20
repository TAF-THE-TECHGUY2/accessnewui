function EmptyState({ title = "Nothing to show yet", description = "Try adjusting your filters." }) {
  return (
    <div className="admin-card flex min-h-[240px] flex-col items-center justify-center px-8 py-14 text-center">
      <div className="rounded-full bg-[#f3ede4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">
        Empty state
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-ink">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

export default EmptyState;
