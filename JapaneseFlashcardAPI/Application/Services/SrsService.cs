using JapaneseFlashcardAPI.Application.Interfaces;
using JapaneseFlashcardAPI.Domain.Entities;

namespace JapaneseFlashcardAPI.Application.Services;

/// <summary>
/// Simplified SuperMemo-2 (SM-2) implementation.
///
/// Rating scale:
///   1 – Forgot      → reset interval to 1, apply large EF penalty
///   2 – Hard        → keep current interval, small EF penalty
///   3 – Good        → advance interval normally
///   4 – Easy        → advance interval with EF bonus
///
/// Algorithm details:
///   • EF' = EF + (0.1 − (4 − q) × (0.08 + (4 − q) × 0.02))
///     where q is quality in range [0..5] derived from the 1-4 rating.
///   • EF is clamped to a minimum of 1.3 (SM-2 specification).
///   • Interval progression: 1 → 6 → (prev × EF) → … (rounded).
///   • Rating 1 resets the card's repetition count to zero.
/// </summary>
public class SrsService : ISrsService
{
    // Map 1-4 rating to SM-2 quality score (0-5)
    private static readonly Dictionary<int, double> QualityMap = new()
    {
        { 1, 0 }, // Forgot  → complete blackout
        { 2, 2 }, // Hard    → correct but very difficult
        { 3, 4 }, // Good    → correct after a hesitation
        { 4, 5 }, // Easy    → perfect response
    };

    private const double MinEaseFactor = 1.3;
    private const double DefaultEaseFactor = 2.5;

    /// <inheritdoc/>
    public void ApplyReview(Flashcard card, int rating)
    {
        if (rating < 1 || rating > 4)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 4.");

        double q = QualityMap[rating];
        double ef = (double)card.EaseFactor;

        // ── 1. Update EaseFactor ────────────────────────────────────
        ef = ef + (0.1 - (4 - q) * (0.08 + (4 - q) * 0.02));
        ef = Math.Max(ef, MinEaseFactor);

        // ── 2. Update Interval ──────────────────────────────────────
        if (rating == 1)
        {
            // Forgot: reset card so it is shown again tomorrow
            card.Interval = 1;
        }
        else
        {
            card.Interval = card.Interval switch
            {
                1 => 6,                                 // second successful review
                _ => (int)Math.Round(card.Interval * ef, MidpointRounding.AwayFromZero)
            };
        }

        // ── 3. Persist changes to the entity ───────────────────────
        card.EaseFactor = (decimal)Math.Round(ef, 2);
        card.NextReviewDate = DateTime.UtcNow.AddDays(card.Interval);
    }
}
