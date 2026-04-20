using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JapaneseFlashcardAPI.Domain.Entities;

/// <summary>
/// Immutable record of a single review event.
/// </summary>
public class ReviewLog
{
    public int Id { get; set; }

    [ForeignKey(nameof(Flashcard))]
    public int FlashcardId { get; set; }

    [ForeignKey(nameof(User))]
    public int UserId { get; set; }

    /// <summary>
    /// Self-rating: 1 = Forgot, 2 = Hard, 3 = Good, 4 = Easy.
    /// </summary>
    [Range(1, 4)]
    public int Rating { get; set; }

    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Flashcard Flashcard { get; set; } = null!;
    public User User { get; set; } = null!;
}
