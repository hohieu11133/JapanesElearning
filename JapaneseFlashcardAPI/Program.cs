using System.Text;
using JapaneseFlashcardAPI.Application.Interfaces;
using JapaneseFlashcardAPI.Application.Services;
using JapaneseFlashcardAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOpts => sqlOpts.EnableRetryOnFailure()));

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<ISrsService, SrsService>();

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("Jwt");
var keyBytes   = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSection["Issuer"],
            ValidAudience            = jwtSection["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(keyBytes),
            ClockSkew                = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opts =>
{
    opts.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Japanese Flashcard API",
        Version     = "v1",
        Description = "RESTful API for a Japanese vocabulary SRS flashcard application."
    });

    // Add JWT Bearer support in Swagger UI
    var jwtScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name         = "Authorization",
        In           = ParameterLocation.Header,
        Type         = SecuritySchemeType.Http,
        Scheme       = JwtBearerDefaults.AuthenticationScheme,
        Description  = "Enter **Bearer &lt;token&gt;**",
        Reference    = new OpenApiReference
        {
            Id   = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    opts.AddSecurityDefinition(jwtScheme.Reference.Id, jwtScheme);
    opts.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });

    // Include XML doc comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        opts.IncludeXmlComments(xmlPath);
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 5; // 5 requests per window
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ── CORS (Secure) ─────────────────────────────────────────────────────────
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() 
            ?? new[] { "http://localhost:5000", "https://api.gitplatform.io.vn", "https://gitplatform.io.vn" };
            
        if (allowedOrigins.Contains("*"))
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
        }
    }));

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Database Initialization ────────────────────────────────────────────────────
// Retries up to 10 times with 5-second delays — important in Docker where the
// API container can start before SQL Server is fully ready.
using (var scope = app.Services.CreateScope())
{
    var db     = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

    const int maxRetries = 10;
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            bool created = db.Database.EnsureCreated();
            if (created)
                logger.LogInformation("✅ Database & all tables created successfully.");
            else
                logger.LogInformation("✅ Database schema already exists — data preserved.");
            break; // success — exit retry loop
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            logger.LogWarning("⏳ DB not ready (attempt {Attempt}/{Max}): {Msg}. Retrying in 5s…",
                attempt, maxRetries, ex.Message);
            Thread.Sleep(5000);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ Could not connect to SQL Server after {Max} attempts.", maxRetries);
        }
    }
}

// ── Static Files (Frontend SPA) ───────────────────────────────────────────────
// FRONTEND_PATH env var is set in Docker (see Dockerfile / docker-compose.yml).
// Falls back to relative-path traversal when running locally with dotnet run.
var frontendPath =
    Environment.GetEnvironmentVariable("FRONTEND_PATH")
    ?? Path.GetFullPath(Path.Combine(
        Directory.GetParent(AppContext.BaseDirectory)!
            .Parent!.Parent!.Parent!.FullName, "..", "frontend"));

if (Directory.Exists(frontendPath))
{
    app.Logger.LogInformation("🌐 Serving frontend from: {Path}", frontendPath);
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath)
    });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(frontendPath)
    });
}
else
{
    app.Logger.LogWarning("⚠ Frontend folder not found at: {Path}", frontendPath);
}

// ── Swagger (moved to /swagger so SPA loads at /) ─────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Japanese Flashcard API v1");
    c.RoutePrefix = "swagger"; // http://localhost:5000/swagger
});

//app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

app.Run();
