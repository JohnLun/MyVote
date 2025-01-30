using System.ComponentModel.DataAnnotations.Schema;

namespace MyVote.Server.Models
{
    public class Poll
    {
        public int PollId { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public float TimeLimit { get; set; }

        public string IsActive { get; set; } = "t";

        public List<Choice> Choices { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
    }

}

