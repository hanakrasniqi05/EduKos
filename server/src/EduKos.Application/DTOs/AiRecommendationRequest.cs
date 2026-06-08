using System.Collections.Generic;

namespace EduKos.Application.DTOs;

public class AiRecommendationRequest
{
    public List<AiInstitutionDto> Institutions { get; set; } = new();
    public AiPreferencesDto Preferences { get; set; } = new();
}