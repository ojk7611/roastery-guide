export default function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value);
  const textSize = size === "md" ? "text-base" : "text-xs";

  return (
    <span
      className={`inline-flex text-amber-500 ${textSize}`}
      aria-label={`별점 5점 만점에 ${value}점`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < rounded ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
