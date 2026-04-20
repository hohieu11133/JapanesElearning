using System.ComponentModel.DataAnnotations;

namespace JapaneseFlashcardAPI.Application.DTOs;

// ── Auth ────────────────────────────────────────────────────────────────────

public record RegisterRequest(
    [Required, MaxLength(100)] string Username,
    [Required, EmailAddress]   string Email,
    [Required, MinLength(8)]   string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required]               string Password
);

public record AuthResponse(
    string Token,
    string Username,
    string Email
);

// ── Deck ────────────────────────────────────────────────────────────────────

public record CreateDeckRequest(
    [Required, MaxLength(200)] string Title
);

public record DeckResponse(
    int      Id,
    string   Title,
    int      UserId,
    DateTime CreatedAt,
    int      CardCount
);

// ── Flashcard ───────────────────────────────────────────────────────────────

public record CreateFlashcardRequest(
    [Required, MaxLength(200)] string  Kanji,
    [MaxLength(200)]           string  Reading,
    [Required, MaxLength(500)] string  Meaning,
    [MaxLength(1000)]          string? ExampleSentence
);

public record FlashcardResponse(
    int      Id,
    int      DeckId,
    string   Kanji,
    string   Reading,
    string   Meaning,
    string?  ExampleSentence,
    DateTime NextReviewDate,
    int      Interval,
    decimal  EaseFactor
);

// ── Study ───────────────────────────────────────────────────────────────────

public record ReviewRequest(
    [Required]          int FlashcardId,
    [Required, Range(1, 4)] int Rating
);

public record ReviewResponse(
    int      FlashcardId,
    int      NewInterval,
    decimal  NewEaseFactor,
    DateTime NextReviewDate
);

// ── Card Management (Edit) ───────────────────────────────────────────────────

public record UpdateFlashcardRequest(
    [Required, MaxLength(200)] string  Kanji,
    [MaxLength(200)]           string  Reading,
    [Required, MaxLength(500)] string  Meaning,
    [MaxLength(1000)]          string? ExampleSentence
);

// ── Deck Management (Edit) ───────────────────────────────────────────────────

public record UpdateDeckRequest(
    [Required, MaxLength(200)] string Title
);

// ── Bulk Import ───────────────────────────────────────────────────────────────

public record ImportCardsRequest(
    [Required, MaxLength(500, ErrorMessage = "Maximum 500 cards per import.")]
    List<CreateFlashcardRequest> Cards
);

public record ImportCardsResponse(
    int                  Imported,
    int                  Skipped,
    IEnumerable<string>  Errors
);
