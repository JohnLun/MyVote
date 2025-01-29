using System.ComponentModel.DataAnnotations.Schema;

namespace MyVote.Server.Models
{
    public class Poll
    {
        public int PollId { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime TimeLimit { get; set; }

        public bool IsActive { get; set; }

        public ICollection<Choice> Choices { get; set; } = new HashSet<Choice>();


        [ForeignKey("UserId")]
        public int UserId { get; set; }
        public User User { get; set; }

        public ICollection<UserPoll> UserPolls { get; set; } = new HashSet<UserPoll>();
    }

}

