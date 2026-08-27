using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TabletopMatch.Api.Contracts.Auth;
using TabletopMatch.Api.Data;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;

    public AuthController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        var email = request.Email.Trim();
        var displayName = request.DisplayName.Trim();
        var city = request.City.Trim();

        if (string.IsNullOrWhiteSpace(displayName) ||
            string.IsNullOrWhiteSpace(city))
        {
            return BadRequest(new
            {
                message = "Display name and city are required."
            });
        }

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync();

        var user = new AppUser
        {
            UserName = email,
            Email = email
        };

        var createUserResult =
            await _userManager.CreateAsync(user, request.Password);

        if (!createUserResult.Succeeded)
        {
            return BadRequest(new
            {
                errors = createUserResult.Errors.Select(error =>
                    error.Description)
            });
        }

        var profile = new PlayerProfile
        {
            DisplayName = displayName,
            City = city,
            Bio = string.IsNullOrWhiteSpace(request.Bio)
                ? null
                : request.Bio.Trim(),
            UserId = user.Id
        };

        _dbContext.PlayerProfiles.Add(profile);
        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();

        await _signInManager.SignInAsync(user, isPersistent: false);

        return StatusCode(
            StatusCodes.Status201Created,
            CreateResponse(user, profile));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(
            request.Email.Trim());

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var signInResult =
            await _signInManager.PasswordSignInAsync(
                user,
                request.Password,
                request.RememberMe,
                lockoutOnFailure: true);

        if (!signInResult.Succeeded)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var profile = await _dbContext.PlayerProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(profile => profile.UserId == user.Id);

        if (profile is null)
        {
            return Problem(
                detail: "The account does not have a player profile.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        return Ok(CreateResponse(user, profile));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();

        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var user = await _userManager.GetUserAsync(User);

        if (user is null)
        {
            return Unauthorized();
        }

        var profile = await _dbContext.PlayerProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(profile => profile.UserId == user.Id);

        if (profile is null)
        {
            return Problem(
                detail: "The account does not have a player profile.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        return Ok(CreateResponse(user, profile));
    }

    private static AuthResponse CreateResponse(
        AppUser user,
        PlayerProfile profile)
    {
        return new AuthResponse
        {
            Email = user.Email ?? string.Empty,
            ProfileId = profile.Id,
            DisplayName = profile.DisplayName,
            City = profile.City,
            Bio = profile.Bio
        };
    }
}