using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JapaneseFlashcardAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id           = table.Column<int>(type: "int", nullable: false)
                                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username     = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email        = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_Users", x => x.Id));

            migrationBuilder.CreateTable(
                name: "Decks",
                columns: table => new
                {
                    Id        = table.Column<int>(type: "int", nullable: false)
                                     .Annotation("SqlServer:Identity", "1, 1"),
                    Title     = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UserId    = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Decks", x => x.Id);
                    table.ForeignKey(
                        name:       "FK_Decks_Users_UserId",
                        column:     x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete:   ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Flashcards",
                columns: table => new
                {
                    Id              = table.Column<int>(type: "int", nullable: false)
                                           .Annotation("SqlServer:Identity", "1, 1"),
                    DeckId          = table.Column<int>(type: "int", nullable: false),
                    Kanji           = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Reading         = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Meaning         = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExampleSentence = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    NextReviewDate  = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Interval        = table.Column<int>(type: "int", nullable: false),
                    EaseFactor      = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flashcards", x => x.Id);
                    table.ForeignKey(
                        name:       "FK_Flashcards_Decks_DeckId",
                        column:     x => x.DeckId,
                        principalTable: "Decks",
                        principalColumn: "Id",
                        onDelete:   ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReviewLogs",
                columns: table => new
                {
                    Id          = table.Column<int>(type: "int", nullable: false)
                                       .Annotation("SqlServer:Identity", "1, 1"),
                    FlashcardId = table.Column<int>(type: "int", nullable: false),
                    UserId      = table.Column<int>(type: "int", nullable: false),
                    Rating      = table.Column<int>(type: "int", nullable: false),
                    ReviewedAt  = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewLogs", x => x.Id);
                    table.ForeignKey(
                        name:       "FK_ReviewLogs_Flashcards_FlashcardId",
                        column:     x => x.FlashcardId,
                        principalTable: "Flashcards",
                        principalColumn: "Id",
                        onDelete:   ReferentialAction.Cascade);
                    table.ForeignKey(
                        name:       "FK_ReviewLogs_Users_UserId",
                        column:     x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete:   ReferentialAction.NoAction);
                });

            // ── Indexes ──────────────────────────────────────────────────────
            migrationBuilder.CreateIndex("IX_Users_Email",        "Users",      "Email",        unique: true);
            migrationBuilder.CreateIndex("IX_Users_Username",     "Users",      "Username",     unique: true);
            migrationBuilder.CreateIndex("IX_Decks_UserId",       "Decks",      "UserId");
            migrationBuilder.CreateIndex("IX_Flashcards_DeckId",  "Flashcards", "DeckId");
            migrationBuilder.CreateIndex("IX_ReviewLogs_FlashcardId_ReviewedAt",
                table:   "ReviewLogs",
                columns: new[] { "FlashcardId", "ReviewedAt" });
            migrationBuilder.CreateIndex("IX_ReviewLogs_UserId",  "ReviewLogs", "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable("ReviewLogs");
            migrationBuilder.DropTable("Flashcards");
            migrationBuilder.DropTable("Decks");
            migrationBuilder.DropTable("Users");
        }
    }
}
