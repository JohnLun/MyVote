using Xunit;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyVote.Server.Controllers;
using MyVote.Server.Models;
using MyVote.Server.Dtos;
using System.Threading.Tasks;

public class UserControllerTests
{
    private readonly MyVoteController _controller;
    private readonly AppDbContext _dbContext;

    public UserControllerTests()
    {
        // Set up in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("TestDatabase") 
            .Options;


        _dbContext = new AppDbContext(options);
        _controller = new MyVoteController(new NullLogger<MyVoteController>(), _dbContext);


        _dbContext.Database.EnsureCreated();
        _dbContext.Polls.RemoveRange(_dbContext.Polls);
        _dbContext.Users.RemoveRange(_dbContext.Users);
        _dbContext.SaveChanges();
    }

    [Fact]
    public async Task GetUser_ReturnsUser_WhenUserExists()
    {
        // Arrange: Add a test user
        var testUser = new User { UserId = 1, FirstName = "John", LastName = "Doe" };
        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        // Act: Call the API method
        var result = await _controller.GetUser(1);

        // Assert: Ensure we get the correct user
        var actionResult = Assert.IsType<ActionResult<UserDto>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var userDto = Assert.IsType<UserDto>(okResult.Value);

        Assert.Equal(1, userDto.UserId);
        Assert.Equal("John", userDto.FirstName);
        Assert.Equal("Doe", userDto.LastName);
    }


    [Fact]
    public async Task GetUser_ReturnsNotFound_WhenUserDoesNotExist()
    {
        // Act
        var result = await _controller.GetUser(99); // Non-existent user

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task CreateUser_ReturnsCreatedAtAction_WhenUserIsCreated()
    {
        // Arrange
        var newUser = new CreateUserDto { FirstName = "Alice", LastName = "Smith" };

        // Act
        var result = await _controller.CreateUser(newUser);

        // Assert
        var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(_controller.GetUser), createdAtActionResult.ActionName);
    }

    [Fact]
    public async Task GetPollsByUser_ReturnsPolls_WhenUserHasVotedOrCreatedPolls()
    {
        // Arrange
        var user = new User { UserId = 1, FirstName = "John", LastName = "Doe" };
        var poll1 = new Poll { PollId = 1, Title = "Poll 1", UserId = 1 };
        var poll2 = new Poll { PollId = 2, Title = "Poll 2", UserId = 1 };

        _dbContext.Users.Add(user);
        _dbContext.Polls.AddRange(poll1, poll2);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _controller.GetPollsByUser(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var polls = Assert.IsType<List<Poll>>(okResult.Value);
        Assert.Equal(2, polls.Count);
    }

    [Fact]
    public async Task GetPollsByUser_ReturnsNotFound_WhenUserHasNoPolls()
    {
        // Act
        var result = await _controller.GetPollsByUser(99); // User with no polls

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);

        // Use dynamic or match anonymous object
        var response = notFoundResult.Value;
        Assert.NotNull(response);
        Assert.Equal("No polls found for this user.", response.GetType().GetProperty("message")?.GetValue(response, null));
    }



    [Fact]
    public async Task EndPoll_ReturnsNotFound_WhenPollDoesNotExist()
    {
        // Act
        var result = await _controller.EndPoll(99); // Non-existent poll

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var response = notFoundResult.Value;

        Assert.NotNull(response);
        Assert.Equal("Poll not found.", response.GetType().GetProperty("message")?.GetValue(response, null));
    }


    [Fact]
    public async Task UpdateStatus_SetsPollToInactive_WhenExpired()
    {
        // Arrange
        var poll = new Poll { PollId = 1, Title = "Expired Poll", DateEnded = System.DateTime.UtcNow.AddDays(-1), IsActive = "t" };
        _dbContext.Polls.Add(poll);
        await _dbContext.SaveChangesAsync();

        // Act
        await _controller.UpdateStatus(poll);

        // Assert
        var updatedPoll = await _dbContext.Polls.FindAsync(1);
        Assert.Equal("f", updatedPoll.IsActive);
    }
}
