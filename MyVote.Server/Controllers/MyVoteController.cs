using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyVote.Server.Dtos;
using MyVote.Server.Models;
using System.Linq;

namespace MyVote.Server.Controllers
{
    [ApiController]
    [Route("/api")]
    public class MyVoteController : ControllerBase
    {
        private readonly ILogger<MyVoteController> _logger;
        private readonly AppDbContext _db;

        public MyVoteController(ILogger<MyVoteController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _db = dbContext;
        }

        // GET: /polls (Get all active polls)
        [HttpGet("polls")]
        public async Task<ActionResult<IEnumerable<Poll>>> GetActivePolls()
        {
            var polls = await _db.Polls
                .Where(p => p.IsActive)
                .Include(p => p.Choices)
                .ToListAsync();

            var pollDtos = polls.Select(p => new PollDto
            {
                PollId = p.PollId,
                Title = p.Title,
                Description = p.Description,
                TimeLimit = p.TimeLimit,
                IsActive = p.IsActive,
                Choices = p.Choices.Select(c => new ChoiceDto
                {
                    ChoiceId = c.ChoiceId,
                    Name = c.Name,
                    NumVotes = c.NumVotes
                }).ToList()
            }).ToList();

            return Ok(pollDtos);
        }

         // GET: /poll/{pollid} (Get poll details)
        [HttpGet("poll/{pollid}")]
        public async Task<ActionResult<Poll>> GetPoll(int pollid)
        {
            var poll = await _db.Polls
                .Include(p => p.Choices)
                .FirstOrDefaultAsync(p => p.PollId == pollid);

            if (poll == null)
                return NotFound();

            var pollDto = new PollDto
            {
                PollId = poll.PollId,
                Title = poll.Title,
                Description = poll.Description,
                TimeLimit = poll.TimeLimit,
                IsActive = poll.IsActive,
                Choices = poll.Choices.Select(c => new ChoiceDto
                {
                    ChoiceId = c.ChoiceId,
                    Name = c.Name,
                    NumVotes = c.NumVotes
                }).ToList()
            };

            return Ok(pollDto);
        }

        // GET: /choices/{pollid} (Get choices for a poll)
        [HttpGet("choices/{pollid}")]
        public async Task<ActionResult<IEnumerable<ChoiceDto>>> GetPollChoices(int pollid)
        {
            var choices = await _db.Choices
                .Where(c => c.PollId == pollid)
                .ToListAsync();

            if (!choices.Any()) return NotFound();

            var choiceDtos = choices.Select(c => new ChoiceDto
            {
                ChoiceId = c.ChoiceId,
                Name = c.Name,
                NumVotes = c.NumVotes
            }).ToList();

            return Ok(choiceDtos);
        }

        // PATCH: /choice/{choiceid} (Update choice)
        [HttpPatch("choice/{choiceid}")]
        public async Task<IActionResult> UpdateChoice(int choiceid, [FromBody] ChoiceDto updatedChoice)
        {
            var choice = await _db.Choices.FindAsync(choiceid);
            if (choice == null)
                return NotFound();

            choice.Name = updatedChoice.Name ?? choice.Name;
            choice.NumVotes = updatedChoice.NumVotes;

            _db.Choices.Update(choice);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // PUT: /poll (Update poll)
        [HttpPut("poll")]
        public async Task<IActionResult> UpdatePoll([FromBody] PollDto updatedPollDto)
        {
            var poll = await _db.Polls.FindAsync(updatedPollDto.PollId);
            if (poll == null)
                return NotFound();

            poll.Title = updatedPollDto.Title ?? poll.Title;
            poll.Description = updatedPollDto.Description ?? poll.Description;
            poll.TimeLimit = updatedPollDto.TimeLimit;
            poll.IsActive = updatedPollDto.IsActive;

            _db.Polls.Update(poll);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // PUT: /user (Update user)
        [HttpPut("user")]
        public async Task<IActionResult> UpdateUser([FromBody] UserDto updatedUserDto)
        {
            var user = await _db.Users.FindAsync(updatedUserDto.UserId);
            if (user == null)
                return NotFound();

            user.FirstName = updatedUserDto.FirstName ?? user.FirstName;
            user.LastName = updatedUserDto.LastName ?? user.LastName;

            _db.Users.Update(user);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: /poll/{pollid} (Delete poll and cascade choices)
        [HttpDelete("poll/{pollid}")]
        public async Task<IActionResult> DeletePoll(int pollid)
        {
            var poll = await _db.Polls
                .Include(p => p.Choices)
                .FirstOrDefaultAsync(p => p.PollId == pollid);

            if (poll == null)
                return NotFound();

            // Remove related choices first due to FK constraints
            _db.Choices.RemoveRange(poll.Choices);
            _db.Polls.Remove(poll);

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
