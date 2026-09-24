import { useState } from "react";
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  ImageOff,
  Maximize2,
  Ruler,
} from "lucide-react";

/**
 * One property owned by the fund.
 *
 * The data is proxied live from the site that manages the portfolio, so every
 * field here is treated as optional: a card with half its attributes missing
 * still has to render, because the alternative is a blank panel whenever the
 * upstream record is incomplete. Absent values print an em dash rather than
 * disappearing, so a gap reads as "not recorded" instead of silently shrinking
 * the card and leaving the investor unsure what they are looking at.
 */

/**
 * Acquisitions show as month and year — the day is noise at this scale, and
 * upstream does not record one.
 *
 * In practice the value arrives already formatted ("8/2023"), which is not a
 * parseable date, so it passes straight through. The parsing branch is there
 * for the day upstream starts sending a real timestamp instead.
 */
function formatAcquired(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : null;
  }

  return `${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
 * Whole numbers get thousands separators; a half bathroom keeps its decimal.
 * Zero is a real answer (a condo with no parking) and must survive.
 */
function formatMeasure(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number") return String(value);

  return Number.isInteger(value) ? value.toLocaleString() : String(value);
}

/**
 * Only "leased" earns the green treatment. Anything else — vacant, under
 * renovation, listed — stays neutral rather than being guessed at, since
 * colouring an unknown status green would overstate the position.
 */
function statusTone(status) {
  return /leased|occupied|rented/i.test(status ?? "")
    ? "bg-[#ecfdf3] text-[#067647]"
    : "bg-[#f3f4f6] text-[#4b5563]";
}

/**
 * The six attributes, in the order the reference design prints them. `key` is
 * both the field read off the property and the React key.
 */
const ATTRIBUTES = [
  { key: "type", icon: Building2, label: "Type" },
  { key: "bedrooms", icon: BedDouble, label: "Bedrooms" },
  { key: "bathrooms", icon: Bath, label: "Bathrooms" },
  { key: "parking", icon: Car, label: "Parking" },
  { key: "squareFeet", icon: Ruler, label: "Square Feet" },
  { key: "lotSize", icon: Maximize2, label: "Lot Size" },
];

function Attribute({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-center gap-3 p-3 ${className}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3f4f6]">
        <Icon className="h-4 w-4 text-[#6b7280]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] leading-tight text-[#6b7280]">{label}</div>
        <div className="truncate text-[14px] font-semibold text-[#111111]">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function PropertyCard({ property }) {
  const [imageFailed, setImageFailed] = useState(false);

  const acquired = formatAcquired(property.acquiredAt);
  const showPhoto = property.photoUrl && !imageFailed;

  return (
    <article className="overflow-hidden rounded-[12px] border border-black/10 bg-white">
      {(property.strategy || property.status || acquired) && (
        <header className="border-b border-black/10 px-4 py-4 text-center">
          {property.strategy ? (
            <h4 className="text-[15px] font-semibold leading-snug text-[#111111]">
              {property.strategy}
            </h4>
          ) : null}

          {(property.status || acquired) && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {property.status ? (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${statusTone(
                    property.status
                  )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {property.status}
                </span>
              ) : null}

              {acquired ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1 text-[12px] text-[#4b5563]">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  Acquired {acquired}
                </span>
              ) : null}
            </div>
          )}
        </header>
      )}

      {showPhoto ? (
        <img
          src={property.photoUrl}
          // The address is already printed directly beneath every photo, so
          // repeating it here would make a screen reader read it twice.
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        // A hotlinked photo that 404s or is blocked must not leave a collapsed
        // card, so the slot keeps its height either way.
        <div className="grid aspect-[16/10] w-full place-items-center bg-[#f7f5f1]">
          <ImageOff className="h-6 w-6 text-[#9ca3af]" aria-hidden="true" />
          <span className="sr-only">No photo available</span>
        </div>
      )}

      <div className="p-4">
        <h5 className="text-center text-[15px] font-semibold leading-snug text-[#111111]">
          {property.address || "Address not recorded"}
        </h5>

        {/* The dividers are applied per cell from the index rather than with
            an [&>*:nth-child(...)] variant: Tailwind's JIT compiled the
            :nth-child(n+3) rule but silently dropped the :nth-child(even) one,
            which cost the grid its column divider with nothing failing to say
            so. Static class strings always compile. */}
        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[10px] border border-black/10">
          {ATTRIBUTES.map(({ key, icon, label }, i) => (
            <Attribute
              key={key}
              icon={icon}
              label={label}
              value={formatMeasure(property[key])}
              className={`${i % 2 === 1 ? "border-l border-black/10" : ""} ${
                i >= 2 ? "border-t border-black/10" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
