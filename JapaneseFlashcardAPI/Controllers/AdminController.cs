using JapaneseFlashcardAPI.Application.DTOs;
using JapaneseFlashcardAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JapaneseFlashcardAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .Select(u => new UserDto(u.Id, u.Username, u.Email, u.Role))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("users/{userId}/role")]
    public async Task<IActionResult> UpdateRole(int userId, [FromBody] RoleUpdateRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (currentUserId == userId)
        {
            return BadRequest(new { message = "You cannot change your own role." });
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        if (request.NewRole != "User" && request.NewRole != "Teacher" && request.NewRole != "Admin")
        {
            return BadRequest(new { message = "Invalid role specified." });
        }

        user.Role = request.NewRole;
        await _db.SaveChangesAsync();

        return Ok(new UserDto(user.Id, user.Username, user.Email, user.Role));
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (currentUserId == userId)
        {
            return BadRequest(new { message = "You cannot delete your own account." });
        }

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
