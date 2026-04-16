namespace EduKos.Application.Persistence;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email);

    Task<string?> GetUserIdByEmailAsync(string email);

    Task<bool> IsInRoleAsync(string userId, string role);
}