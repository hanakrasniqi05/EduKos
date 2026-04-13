using EduKos.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace LMS.Domain.Entities.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}