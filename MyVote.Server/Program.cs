using Microsoft.EntityFrameworkCore;
using MyVote.Server.Hubs;

namespace MyVote.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder.WithOrigins("https://localhost:5173")
                                      .AllowAnyHeader()
                                      .AllowAnyMethod()
                                      .AllowCredentials()
                                      .SetIsOriginAllowed(_ => true));
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSignalR();

            var environment = builder.Environment.IsProduction() ? "Production" : "Local";
            var connectionString = builder.Configuration.GetConnectionString(environment);

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                if (environment == "Production")
                {
                    options.UseSqlServer(connectionString);
                }
                else
                {
                    options.UseNpgsql(connectionString);
                }
            });

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // ✅ Add UseRouting before anything that relies on routing
            app.UseRouting();

            if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // ✅ Apply CORS before mapping hubs/controllers
            app.UseCors("AllowSpecificOrigin");

            // ✅ Enable WebSockets before SignalR
            app.UseWebSockets();

            // ✅ Map SignalR hub inside routing
            app.UseAuthorization();

            app.MapHub<VoteHub>("/voteHub");

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
