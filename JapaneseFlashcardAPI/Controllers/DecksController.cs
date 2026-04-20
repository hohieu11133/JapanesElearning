using System.Security.Claims;
using JapaneseFlashcardAPI.Application.DTOs;
using JapaneseFlashcardAPI.Domain.Entities;
using JapaneseFlashcardAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JapaneseFlashcardAPI.Controllers;

/// <summary>
/// Full deck + card CRUD management. All endpoints require a valid JWT.
/// </summary>
[ApiController]
[Route("api/decks")]
[Authorize]
[Produces("application/json")]
public class DecksController : ControllerBase
{
    private readonly AppDbContext _db;

    public DecksController(AppDbContext db) => _db = db;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")
                  ?? throw new UnauthorizedAccessException());

    private async Task<Deck?> GetOwnedDeckAsync(int deckId, int userId, bool tracking = false)
    {
        var q = tracking
            ? _db.Decks.Where(d => d.Id == deckId && d.UserId == userId)
            : _db.Decks.AsNoTracking().Where(d => d.Id == deckId && d.UserId == userId);
        return await q.FirstOrDefaultAsync();
    }

    // ═══════════════════════════ DECK ENDPOINTS ═══════════════════════════════

    // GET api/decks
    /// <summary>List all decks owned by the authenticated user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DeckResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDecks()
    {
        int userId = CurrentUserId;
        var decks = await _db.Decks
            .Where(d => d.UserId == userId)
            .Select(d => new DeckResponse(d.Id, d.Title, d.UserId, d.CreatedAt, d.Flashcards.Count))
            .ToListAsync();
        return Ok(decks);
    }

    // GET api/decks/{deckId}
    /// <summary>Get a single deck by ID.</summary>
    [HttpGet("{deckId:int}")]
    [ProducesResponseType(typeof(DeckResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDeck(int deckId)
    {
        int userId = CurrentUserId;
        var deck = await _db.Decks
            .Where(d => d.Id == deckId && d.UserId == userId)
            .Select(d => new DeckResponse(d.Id, d.Title, d.UserId, d.CreatedAt, d.Flashcards.Count))
            .FirstOrDefaultAsync();
        return deck is null ? NotFound() : Ok(deck);
    }

    // POST api/decks
    /// <summary>Create a new deck.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(DeckResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDeck([FromBody] CreateDeckRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        int userId = CurrentUserId;
        var deck = new Deck { Title = request.Title, UserId = userId, CreatedAt = DateTime.UtcNow };
        _db.Decks.Add(deck);
        await _db.SaveChangesAsync();

        var response = new DeckResponse(deck.Id, deck.Title, deck.UserId, deck.CreatedAt, 0);
        return CreatedAtAction(nameof(GetDeck), new { deckId = deck.Id }, response);
    }

    // PUT api/decks/{deckId}
    /// <summary>Rename an existing deck.</summary>
    [HttpPut("{deckId:int}")]
    [ProducesResponseType(typeof(DeckResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDeck(int deckId, [FromBody] UpdateDeckRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        int userId = CurrentUserId;
        var deck = await _db.Decks.FirstOrDefaultAsync(d => d.Id == deckId && d.UserId == userId);
        if (deck is null) return NotFound();

        deck.Title = request.Title;
        await _db.SaveChangesAsync();

        int count = await _db.Flashcards.CountAsync(f => f.DeckId == deckId);
        return Ok(new DeckResponse(deck.Id, deck.Title, deck.UserId, deck.CreatedAt, count));
    }

    // DELETE api/decks/{deckId}
    /// <summary>Delete a deck and all its cards.</summary>
    [HttpDelete("{deckId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDeck(int deckId)
    {
        int userId = CurrentUserId;
        var deck = await _db.Decks.FirstOrDefaultAsync(d => d.Id == deckId && d.UserId == userId);
        if (deck is null) return NotFound();

        _db.Decks.Remove(deck);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ═══════════════════════════ CARD ENDPOINTS ════════════════════════════════

    // GET api/decks/{deckId}/cards
    /// <summary>List ALL cards in a deck (not filtered by NextReviewDate).</summary>
    [HttpGet("{deckId:int}/cards")]
    [ProducesResponseType(typeof(IEnumerable<FlashcardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllCards(int deckId)
    {
        int userId = CurrentUserId;
        var deck = await GetOwnedDeckAsync(deckId, userId);
        if (deck is null) return NotFound();

        var cards = await _db.Flashcards
            .AsNoTracking()
            .Where(f => f.DeckId == deckId)
            .OrderBy(f => f.Id)
            .Select(f => new FlashcardResponse(
                f.Id, f.DeckId, f.Kanji, f.Reading,
                f.Meaning, f.ExampleSentence,
                f.NextReviewDate, f.Interval, f.EaseFactor))
            .ToListAsync();

        return Ok(cards);
    }

    // POST api/decks/{deckId}/cards
    /// <summary>Add a single flashcard to a deck.</summary>
    [HttpPost("{deckId:int}/cards")]
    [ProducesResponseType(typeof(FlashcardResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddCard(int deckId, [FromBody] CreateFlashcardRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        int userId = CurrentUserId;
        var deck = await _db.Decks.FirstOrDefaultAsync(d => d.Id == deckId);
        if (deck is null) return NotFound(new { message = $"Deck {deckId} not found." });
        if (deck.UserId != userId) return Forbid();

        var card = new Flashcard
        {
            DeckId          = deckId,
            Kanji           = request.Kanji,
            Reading         = request.Reading,
            Meaning         = request.Meaning,
            ExampleSentence = request.ExampleSentence,
            NextReviewDate  = DateTime.UtcNow,
            Interval        = 1,
            EaseFactor      = 2.5m
        };

        _db.Flashcards.Add(card);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(AddCard), new { deckId }, MapToResponse(card));
    }

    // PUT api/decks/{deckId}/cards/{cardId}
    /// <summary>Update the content fields of a flashcard (does not reset SRS schedule).</summary>
    [HttpPut("{deckId:int}/cards/{cardId:int}")]
    [ProducesResponseType(typeof(FlashcardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCard(int deckId, int cardId, [FromBody] UpdateFlashcardRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        int userId = CurrentUserId;
        var deck = await GetOwnedDeckAsync(deckId, userId);
        if (deck is null) return NotFound();

        var card = await _db.Flashcards.FirstOrDefaultAsync(f => f.Id == cardId && f.DeckId == deckId);
        if (card is null) return NotFound();

        card.Kanji           = request.Kanji.Trim();
        card.Reading         = request.Reading?.Trim() ?? string.Empty;
        card.Meaning         = request.Meaning.Trim();
        card.ExampleSentence = string.IsNullOrWhiteSpace(request.ExampleSentence)
                               ? null : request.ExampleSentence.Trim();

        await _db.SaveChangesAsync();
        return Ok(MapToResponse(card));
    }

    // DELETE api/decks/{deckId}/cards/{cardId}
    /// <summary>Delete a single flashcard (and its review history).</summary>
    [HttpDelete("{deckId:int}/cards/{cardId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCard(int deckId, int cardId)
    {
        int userId = CurrentUserId;
        var deck = await GetOwnedDeckAsync(deckId, userId);
        if (deck is null) return NotFound();

        var card = await _db.Flashcards.FirstOrDefaultAsync(f => f.Id == cardId && f.DeckId == deckId);
        if (card is null) return NotFound();

        _db.Flashcards.Remove(card);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST api/decks/{deckId}/cards/import
    /// <summary>
    /// Bulk-import up to 500 cards at once.
    /// Cards whose Kanji already exists in the deck are silently skipped.
    /// </summary>
    [HttpPost("{deckId:int}/cards/import")]
    [ProducesResponseType(typeof(ImportCardsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ImportCards(int deckId, [FromBody] ImportCardsRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        int userId = CurrentUserId;
        var deck = await GetOwnedDeckAsync(deckId, userId);
        if (deck is null) return NotFound();

        if (request.Cards.Count > 500)
            return BadRequest(new { message = "Maximum 500 cards per import." });

        // Fetch existing Kanji for duplicate detection
        var existingKanji = await _db.Flashcards
            .Where(f => f.DeckId == deckId)
            .Select(f => f.Kanji)
            .ToHashSetAsync();

        var toInsert = new List<Flashcard>();
        var errors   = new List<string>();
        int skipped  = 0;

        foreach (var (item, idx) in request.Cards.Select((c, i) => (c, i + 1)))
        {
            if (string.IsNullOrWhiteSpace(item.Kanji))
            {
                errors.Add($"Row {idx}: Kanji is required.");
                continue;
            }
            if (string.IsNullOrWhiteSpace(item.Meaning))
            {
                errors.Add($"Row {idx}: Meaning is required.");
                continue;
            }
            if (existingKanji.Contains(item.Kanji.Trim()))
            {
                skipped++;
                continue;
            }

            var card = new Flashcard
            {
                DeckId          = deckId,
                Kanji           = item.Kanji.Trim(),
                Reading         = item.Reading?.Trim() ?? string.Empty,
                Meaning         = item.Meaning.Trim(),
                ExampleSentence = string.IsNullOrWhiteSpace(item.ExampleSentence)
                                  ? null : item.ExampleSentence.Trim(),
                NextReviewDate  = DateTime.UtcNow,
                Interval        = 1,
                EaseFactor      = 2.5m
            };

            toInsert.Add(card);
            existingKanji.Add(item.Kanji.Trim()); // prevent intra-batch duplicates
        }

        if (toInsert.Count > 0)
        {
            _db.Flashcards.AddRange(toInsert);
            await _db.SaveChangesAsync();
        }

        return Ok(new ImportCardsResponse(toInsert.Count, skipped, errors));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private static FlashcardResponse MapToResponse(Flashcard card) =>
        new(card.Id, card.DeckId, card.Kanji, card.Reading,
            card.Meaning, card.ExampleSentence,
            card.NextReviewDate, card.Interval, card.EaseFactor);
}
