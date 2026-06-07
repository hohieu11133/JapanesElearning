using JapaneseFlashcardAPI.Application.DTOs;
using JapaneseFlashcardAPI.Domain.Entities;
using JapaneseFlashcardAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JapaneseFlashcardAPI.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
[Produces("application/json")]
public class DocumentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public DocumentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var docs = await _db.SystemDocuments
            .Select(d => new SystemDocumentDto(d.Id, d.Title, d.Content, d.CreatedAt, d.UpdatedAt))
            .ToListAsync();
        return Ok(docs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var doc = await _db.SystemDocuments.FindAsync(id);
        if (doc == null) return NotFound(new { message = "Document not found." });

        return Ok(new SystemDocumentDto(doc.Id, doc.Title, doc.Content, doc.CreatedAt, doc.UpdatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateUpdateDocumentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var doc = new SystemDocument
        {
            Title = request.Title,
            Content = request.Content
        };

        _db.SystemDocuments.Add(doc);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = doc.Id }, new SystemDocumentDto(doc.Id, doc.Title, doc.Content, doc.CreatedAt, doc.UpdatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateDocumentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var doc = await _db.SystemDocuments.FindAsync(id);
        if (doc == null) return NotFound(new { message = "Document not found." });

        doc.Title = request.Title;
        doc.Content = request.Content;
        doc.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new SystemDocumentDto(doc.Id, doc.Title, doc.Content, doc.CreatedAt, doc.UpdatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var doc = await _db.SystemDocuments.FindAsync(id);
        if (doc == null) return NotFound(new { message = "Document not found." });

        _db.SystemDocuments.Remove(doc);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
