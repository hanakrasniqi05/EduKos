using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduKos.Application.DTOs;
using EduKos.Application.Services;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/ai-recommendation")]
[AllowAnonymous]
public class AiRecommendationController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly InstitutionScoringService _scoringService;

    public AiRecommendationController(
        IConfiguration configuration,
        InstitutionScoringService scoringService)
    {
        _configuration = configuration;
        _httpClient = new HttpClient();
        _scoringService = scoringService;
    }

    [HttpPost("best-match")]
    public async Task<IActionResult> GetBestMatch([FromBody] AiRecommendationRequest request)
    {
        if (request.Institutions.Count < 2)
            return BadRequest("Zgjedh të paktën 2 institucione.");

        var apiKey = _configuration["OpenAI:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            return BadRequest("OpenAI API key mungon në appsettings.json.");
        var rankedInstitutions = request.Institutions
            .Select(i => new
            {
                Institution = i,
                Score = _scoringService.CalculateScore(i, request.Preferences)
            })
            .OrderByDescending(x => x.Score)
            .ToList();

        var best = rankedInstitutions.First();

        var aiInput = new
        {
            rankedInstitutions = rankedInstitutions.Select(r => new
            {
                name = r.Institution.Name,
                city = r.Institution.City,
                description = r.Institution.Description,
                score = r.Score
            }),
            preferences = request.Preferences
        };

        var prompt = $@"
            Ti je një asistent shpjegues për platformën EduKos.

            Detyra jote:
            - MOS ndrysho renditjen.
            - MOS zgjedh institucion tjetër.
            - Vetëm shpjego pse institucioni i parë është më i miri.

            Institucioni më i mirë (i zgjedhur nga sistemi):
            {JsonSerializer.Serialize(best)}

            Lista e renditur:
            {JsonSerializer.Serialize(aiInput.rankedInstitutions)}

            Preferencat e përdoruesit:
            {JsonSerializer.Serialize(request.Preferences)}

            Kthe vetëm JSON valid:

            {{
            ""bestOption"": ""emri i institucionit"",
            ""reason"": ""arsye e qartë pse është më i miri"",
            ""score"": 0,
            ""pros"": [""përparësi 1"", ""përparësi 2""],
            ""cons"": [""mungesa ose kufizime""]
            }}
            ";

        var body = new
        {
            model = "gpt-4o-mini",
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = prompt
                }
            },
            response_format = new
            {
                type = "json_object"
            }
        };

        var jsonBody = JsonSerializer.Serialize(body);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        var response = await _httpClient.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            content
        );

        var result = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, result);

        using var doc = JsonDocument.Parse(result);

        var aiContent = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(aiContent))
            return BadRequest("OpenAI nuk ktheu përgjigje.");

        var parsedResponse = JsonSerializer.Deserialize<AiRecommendationResponse>(
            aiContent,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        );

        if (parsedResponse == null)
        {
            return BadRequest("AI response could not be parsed.");
        }

        return Ok(parsedResponse);

        return Ok(parsedResponse);
    }
}