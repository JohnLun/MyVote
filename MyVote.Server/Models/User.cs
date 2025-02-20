using System.ComponentModel.DataAnnotations.Schema;

namespace MyVote.Server.Models
{
    public class User
    {
        public int UserId { get; set; }

        public string FirstName { get; set; }
        public string LastName {get; set; }

        public List<UserChoice> UserChoices { get; set; } = new List<UserChoice>();
    }
}
