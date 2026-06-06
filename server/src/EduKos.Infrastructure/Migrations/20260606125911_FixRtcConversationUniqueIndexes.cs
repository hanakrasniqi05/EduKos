using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduKos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixRtcConversationUniqueIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Conversations_Type_StudentUserId_InstitutionId_AdminUserId",
                table: "Conversations");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_Type_InstitutionId_AdminUserId",
                table: "Conversations",
                columns: new[] { "Type", "InstitutionId", "AdminUserId" },
                unique: true,
                filter: "[Type] = 'institution_admin' AND [AdminUserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_Type_StudentUserId_InstitutionId",
                table: "Conversations",
                columns: new[] { "Type", "StudentUserId", "InstitutionId" },
                unique: true,
                filter: "[Type] = 'student_institution' AND [StudentUserId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Conversations_Type_InstitutionId_AdminUserId",
                table: "Conversations");

            migrationBuilder.DropIndex(
                name: "IX_Conversations_Type_StudentUserId_InstitutionId",
                table: "Conversations");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_Type_StudentUserId_InstitutionId_AdminUserId",
                table: "Conversations",
                columns: new[] { "Type", "StudentUserId", "InstitutionId", "AdminUserId" },
                unique: true,
                filter: "[StudentUserId] IS NOT NULL AND [AdminUserId] IS NOT NULL");
        }
    }
}
