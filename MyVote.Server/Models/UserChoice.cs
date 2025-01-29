using MyVote.Server.Models;

public class UserChoice
{
    public int UserId { get; set; }
    public User User { get; set; }

    public int ChoiceId { get; set; }
    public Choice Choice { get; set; }
}