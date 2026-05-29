using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduKos.Infrastructure.Migrations
{
    public partial class AddLanguageAndOwnershipToInstitution : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Institutions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstitutionOwnership",
                table: "Institutions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Language",
                table: "Institutions");

            migrationBuilder.DropColumn(
                name: "InstitutionOwnership",
                table: "Institutions");
        }
    }
}