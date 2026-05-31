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
                f.NextReviewDate, f.Interval, f.EaseFactor, f.Repetitions))
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

    // GET api/study/stats
    /// <summary>
    /// Fetch overall stats for the dashboard: due counts, active decks, total cards, and review streak.
    /// </summary>
    [HttpGet("api/study/stats")]
    [ProducesResponseType(typeof(StudyStatsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStats()
    {
        int userId = CurrentUserId;
        var now = DateTime.UtcNow;

        int dueToday = await _db.Flashcards
            .CountAsync(f => f.Deck.UserId == userId && f.NextReviewDate <= now);

        int totalCards = await _db.Flashcards
            .CountAsync(f => f.Deck.UserId == userId);

        int activeDecks = await _db.Decks
            .CountAsync(d => d.UserId == userId);

        var reviewDates = await _db.ReviewLogs
            .Where(r => r.UserId == userId)
            .Select(r => r.ReviewedAt.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync();

        int streak = 0;
        if (reviewDates.Any())
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);
            var firstDate = reviewDates[0];

            if (firstDate == today || firstDate == yesterday)
            {
                streak = 1;
                for (int i = 0; i < reviewDates.Count - 1; i++)
                {
                    if ((reviewDates[i] - reviewDates[i + 1]).TotalDays == 1)
                    {
                        streak++;
                    }
                    else
                    {
                        break;
                    }
                }
            }
        }

        return Ok(new StudyStatsResponse(dueToday, streak, totalCards, activeDecks));
    }

    // GET api/study/detailed-stats
    /// <summary>
    /// Fetch detailed statistics for heatmap calendar, retention rate, and recent session logs.
    /// </summary>
    [HttpGet("api/study/detailed-stats")]
    [ProducesResponseType(typeof(DetailedStatsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDetailedStats()
    {
        int userId = CurrentUserId;

        // 1. Calculate Retention Rate (rating >= 2 means successful recall)
        int totalReviews = await _db.ReviewLogs.CountAsync(r => r.UserId == userId);
        double retentionRate = 100;
        if (totalReviews > 0)
        {
            int correctReviews = await _db.ReviewLogs.CountAsync(r => r.UserId == userId && r.Rating >= 2);
            retentionRate = Math.Round(((double)correctReviews / totalReviews) * 100);
        }

        // 2. Heatmap (past 12 months review count grouped by date)
        var cutoff = DateTime.UtcNow.Date.AddYears(-1);
        var heatmapRaw = await _db.ReviewLogs
            .Where(r => r.UserId == userId && r.ReviewedAt >= cutoff)
            .GroupBy(r => r.ReviewedAt.Date)
            .Select(g => new {
                Date = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        var heatmapData = heatmapRaw
            .Select(x => new HeatmapEntry(x.Date.ToString("yyyy-MM-dd"), x.Count))
            .ToList();

        // 3. Recent Sessions (grouped logs)
        var logs = await _db.ReviewLogs
            .Include(r => r.Flashcard)
            .ThenInclude(f => f.Deck)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.ReviewedAt)
            .Take(200) // load a reasonable history of raw logs
            .ToListAsync();

        var recentSessions = logs
            .GroupBy(l => new { Date = l.ReviewedAt.Date, DeckTitle = l.Flashcard.Deck.Title })
            .OrderByDescending(g => g.Key.Date)
            .Take(5)
            .Select(g => {
                int total = g.Count();
                int correct = g.Count(x => x.Rating >= 2);
                int accuracy = total > 0 ? (int)Math.Round((double)correct / total * 100) : 0;
                
                int seconds = total * 6; // estimate time spent
                string timeStr = seconds < 60 ? $"{seconds}s" : $"{seconds / 60}m {seconds % 60}s";
                
                int newWords = g.Count(x => x.Flashcard.Repetitions <= 1);
                
                string dateStr;
                var age = (DateTime.UtcNow.Date - g.Key.Date).Days;
                if (age == 0) dateStr = "Today";
                else if (age == 1) dateStr = "Yesterday";
                else dateStr = g.Key.Date.ToString("MMM dd, yyyy");

                return new SessionLogEntry(
                    dateStr,
                    g.Key.DeckTitle,
                    total,
                    accuracy,
                    timeStr,
                    newWords
                );
            })
            .ToList();

        return Ok(new DetailedStatsResponse(retentionRate, heatmapData, recentSessions));
    }
}
