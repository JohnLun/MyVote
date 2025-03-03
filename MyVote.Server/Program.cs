using Microsoft.EntityFrameworkCore;
using MyVote.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Azure.SignalR;

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
           
            var environment = builder.Environment.IsProduction() ? "Production" : "Local";
            var connectionString = builder.Configuration.GetConnectionString(environment);

            if (environment == "Production")
            {
                builder.Services.AddSignalR().AddAzureSignalR(options =>
                {
                    options.ConnectionString = builder.Configuration["ConnectionStrings:AzureSignalR"];
                });
            }
            else
            {
                builder.Services.AddSignalR();
            }

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

            if (environment == "Production")
{
    builder.Services.AddSignalR().AddAzureSignalR(options =>
    {
        options.ConnectionString = builder.Configuration["ConnectionStrings:AzureSignalR"];
    });
}
else
{
    builder.Services.AddSignalR(); // Use in-app SignalR
}

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();

            if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowSpecificOrigin");

            app.UseWebSockets();

            app.UseAuthorization();

            app.MapHub<GlobalHub>("/globalHub");

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
