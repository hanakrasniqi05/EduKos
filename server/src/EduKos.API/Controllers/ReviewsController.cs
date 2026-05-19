using System.Security.Claims;
using EduKos.Application.DTOs.Education;
using EduKos.Domain.Entities;
using EduKos.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController(AppDbContext context) : CrudControllerBase<Review, ReviewDto>(context)
{
    protected override DbSet<Review> Set => Context.Reviews;
    protected override int GetId(Review entity) => entity.ReviewId;
    protected override void SetId(Review entity, int id) => entity.ReviewId = id;

    [HttpPost]
    [Authorize(Roles = "Admin,Nxenes,Shkolla")]
    public override async Task<ActionResult<ReviewDto>> Create([FromBody] ReviewDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var review = new Review
        {
            UserId = userId,
            InstitutionId = dto.InstitutionId,
            TeachingQualityRating = dto.TeachingQualityRating,
            FacilitiesRating = dto.FacilitiesRating,
            DifficultyRating = dto.DifficultyRating,
            StaffRating = dto.StaffRating,
            Comment = dto.Comment
        };

        await Context.Reviews.AddAsync(review, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = review.ReviewId }, MapToDto(review));
    }

    private int GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var userId) ? userId : throw new UnauthorizedAccessException("Invalid user.");
    }
}
