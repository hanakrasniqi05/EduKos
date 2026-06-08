using EduKos.Application.DTOs;
namespace EduKos.Application.Services;

public class InstitutionScoringService
{
    public int CalculateScore(AiInstitutionDto institution, AiPreferencesDto preferences)
    {
        int score = 0;

        if (!string.IsNullOrEmpty(preferences.City) &&
            institution.City?.ToLower() == preferences.City.ToLower())
        {
            score += 30;
        }

        if (!string.IsNullOrEmpty(preferences.Interests) &&
            !string.IsNullOrEmpty(institution.Description))
        {
            var interests = preferences.Interests.ToLower().Split(' ');
            var description = institution.Description.ToLower();

            foreach (var interest in interests)
            {
                if (description.Contains(interest))
                    score += 5;
            }
        }

        switch (preferences.Priority?.ToLower())
        {
            case "rating":
                score += 20;
                break;

            case "location":
                score += 15;
                break;

            case "price":
                score += 10;
                break;

            case "programs":
                score += 15;
                break;

            case "facilities":
                score += 10;
                break;
        }

        if (!string.IsNullOrEmpty(institution.Description)) score += 5;
        if (!string.IsNullOrEmpty(institution.Website)) score += 5;

        return score;
    }
}