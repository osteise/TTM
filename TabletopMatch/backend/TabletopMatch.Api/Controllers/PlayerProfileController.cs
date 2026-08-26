using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    public async Task<ActionResult<IEnumerable<PlayerProfile>>> GetProfiles()
    {
        var profiles = await _context.PlayerProfiles.ToListAsync();

        return Ok(profiles);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PlayerProfile>> GetProfile(int id)
    {
        var profile = await _context.PlayerProfiles.FindAsync(id);

        if (profile is null)
        {
            return NotFound();
        }

        return Ok(profile);
    }

    [HttpPost]
    public async Task<ActionResult<PlayerProfile>> CreateProfile(
        PlayerProfile profile)
    {
        _context.PlayerProfiles.Add(profile);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetProfile),
            new { id = profile.Id },
            profile);
    }
}