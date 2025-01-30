using System.ComponentModel.DataAnnotations.Schema;

namespace MyVote.Server.Models
{
    public class Choice
    {
        public int ChoiceId {get; set; }
        public string Name {get; set; }
        public int NumVotes {get; set; }
    
        public List<User> Users {get; set; }

        //[ForeignKey("PollId")]
        public int PollId {get; set; }
        public Poll Poll {get; set; }

    }
}
