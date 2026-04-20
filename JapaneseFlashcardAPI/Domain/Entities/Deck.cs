using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JapaneseFlashcardAPI.Domain.Entities;

/// <summary>
/// A named collection of flashcards belonging to a user.
/// </summary>
public class Deck
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
}
