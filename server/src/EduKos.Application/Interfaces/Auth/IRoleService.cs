namespace EduKos.Application.Interfaces.Auth;

public interface IRoleService
{
    Task AssignRoleAsync(string userId, string role);

    Task<IList<string>> GetUserRolesAsync(string userId);

    Task<bool> RoleExistsAsync(string role);

    Task CreateRoleAsync(string role);
}