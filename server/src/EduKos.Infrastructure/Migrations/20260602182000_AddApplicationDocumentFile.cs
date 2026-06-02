using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduKos.Infrastructure.Migrations
{
    public partial class AddApplicationDocumentFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocumentFileId",
                table: "Applications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_DocumentFileId",
                table: "Applications",
                column: "DocumentFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Files_DocumentFileId",
                table: "Applications",
                column: "DocumentFileId",
                principalTable: "Files",
                principalColumn: "FileId",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Files_DocumentFileId",
                table: "Applications");

            migrationBuilder.DropIndex(
                name: "IX_Applications_DocumentFileId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "DocumentFileId",
                table: "Applications");
        }
    }
}
