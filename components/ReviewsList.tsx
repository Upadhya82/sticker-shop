type Review = {
  id: string;
  customer_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  const full = "★".repeat(Math.max(0, Math.min(5, rating)));
  const empty = "☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, rating))));
  return (
    <span className="text-yellow-400">
      {full}
      <span className="text-gray-600">{empty}</span>
    </span>
  );
}

export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (!reviews?.length) {
    return <p className="text-sm text-gray-400">No reviews yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-lg border border-gray-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">
              {r.customer_name?.trim() ? r.customer_name : "Anonymous"}
            </div>
            <div className="text-sm">
              <Stars rating={r.rating} />
            </div>
          </div>

          {r.comment && (
            <p className="mt-2 text-sm text-gray-300">{r.comment}</p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            {new Date(r.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}