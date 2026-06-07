using System.ComponentModel.DataAnnotations;

namespace JapaneseFlashcardAPI.Domain.Entities;

/// <summary>
/// Represents a system document like Privacy Policy, Terms of Service, or internal guides.
/// </summary>
public class SystemDocument
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
