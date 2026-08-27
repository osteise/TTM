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

    public DbSet<Conversation> Conversations => Set<Conversation>();

    public DbSet<ConversationParticipant> ConversationParticipants =>
        Set<ConversationParticipant>();

    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PlayerProfile>()
            .HasOne(profile => profile.User)
            .WithOne(user => user.PlayerProfile)
            .HasForeignKey<PlayerProfile>(profile => profile.UserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Conversation>(conversation =>
        {
            conversation.HasKey(item => item.Id);

            conversation.Property(item => item.Type)
                .HasConversion<int>();

            conversation.Property(item => item.DirectConversationKey)
                .HasMaxLength(
                    Conversation.DirectConversationKeyMaxLength);

            conversation.HasIndex(item => item.DirectConversationKey)
                .IsUnique()
                .HasFilter("\"DirectConversationKey\" IS NOT NULL");

            conversation.HasIndex(item => item.LastActivityAt);
        });

        modelBuilder.Entity<ConversationParticipant>(participant =>
        {
            participant.HasKey(item => new
            {
                item.ConversationId,
                item.UserId
            });

            participant.HasOne(item => item.Conversation)
                .WithMany(conversation => conversation.Participants)
                .HasForeignKey(item => item.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            participant.HasOne(item => item.User)
                .WithMany(user => user.ConversationParticipants)
                .HasForeignKey(item => item.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            participant.HasIndex(item => new
            {
                item.UserId,
                item.ConversationId
            });
        });

        modelBuilder.Entity<Message>(message =>
        {
            message.HasKey(item => item.Id);

            message.Property(item => item.Content)
                .HasMaxLength(Message.MaxContentLength)
                .IsRequired();

            message.HasOne(item => item.Conversation)
                .WithMany(conversation => conversation.Messages)
                .HasForeignKey(item => item.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            message.HasOne(item => item.Sender)
                .WithMany(user => user.SentMessages)
                .HasForeignKey(item => item.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            message.HasIndex(item => new
            {
                item.ConversationId,
                item.Id
            });
        });
    }
}