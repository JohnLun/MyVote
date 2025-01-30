using MyVote.Server.Models;

namespace MyVote.Server.Dtos
{
    public class PollDto
    {
        public int PollId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public float TimeLimit { get; set; }
        public string IsActive { get; set; }
        public List<ChoiceDto> Choices { get; set; }
    }


    public class ChoiceDto
    {
        public int ChoiceId { get; set; }
        public string Name { get; set; }
        public int NumVotes { get; set; }
    }


    public class UserDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class CreateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class CreatePollDto
    {
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public float TimeLimit { get; set; }
        public string IsActive { get; set; }
        public List<CreateChoiceDto> Choices { get; set; }
    }

    public class CreateChoiceDto
    {
        public string Name { get; set; }
        public int NumVotes { get; set; }
    }


}
