using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using JapaneseFlashcardAPI.Application.DTOs;
using JapaneseFlashcardAPI.Domain.Entities;
using JapaneseFlashcardAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace JapaneseFlashcardAPI.Controllers;

/// <summary>
/// Handles user registration and login, issuing JWT tokens.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // POST api/auth/register
    /// <summary>Register a new user.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        bool emailTaken = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (emailTaken)
            return Conflict(new { message = "Email is already registered." });

        bool usernameTaken = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (usernameTaken)
            return Conflict(new { message = "Username is already taken." });

        var user = new User
        {
            Username     = request.Username,
            Email        = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);
        return CreatedAtAction(nameof(Register), new AuthResponse(token, user.Username, user.Email));
    }

    // POST api/auth/login
    /// <summary>Authenticate a user and return a JWT.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        var token = GenerateJwt(user);
        return Ok(new AuthResponse(token, user.Username, user.Email));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private string GenerateJwt(User user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds      = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("username",                    user.Username),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             jwtSection["Issuer"],
            audience:           jwtSection["Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(
                                    double.Parse(jwtSection["ExpiresInHours"] ?? "24")),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
