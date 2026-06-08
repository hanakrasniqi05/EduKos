import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getMyInstitutionReview,
  rateInstitution,
  type ReviewDto,
} from "../lib/api";
import { useOptionalAuth } from "../context/authContextState";

type Props = {
  institutionId: number;
  onRated?: (review: ReviewDto) => void;
};

export default function InstitutionRatingForm({
  institutionId,
  onRated,
}: Props) {
  const auth = useOptionalAuth()?.auth ?? null;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!auth?.accessToken) return;

    let ignore = false;

    async function loadExistingReview() {
      try {
        setLoadingExisting(true);
        const existing = await getMyInstitutionReview(institutionId);
        if (ignore) return;

        const existingRating =
          existing.teachingQualityRating ??
          existing.facilitiesRating ??
          existing.staffRating ??
          existing.difficultyRating ??
          0;

        setRating(existingRating);
        setComment(existing.comment ?? "");
      } catch {
        if (!ignore) {
          setRating(0);
          setComment("");
        }
      } finally {
        if (!ignore) setLoadingExisting(false);
      }
    }

    loadExistingReview();

    return () => {
      ignore = true;
    };
  }, [auth?.accessToken, institutionId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!auth?.accessToken) return;

    if (rating < 1 || rating > 5) {
      setError("Zgjidh nje vleresim nga 1 deri ne 5 yje.");
      return;
    }

    setLoading(true);
    try {
      const review = await rateInstitution({
        institutionId,
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess("Vleresimi u ruajt me sukses.");
      onRated?.(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vleresimi nuk u ruajt.");
    } finally {
      setLoading(false);
    }
  }

  if (!auth?.accessToken) {
    return (
      <div className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Kyçu
          </Link>{" "}
          per te vleresuar kete shkolle.
        </p>
      </div>
    );
  }

  const activeRating = hoverRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-emerald-100 bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-950">Vlereso kete shkolle</h3>
      <p className="mt-1 text-sm text-gray-500">
        Vleresimi yt ndihmon studentet e tjere te zgjedhin institucionin e duhur.
      </p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={loading || loadingExisting}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="rounded p-1 text-amber-500 transition hover:scale-110 disabled:opacity-60"
            aria-label={`Vlereso me ${star} yje`}
          >
            <Star
              size={28}
              fill={star <= activeRating ? "currentColor" : "none"}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-600">
          {rating > 0 ? `${rating}/5` : "Zgjidh yjet"}
        </span>
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-700">
        Koment (opsional)
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          disabled={loading || loadingExisting}
          placeholder="Shkruaj pervojen tende me kete shkolle..."
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-700">{success}</p>}

      <button
        type="submit"
        disabled={loading || loadingExisting || rating < 1}
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Duke ruajtur..." : "Ruaj vleresimin"}
      </button>
    </form>
  );
}
