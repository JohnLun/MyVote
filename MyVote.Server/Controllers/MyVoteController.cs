using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyVote.Server.Dtos;
using MyVote.Server.Models;
using System.Linq;
using System.Xml.Serialization;

namespace MyVote.Server.Controllers
{
    [ApiController]
    [Route("/api")]
    [EnableCors("AllowSpecificOrigin")]
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
                .Where(p => p.IsActive=="t")
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
        public async Task<IActionResult> UpdateChoice(int choiceid, int userid)
        {
            var choice = await _db.Choices
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.ChoiceId == choiceid);

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserId == userid);

            choice.Users.Add(user);
            choice.NumVotes++;
            _db.SaveChangesAsync();

            return Ok();
        }

        // POST: /poll (Create new poll)
        [HttpPost("poll")]
        public async Task<IActionResult> CreatePoll([FromBody] CreatePollDto newPollDto)
        {
            // Check if the UserId exists in the Users table
            var user = await _db.Users.FindAsync(newPollDto.UserId);
            if (user == null)
            {
                return BadRequest("Invalid UserId");
            }

            var poll = new Poll
            {
                UserId = newPollDto.UserId,
                Title = newPollDto.Title,
                Description = newPollDto.Description,
                TimeLimit = newPollDto.TimeLimit,
                IsActive = newPollDto.IsActive,
                Choices = newPollDto.Choices.Select(c => new Choice
                {
                    Name = c.Name,
                    NumVotes = c.NumVotes
                }).ToList()
            };

            _db.Polls.Add(poll);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPoll), new { pollid = poll.PollId }, newPollDto);
        }

        // POST: /user (Create new user)
        [HttpPost("user")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto newUserDto)
        {
            var user = new User
            {
                FirstName = newUserDto.FirstName,
                LastName = newUserDto.LastName
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { userid = user.UserId }, newUserDto);
        }

        // GET: /user/{userid} (Get user details)
        [HttpGet("user/{userid}")]
        public async Task<ActionResult<UserDto>> GetUser(int userid)
        {
            var user = await _db.Users.FindAsync(userid);
            if (user == null)
                return NotFound();

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName
            };

            return Ok(userDto);
        }

        [HttpDelete("poll/{pollid}")]
        public async Task<IActionResult> DeletePoll(int pollid)
        {
            var poll = await _db.Polls
                .Include(p => p.Choices)
                    .ThenInclude(c => c.Users) // Ensure Users list is loaded
                .FirstOrDefaultAsync(p => p.PollId == pollid);

            if (poll == null)
                return NotFound();

            // Unassign Users from Choices before deleting Choices
            foreach (var choice in poll.Choices)
            {
                foreach (var user in choice.Users)
                {
                    user.ChoiceId = null; // Remove FK reference
                }
            }

            // Save changes before deleting Choices
            await _db.SaveChangesAsync();

            // Remove related Choices
            _db.Choices.RemoveRange(poll.Choices);

            // Remove the Poll
            _db.Polls.Remove(poll);

            await _db.SaveChangesAsync();
            return NoContent();
        }

    }
}