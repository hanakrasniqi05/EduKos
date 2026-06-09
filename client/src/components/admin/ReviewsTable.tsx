import type { InstitutionDto, ReviewDto } from "../../lib/api";
import { dangerButton } from "./adminStyles";

export default function ReviewsTable({
  reviews,
  institutions,
  onDelete,
}: {
  reviews: ReviewDto[];
  institutions: InstitutionDto[];
  onDelete: (id: number) => Promise<void>;
}) {
  if (!reviews.length) return <p className="text-gray-500">Nuk ka vleresime.</p>;

  const institutionName = (id: number) =>
    institutions.find((item) => item.institutionId === id)?.name ?? `#${id}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="py-2 pr-4">Institucioni</th>
            <th className="py-2 pr-4">Perdoruesi</th>
            <th className="py-2 pr-4">Vleresimet</th>
            <th className="py-2 pr-4">Komenti</th>
            <th className="py-2">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.reviewId} className="border-b border-gray-50">
              <td className="py-2 pr-4">{institutionName(review.institutionId)}</td>
              <td className="py-2 pr-4">#{review.userId}</td>
              <td className="py-2 pr-4 text-xs text-gray-600">
                M: {review.teachingQualityRating ?? "—"} | F: {review.facilitiesRating ?? "—"} | S: {review.staffRating ?? "—"}
              </td>
              <td className="max-w-xs truncate py-2 pr-4">{review.comment || "—"}</td>
              <td className="py-2">
                <button className={dangerButton} onClick={() => { if (confirm("Fshi vleresimin?")) void onDelete(review.reviewId); }}>
                  Fshi
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
