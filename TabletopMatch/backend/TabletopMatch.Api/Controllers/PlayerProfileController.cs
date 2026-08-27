using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TabletopMatch.Api.Contracts.Profiles;
using TabletopMatch.Api.Data;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Controllers;

[ApiController]
[Route("api/profiles")]
public class PlayerProfilesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlayerProfilesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerProfileResponse>>>
        GetProfiles()
    {
        var profiles = await _context.PlayerProfiles
            .AsNoTracking()
            .ToListAsync();

        return Ok(profiles.Select(CreateResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PlayerProfileResponse>> GetProfile(int id)
    {
        var profile = await _context.PlayerProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(profile => profile.Id == id);

        if (profile is null)
        {
            return NotFound();
        }

        return Ok(CreateResponse(profile));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<PlayerProfileResponse>> UpdateMyProfile(
        UpdatePlayerProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId is null)
        {
            return Unauthorized();
        }

        var profile = await _context.PlayerProfiles
            .SingleOrDefaultAsync(profile => profile.UserId == userId);

        if (profile is null)
        {
            return NotFound(new
            {
                message = "The account does not have a player profile."
            });
        }

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

        profile.DisplayName = displayName;
        profile.City = city;
        profile.Bio = string.IsNullOrWhiteSpace(request.Bio)
            ? null
            : request.Bio.Trim();

        await _context.SaveChangesAsync();

        return Ok(CreateResponse(profile));
    }

    private static PlayerProfileResponse CreateResponse(
        PlayerProfile profile)
    {
        return new PlayerProfileResponse
        {
            Id = profile.Id,
            DisplayName = profile.DisplayName,
            Bio = profile.Bio,
            City = profile.City,
            CreatedAt = profile.CreatedAt
        };
    }
}