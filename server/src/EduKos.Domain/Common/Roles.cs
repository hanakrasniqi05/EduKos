namespace EduKos.Domain.Common;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Instructor = "Instructor";
    public const string Student = "Student";

    public const string InstructorOrAdmin = $"{Instructor},{Admin}";
}