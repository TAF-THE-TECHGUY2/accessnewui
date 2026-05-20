import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

function ActionMenu({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="rounded-[14px] bg-[#faf6f1] p-2.5 text-slate-500 transition duration-200 hover:bg-[#f2ebe3] hover:text-teal-800"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-20 min-w-[190px] rounded-[18px] bg-white p-2 shadow-card">
          {actions.map((action) => {
            const content = (
              <>
                {action.icon ? <action.icon className="h-4 w-4" /> : null}
                <span>{action.label}</span>
              </>
            );

            const className = `flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-left text-sm transition duration-200 ${
              action.tone === "danger"
                ? "text-rose-600 hover:bg-rose-50"
                : "text-slate-700 hover:bg-[#f7f3ee]"
            }`;

            if (action.to) {
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                className={className}
                onClick={() => {
                  setOpen(false);
                  action.onSelect?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default ActionMenu;
