using Microsoft.EntityFrameworkCore;
using MyVote.Server.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Poll> Polls { get; set; }
    public DbSet<Choice> Choices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
       
    }
}
