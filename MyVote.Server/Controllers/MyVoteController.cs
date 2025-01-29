using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Poll>>> GetActivePolls()
        {
            return await _db.Polls
                .Where(p => p.IsActive)
                .Include(p => p.Choices)
                .ToListAsync();
        }

         // GET: /poll/{pollid} (Get poll details)
        [HttpGet("{pollid}")]
        public async Task<ActionResult<Poll>> GetPoll(int pollid)
        {
            var poll = await _db.Polls
                .Include(p => p.Choices)
                .FirstOrDefaultAsync(p => p.PollId == pollid);

            if (poll == null)
                return NotFound();

            return poll;
        }

         // GET: /choices/{pollid} (Get choices for a poll)
        [HttpGet("choices/{pollid}")]
        public async Task<ActionResult<IEnumerable<Choice>>> GetPollChoices(int pollid)
        {
            var choices = await _db.Choices
                .Where(c => c.PollId == pollid)
                .ToListAsync();

            return choices.Any() ? Ok(choices) : NotFound();
        }

           // GET: /votedpolls/{userid} (Get polls a user has voted in)
            [HttpGet("votedpolls/{userid}")]
            public async Task<ActionResult<IEnumerable<Poll>>> GetVotedPolls(int userid)
            {
                var votedPolls = await _db.UserPolls
                    .Where(up => up.UserId == userid)
                    .Select(up => up.Poll)
                    .Include(p => p.Choices)
                    .ToListAsync();

                return Ok(votedPolls);
            }

             // GET: /createdpolls/{userid} (Get polls created by a user)
    [HttpGet("createdpolls/{userid}")]
    public async Task<ActionResult<IEnumerable<Poll>>> GetCreatedPolls(int userid)
    {
        var createdPolls = await _db.Polls
            .Where(p => p.UserId == userid)
            .Include(p => p.Choices)
            .ToListAsync();

        return Ok(createdPolls);
    }

    // PATCH: /choice/{choiceid} (Update choice)
    [HttpPatch("choice/{choiceid}")]
    public async Task<IActionResult> UpdateChoice(int choiceid, [FromBody] Choice updatedChoice)
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
    public async Task<IActionResult> UpdatePoll([FromBody] Poll updatedPoll)
    {
        var poll = await _db.Polls.FindAsync(updatedPoll.PollId);
        if (poll == null)
            return NotFound();

        poll.Title = updatedPoll.Title ?? poll.Title;
        poll.Description = updatedPoll.Description ?? poll.Description;
        poll.TimeLimit = updatedPoll.TimeLimit;
        poll.IsActive = updatedPoll.IsActive;

        _db.Polls.Update(poll);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // PUT: /user (Update user)
    [HttpPut("user")]
    public async Task<IActionResult> UpdateUser([FromBody] User updatedUser)
    {
        var user = await _db.Users.FindAsync(updatedUser.UserId);
        if (user == null)
            return NotFound();

        user.FirstName = updatedUser.FirstName ?? user.FirstName;
        user.LastName = updatedUser.LastName ?? user.LastName;

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