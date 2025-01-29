namespace MyVote.Server.Models
{
    public class User
    {
        public int UserId { get; set; }

        public string FirstName { get; set; }
        public string LastName {get; set; }

        public ICollection<Poll> CreatedPolls { get; set; } = new HashSet<Poll>();

        // Many-to-Many with Poll (Voted Polls)
        public ICollection<UserPoll> UserPolls { get; set; } = new HashSet<UserPoll>();

        // Many-to-Many with Choice (Voted Choices)
        public ICollection<UserChoice> UserChoices { get; set; } = new HashSet<UserChoice>();


    }
}
