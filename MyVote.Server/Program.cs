//vc test


using Microsoft.EntityFrameworkCore;

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
                                      .AllowAnyMethod());
            });


            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var environment = builder.Environment.IsProduction() ? "Production" : "Local";
            var connectionString = builder.Configuration.GetConnectionString("Local");

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                //options.UseSqlServer(connectionString);
                options.UseNpgsql(connectionString);
            });

            //builder.Services.AddDbContext<AppDbContext>(options =>
            //    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.UseCors("AllowSpecificOrigin");

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
