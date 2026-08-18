"use client";

import { useState } from "react";

export default function StarRatingInput() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const shown = hovered || rating;

  return (
    <div>
      <input type="hidden" name="rating" value={rating || ""} />
      <div
        className="flex gap-1 text-2xl text-amber-500"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}점`}
            aria-pressed={rating === n}
            onMouseEnter={() => setHovered(n)}
            onClick={() => setRating(rating === n ? 0 : n)}
            className="leading-none transition-transform hover:scale-110"
          >
            {n <= shown ? "★" : "☆"}
          </button>
        ))}
      </div>
    </div>
  );
}
