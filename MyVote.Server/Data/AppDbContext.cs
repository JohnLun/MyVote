using Microsoft.EntityFrameworkCore;
using MyVote.Server.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Poll> Polls { get; set; }
    public DbSet<Choice> Choices { get; set; }
    public DbSet<UserChoice> UserChoices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        // User -> Poll (One-to-Many)
        modelBuilder.Entity<Poll>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Poll <-> User (Many-to-Many)
        modelBuilder.Entity<UserPoll>()
            .HasKey(up => new { up.UserId, up.PollId });


        modelBuilder.Entity<UserPoll>()
            .HasOne(up => up.User)
            .WithMany()
            .HasForeignKey(up => up.UserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserPoll>()
            .HasOne(up => up.Poll)
            .WithMany()
            .HasForeignKey(up => up.PollId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserChoice>()
            .HasKey(uc => new { uc.UserId, uc.ChoiceId });


        modelBuilder.Entity<UserChoice>()
            .HasOne(uc => uc.User)
            .WithMany(u => u.UserChoices)
            .HasForeignKey(uc => uc.UserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserChoice>()
            .HasOne(uc => uc.Choice)
            .WithMany(c => c.UserChoices)
            .HasForeignKey(uc => uc.ChoiceId)
        .OnDelete(DeleteBehavior.Restrict);

    }
}
