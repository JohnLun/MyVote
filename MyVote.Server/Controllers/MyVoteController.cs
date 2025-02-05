﻿using Microsoft.AspNetCore.Cors;
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
            // Polls where the user has voted (via UserChoices)
            var votedPolls = await _db.UserChoices
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.Choice.Poll)
                .Distinct()
                .ToListAsync();

            // Polls created by the user
            var createdPolls = await _db.Polls
                .Where(p => p.UserId == userId)
                .ToListAsync();

            // Combine and remove duplicates
            var allPolls = votedPolls.Concat(createdPolls).Distinct().ToList();

            if (!allPolls.Any())
            {
                return NotFound(new { message = "No polls found for this user." });
            }

            return Ok(allPolls);
        }

        [HttpGet("polls/voted/{userId}")]
        public async Task<ActionResult<IEnumerable<Poll>>> GetVotedPolls(int userId)
        {
            var votedPolls = await _db.UserChoices
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.Choice.Poll)
                .Distinct()
                .ToListAsync();

            if (!votedPolls.Any())
            {
                return NotFound(new { message = "No polls found that the user voted on." });
            }

            return Ok(votedPolls);
        }

        [HttpGet("polls/owned/{userId}")]
        public async Task<ActionResult<IEnumerable<Poll>>> GetOwnedPolls(int userId)
        {
            var createdPolls = await _db.Polls
                .Where(p => p.UserId == userId)
                .ToListAsync();

            if (!createdPolls.Any())
            {
                return NotFound(new { message = "No polls found that the user owns." });
            }

            return Ok(createdPolls);
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

        [HttpGet("poll/{pollid}")]
        public async Task<ActionResult<PollDto>> GetPoll(int pollid)
        {
            var poll = await _db.Polls
                .Include(p => p.Choices)
                    .ThenInclude(c => c.UserChoices) // Include UserChoices to retrieve UserId
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
                    NumVotes = c.NumVotes,
                    UserIds = c.UserChoices.Select(uc => uc.UserId).ToList() // Extract UserIds
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

            // Check if the user has already voted in any choice within this poll
            bool hasVoted = await _db.UserChoices
                .AnyAsync(uc => uc.UserId == voteDto.UserId && uc.Choice.PollId == choice.PollId);

            if (hasVoted)
            {
                return BadRequest(new { message = "User has already voted in this poll." });
            }

            // Create a new UserChoice entry to record the vote
            var userChoice = new UserChoice
            {
                UserId = voteDto.UserId,
                ChoiceId = voteDto.ChoiceId
            };

            _db.UserChoices.Add(userChoice);

            // Increase the choice's vote count
            choice.NumVotes++;

            // Save changes to the database
            await _db.SaveChangesAsync();

            return Ok(new { message = "Vote submitted successfully!" });
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

            return CreatedAtAction(nameof(GetPoll), new { pollid = poll.PollId }, pollDto);
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
                    .ThenInclude(c => c.UserChoices) // Include UserChoices instead of Users
                .FirstOrDefaultAsync(p => p.PollId == pollid);

            if (poll == null)
                return NotFound();

            // Remove all UserChoices associated with the poll's choices
            var userChoicesToRemove = _db.UserChoices.Where(uc => poll.Choices.Select(c => c.ChoiceId).Contains(uc.ChoiceId));
            _db.UserChoices.RemoveRange(userChoicesToRemove);

            // Remove related Choices
            _db.Choices.RemoveRange(poll.Choices);

            // Remove the Poll
            _db.Polls.Remove(poll);

            await _db.SaveChangesAsync();
            return NoContent();
        }


    }
}