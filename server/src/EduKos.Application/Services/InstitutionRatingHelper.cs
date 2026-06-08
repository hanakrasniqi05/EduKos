using EduKos.Domain.Entities;

namespace EduKos.Application.Services;

public static class InstitutionRatingHelper
{
    public static double? GetReviewScore(Review review)
    {
        var values = new[]
        {
            review.TeachingQualityRating,
            review.FacilitiesRating,
            review.DifficultyRating,
            review.StaffRating,
        }.Where(value => value.HasValue).Select(value => (double)value!.Value).ToList();

        return values.Count == 0 ? null : values.Average();
    }

    public static double? GetAverageRating(IEnumerable<Review> reviews)
    {
        var scores = reviews
            .Select(GetReviewScore)
            .Where(score => score.HasValue)
            .Select(score => score!.Value)
            .ToList();

        return scores.Count == 0 ? null : scores.Average();
    }

    public static int GetReviewCount(IEnumerable<Review> reviews) =>
        reviews.Count(review => GetReviewScore(review).HasValue);
}
