using System.Security.Claims;
using JapaneseFlashcardAPI.Application.DTOs;
using JapaneseFlashcardAPI.Application.Interfaces;
using JapaneseFlashcardAPI.Domain.Entities;
using JapaneseFlashcardAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JapaneseFlashcardAPI.Controllers;

/// <summary>
/// Endpoints for study sessions: fetching due cards and submitting reviews.
/// </summary>
[ApiController]
[Authorize]
[Produces("application/json")]
public class StudyController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISrsService _srs;

    public StudyController(AppDbContext db, ISrsService srs)
    {
        _db = db;
        _srs = srs;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")
                  ?? throw new UnauthorizedAccessException());

    // GET api/decks/{deckId}/study
    /// <summary>
    /// Fetch all cards in a deck that are due for review today
    /// (NextReviewDate ≤ now UTC).
    /// </summary>
    [HttpGet("api/decks/{deckId:int}/study")]
    [ProducesResponseType(typeof(IEnumerable<FlashcardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudyCards(int deckId)
    {
        int userId = CurrentUserId;

        var deck = await _db.Decks.AsNoTracking()
                                  .FirstOrDefaultAsync(d => d.Id == deckId);
        if (deck is null)
            return NotFound(new { message = $"Deck {deckId} not found." });

        if (deck.UserId != userId)
            return Forbid();

        var now   = DateTime.UtcNow;
        var cards = await _db.Flashcards
            .AsNoTracking()
            .Where(f => f.DeckId == deckId && f.NextReviewDate <= now)
            .OrderBy(f => f.NextReviewDate)
            .Select(f => new FlashcardResponse(
                f.Id, f.DeckId, f.Kanji, f.Reading,
                f.Meaning, f.ExampleSentence,
                f.NextReviewDate, f.Interval, f.EaseFactor))
            .ToListAsync();

        return Ok(cards);
    }

    // POST api/study/review
    /// <summary>
    /// Submit a review rating for a single flashcard.
    /// The SM-2 algorithm is applied and the card is updated in the database.
    /// A <see cref="ReviewLog"/> record is persisted.
    /// </summary>
    /// <remarks>
    /// Rating scale: 1 = Forgot, 2 = Hard, 3 = Good, 4 = Easy.
    /// </remarks>
    [HttpPost("api/study/review")]
    [ProducesResponseType(typeof(ReviewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitReview([FromBody] ReviewRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        int userId = CurrentUserId;

        // Load card with its parent deck to verify ownership
        var card = await _db.Flashcards
            .Include(f => f.Deck)
            .FirstOrDefaultAsync(f => f.Id == request.FlashcardId);

        if (card is null)
            return NotFound(new { message = $"Flashcard {request.FlashcardId} not found." });

        if (card.Deck.UserId != userId)
            return Forbid();

        // ── Apply SM-2 algorithm ──────────────────────────────────────
        _srs.ApplyReview(card, request.Rating);

        // ── Persist review log ────────────────────────────────────────
        var log = new ReviewLog
        {
            FlashcardId = card.Id,
            UserId      = userId,
            Rating      = request.Rating,
            ReviewedAt  = DateTime.UtcNow
        };

        _db.ReviewLogs.Add(log);
        await _db.SaveChangesAsync();

        return Ok(new ReviewResponse(
            card.Id,
            card.Interval,
            card.EaseFactor,
            card.NextReviewDate));
    }
}
