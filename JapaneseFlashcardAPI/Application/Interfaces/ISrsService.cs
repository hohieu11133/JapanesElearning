using JapaneseFlashcardAPI.Domain.Entities;

namespace JapaneseFlashcardAPI.Application.Interfaces;

/// <summary>
/// Contract for the Spaced Repetition System (SM-2) calculation service.
/// </summary>
public interface ISrsService
{
    /// <summary>
    /// Applies the SM-2 algorithm to a flashcard given the user's self-rating.
    /// Mutates <see cref="Flashcard.Interval"/>, <see cref="Flashcard.EaseFactor"/>,
    /// and <see cref="Flashcard.NextReviewDate"/> in-place.
    /// </summary>
    /// <param name="card">The card to update.</param>
    /// <param name="rating">
    ///   Self-rating: 1 = Forgot, 2 = Hard, 3 = Good, 4 = Easy.
    /// </param>
    void ApplyReview(Flashcard card, int rating);
}
