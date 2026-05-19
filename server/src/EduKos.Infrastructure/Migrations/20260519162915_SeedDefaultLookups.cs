using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EduKos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedDefaultLookups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "InstitutionTypes",
                columns: new[] { "InstitutionTypeId", "Name" },
                values: new object[,]
                {
                    { 1, "Cerdhe" },
                    { 2, "Shkolla fillore" },
                    { 3, "Shkolla e mesme" },
                    { 4, "Fakultete" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "RoleId", "Name" },
                values: new object[,]
                {
                    { 1, "User" },
                    { 2, "Institution" },
                    { 3, "Admin" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "InstitutionTypes",
                keyColumn: "InstitutionTypeId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "InstitutionTypes",
                keyColumn: "InstitutionTypeId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "InstitutionTypes",
                keyColumn: "InstitutionTypeId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "InstitutionTypes",
                keyColumn: "InstitutionTypeId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "RoleId",
                keyValue: 3);
        }
    }
}
