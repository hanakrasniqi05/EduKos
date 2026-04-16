namespace EduKos.Domain.Constants;

public static class AppRoles
{
    public const string User = "User";
    public const string Institution = "Institution";
    public const string Admin = "Admin";

    public static readonly IReadOnlyList<string> AllRoles = new[]
    {
        User,
        Institution,
        Admin
    };
}