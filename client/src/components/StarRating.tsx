import { Star } from "lucide-react";

type Props = {
  value?: number | null;
  count?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
};

export default function StarRating({
  value,
  count,
  size = 16,
  showValue = true,
  className = "",
}: Props) {
  if (value == null || value <= 0) {
    return (
      <span className={`text-sm text-gray-400 ${className}`}>
        Pa vleresime
      </span>
    );
  }

  const rounded = Math.round(value);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rounded ? "currentColor" : "none"}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700">
          {value.toFixed(1)}
          {typeof count === "number" ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
