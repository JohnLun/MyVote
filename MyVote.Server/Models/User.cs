using System.ComponentModel.DataAnnotations.Schema;

namespace MyVote.Server.Models
{
    public class User
    {
        public int UserId { get; set; }

        public string FirstName { get; set; }
        public string LastName {get; set; }

        [ForeignKey("PollId")]
        public int PollId { get; set; }
        public Poll Poll;

        [ForeignKey("ChoiceId")]
        public int ChoiceId { get; set; }
        public Choice Choice;

    }
}
