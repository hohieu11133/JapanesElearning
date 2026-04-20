using JapaneseFlashcardAPI.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JapaneseFlashcardAPI.Infrastructure.Data;

/// <summary>
/// EF Core DbContext — Code-First, SQL Server.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User>      Users       => Set<User>();
    public DbSet<Deck>      Decks       => Set<Deck>();
    public DbSet<Flashcard> Flashcards  => Set<Flashcard>();
    public DbSet<ReviewLog> ReviewLogs  => Set<ReviewLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // ── Deck ────────────────────────────────────────────────────
        modelBuilder.Entity<Deck>(entity =>
        {
            entity.HasOne(d => d.User)
                  .WithMany(u => u.Decks)
                  .HasForeignKey(d => d.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Flashcard ───────────────────────────────────────────────
        modelBuilder.Entity<Flashcard>(entity =>
        {
            entity.HasOne(f => f.Deck)
                  .WithMany(d => d.Flashcards)
                  .HasForeignKey(f => f.DeckId)
                  .OnDelete(DeleteBehavior.Cascade);

            // EaseFactor stored as DECIMAL(5,2) — already via [Column] annotation
        });

        // ── ReviewLog ───────────────────────────────────────────────
        modelBuilder.Entity<ReviewLog>(entity =>
        {
            // Prevent cascade path conflict: User → ReviewLog ← Flashcard → Deck → User
            entity.HasOne(r => r.Flashcard)
                  .WithMany(f => f.ReviewLogs)
                  .HasForeignKey(r => r.FlashcardId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                  .WithMany(u => u.ReviewLogs)
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.NoAction); // break cycle

            entity.HasIndex(r => new { r.FlashcardId, r.ReviewedAt });
        });
    }
}
