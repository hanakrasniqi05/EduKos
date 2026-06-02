using EduKos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduKos.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260602182000_AddApplicationDocumentFile")]
    partial class AddApplicationDocumentFile
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "10.0.6");
#pragma warning restore 612, 618
        }
    }
}
