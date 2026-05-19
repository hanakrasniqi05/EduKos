namespace EduKos.Domain.Constants;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Nxenes = "Nxenes";
    public const string Shkolla = "Shkolla";

    public static readonly IReadOnlyList<string> AllRoles = new[]
    {
        Admin,
        Nxenes,
        Shkolla
    };
}
