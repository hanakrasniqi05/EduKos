using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/ai-recommendation")]
[AllowAnonymous]
public class AiRecommendationController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public AiRecommendationController(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient = new HttpClient();
    }

    [HttpPost("best-match")]
    public async Task<IActionResult> GetBestMatch([FromBody] AiRecommendationRequest request)
    {
        if (request.Institutions.Count < 2)
            return BadRequest("Zgjedh të paktën 2 institucione.");

        var apiKey = _configuration["OpenAI:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            return BadRequest("OpenAI API key mungon në appsettings.json.");

        var prompt = $@"
Ti je asistent edukimi për platformën EduKos.

Detyra jote është të rekomandosh institucionin më të përshtatshëm nga lista që përdoruesi ka zgjedhur për krahasim.

Rregulla:
- Përgjigju vetëm në shqip.
- Mos shpik të dhëna.
- Bazohu vetëm në informacionet e dhëna.
- Nëse disa të dhëna mungojnë, përmende këtë në arsye.
- Kthe vetëm JSON valid.

Preferencat e përdoruesit:
{JsonSerializer.Serialize(request.Preferences)}

Institucionet:
{JsonSerializer.Serialize(request.Institutions)}

Formati i përgjigjes:
{{
  ""bestOption"": ""emri i institucionit"",
  ""reason"": ""arsyeja kryesore pse ky institucion është më i përshtatshmi"",
  ""score"": 85,
  ""pros"": [""përparësi 1"", ""përparësi 2""],
  ""cons"": [""mangësi ose e dhënë që mungon""]
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

        var parsedResponse = JsonSerializer.Deserialize<object>(aiContent);

        return Ok(parsedResponse);
    }
}

public class AiRecommendationRequest
{
    public List<AiInstitutionDto> Institutions { get; set; } = new();
    public AiPreferencesDto Preferences { get; set; } = new();
}

public class AiInstitutionDto
{
    public string? Name { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Description { get; set; }
    public string? InstitutionTypeName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
}

public class AiPreferencesDto
{
    public string? City { get; set; }
    public string? Budget { get; set; }
    public string? Priority { get; set; }
    public string? Interests { get; set; }
}