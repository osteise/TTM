using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TabletopMatch.Api.Models;

namespace TabletopMatch.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<PlayerProfile> PlayerProfiles => Set<PlayerProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PlayerProfile>()
            .HasOne(profile => profile.User)
            .WithOne(user => user.PlayerProfile)
            .HasForeignKey<PlayerProfile>(profile => profile.UserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
    }
}