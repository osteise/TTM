using Microsoft.EntityFrameworkCore;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<PlayerProfile> PlayerProfiles => Set<PlayerProfile>();
}