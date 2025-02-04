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

        [HttpGet("track")]
        public IActionResult TrackUser()
        {
            var existingCookie = Request.Cookies["user_id"];

            if (!string.IsNullOrEmpty(existingCookie))
            {
                var existingUser = _db.Users.FirstOrDefault(u => u.LastName == existingCookie);

                if (existingUser != null)
                {
                    return Ok(new { message = "Existing user found", userId = existingUser.UserId });
                }
            }

            string newUserCookie = Guid.NewGuid().ToString();

            var newUser = new User
            {
                FirstName = "Guest", 
                LastName = newUserCookie,
            };

            _db.Users.Add(newUser);
            _db.SaveChanges();

      
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddYears(1)
            };

            Response.Cookies.Append("user_id", newUserCookie, cookieOptions);

            return Ok(new { message = "New user tracked", userId = newUser.UserId });
        }

        [HttpGet("polls/{userId}")]
        public async Task<ActionResult<IEnumerable<Poll>>> GetPollsByUser(int userId)
        {
            // Polls where the user has voted (through Choices)
            var votedPolls = await _db.Choices
                .Where(c => c.Users.Any(u => u.UserId == userId))
                .Select(c => c.Poll)
                .Distinct()
                .ToListAsync();

            // Polls created by the user
            var createdPolls = await _db.Polls
                .Where(p => p.UserId == userId)
                .ToListAsync();

            // Combine and remove duplicates
            var allPolls = votedPolls.Concat(createdPolls).Distinct().ToList();

            if (allPolls.Count == 0)
            {
                return NotFound(new { message = "No polls found for this user." });
            }

            return Ok(allPolls);
        }



        // GET: /polls (Get all active polls)
        //[HttpGet("polls")]
        //public async Task<ActionResult<IEnumerable<Poll>>> GetActivePolls()
        //{
        //    var polls = await _db.Polls
        //        .Where(p => p.IsActive=="t")
        //        .Include(p => p.Choices)
        //        .ToListAsync();

        //    var pollDtos = polls.Select(p => new PollDto
        //    {
        //        PollId = p.PollId,
        //        Title = p.Title,
        //        Description = p.Description,
        //        TimeLimit = p.TimeLimit,
        //        IsActive = p.IsActive,
        //        Choices = p.Choices.Select(c => new ChoiceDto
        //        {
        //            ChoiceId = c.ChoiceId,
        //            Name = c.Name,
        //            NumVotes = c.NumVotes
        //        }).ToList()
        //    }).ToList();

        //    return Ok(pollDtos);
        //}

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

        [HttpPatch("vote")]
        public async Task<IActionResult> UpdateChoice([FromBody] VoteDto voteDto)
        {
            // Ensure the choice exists in the database
            var choice = await _db.Choices
                .Include(c => c.Poll) // Include the Poll reference
                .Include(c => c.Users) // Include users who voted for the choice
                .FirstOrDefaultAsync(c => c.ChoiceId == voteDto.ChoiceId);

            if (choice == null)
            {
                return NotFound("Choice not found.");
            }

            // Ensure the user exists in the database
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserId == voteDto.UserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Check if the user has already voted in this poll
            bool hasVoted = await _db.Choices
                .Where(c => c.PollId == choice.PollId) // Get all choices in the same poll
                .AnyAsync(c => c.Users.Any(u => u.UserId == voteDto.UserId)); // Check if user exists in any choice

            if (hasVoted)
            {
                return BadRequest(new { message = "User has already voted in this poll.", hasVoted = true });
            }

            // Add the user to the selected choice's Users list and increase the choice's vote count
            choice.Users.Add(user);
            choice.NumVotes++;

            // Save changes to the database
            await _db.SaveChangesAsync();

            return Ok(new { message = "Vote submitted successfully!", hasVoted = false });
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