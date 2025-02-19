namespace MyVote.Server.Models
{
    public class Suggestion
    {
        public int SuggestionId { get; set; }
        public string SuggestionName {  get; set; }
        public int UserId { get; set; }
        public int PollId { get; set; }
    }
}

