using Microsoft.AspNetCore.Identity;

namespace EduKos.Infrastructure.Identity;

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
}