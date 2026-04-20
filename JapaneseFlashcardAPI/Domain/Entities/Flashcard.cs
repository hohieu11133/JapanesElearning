using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JapaneseFlashcardAPI.Domain.Entities;

/// <summary>
/// A single Japanese vocabulary card with SM-2 SRS metadata.
/// </summary>
public class Flashcard
{
    public int Id { get; set; }

    [ForeignKey(nameof(Deck))]
    public int DeckId { get; set; }

    /// <summary>The kanji / word form, e.g. "食べる".</summary>
    [Required, MaxLength(200)]
    public string Kanji { get; set; } = string.Empty;

    /// <summary>Hiragana / furigana reading, e.g. "たべる".</summary>
    [MaxLength(200)]
    public string Reading { get; set; } = string.Empty;

    /// <summary>English (or target language) meaning.</summary>
    [Required, MaxLength(500)]
    public string Meaning { get; set; } = string.Empty;

    /// <summary>Optional example sentence.</summary>
    [MaxLength(1000)]
    public string? ExampleSentence { get; set; }

    // ── SM-2 SRS fields ────────────────────────────────────────────

    /// <summary>UTC date/time when this card is next due for review.</summary>
    public DateTime NextReviewDate { get; set; } = DateTime.UtcNow;

    /// <summary>Current inter-repetition interval in days.</summary>
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Easiness factor — controls how fast the interval grows.
    /// Must be ≥ 1.3 (SM-2 lower bound).
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal EaseFactor { get; set; } = 2.5m;

    // Navigation
    public Deck Deck { get; set; } = null!;
    public ICollection<ReviewLog> ReviewLogs { get; set; } = new List<ReviewLog>();
}
