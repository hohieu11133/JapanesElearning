using System.ComponentModel.DataAnnotations;

namespace JapaneseFlashcardAPI.Domain.Entities;

/// <summary>
/// Represents an application user.
/// </summary>
public class User
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required, MaxLength(256), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    // Navigation
    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
    public ICollection<ReviewLog> ReviewLogs { get; set; } = new List<ReviewLog>();
}
