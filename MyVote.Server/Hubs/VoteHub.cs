using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MyVote.Server.Hubs
{
    public class VoteHub : Hub
    {
        public async Task SendVoteUpdate(object updatedPoll)
        {
            await Clients.All.SendAsync("ReceiveVoteUpdate", updatedPoll);
        }
    }
}
