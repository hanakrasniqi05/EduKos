namespace EduKos.Application.DTOs;

public class AiRecommendationResponse
{
    public string BestOption { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public int Score { get; set; }
    public List<string> Pros { get; set; } = new();
    public List<string> Cons { get; set; } = new();
}