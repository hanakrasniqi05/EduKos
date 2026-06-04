using EduKos.API.Services.DataManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/data-management")]
[Authorize(Roles = "Admin")]
public class DataManagementController(IDataManagementService dataManagementService) : ControllerBase
{
    [HttpGet("export/{entity}")]
    public async Task<IActionResult> Export(string entity, [FromQuery] string format, CancellationToken cancellationToken)
    {
        var result = await dataManagementService.ExportAsync(entity, format, cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }

    [HttpPost("import/{entity}")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Import(string entity, [FromQuery] string format, IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
            return BadRequest(new { message = "File is required." });

        var result = await dataManagementService.ImportAsync(entity, format, file, cancellationToken);
        return Ok(result);
    }
}
