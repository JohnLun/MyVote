﻿using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyVote.Server.Migrations
{
    /// <inheritdoc />
    public partial class TestingLocal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Choices",
                columns: table => new
                {
                    ChoiceId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NumVotes = table.Column<int>(type: "integer", nullable: false),
                    PollId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Choices", x => x.ChoiceId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    PollId = table.Column<int>(type: "integer", nullable: true),
                    ChoiceId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_Choices_ChoiceId",
                        column: x => x.ChoiceId,
                        principalTable: "Choices",
                        principalColumn: "ChoiceId");
                });

            migrationBuilder.CreateTable(
                name: "Polls",
                columns: table => new
                {
                    PollId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TimeLimit = table.Column<float>(type: "real", nullable: false),
                    IsActive = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Polls", x => x.PollId);
                    table.ForeignKey(
                        name: "FK_Polls_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserChoice",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ChoiceId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserChoice", x => new { x.UserId, x.ChoiceId });
                    table.ForeignKey(
                        name: "FK_UserChoice_Choices_ChoiceId",
                        column: x => x.ChoiceId,
                        principalTable: "Choices",
                        principalColumn: "ChoiceId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserChoice_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserPoll",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PollId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPoll", x => new { x.UserId, x.PollId });
                    table.ForeignKey(
                        name: "FK_UserPoll_Polls_PollId",
                        column: x => x.PollId,
                        principalTable: "Polls",
                        principalColumn: "PollId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserPoll_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Choices_PollId",
                table: "Choices",
                column: "PollId");

            migrationBuilder.CreateIndex(
                name: "IX_Polls_UserId",
                table: "Polls",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChoice_ChoiceId",
                table: "UserChoice",
                column: "ChoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPoll_PollId",
                table: "UserPoll",
                column: "PollId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ChoiceId",
                table: "Users",
                column: "ChoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Choices_Polls_PollId",
                table: "Choices",
                column: "PollId",
                principalTable: "Polls",
                principalColumn: "PollId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Choices_Polls_PollId",
                table: "Choices");

            migrationBuilder.DropTable(
                name: "UserChoice");

            migrationBuilder.DropTable(
                name: "UserPoll");

            migrationBuilder.DropTable(
                name: "Polls");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Choices");
        }
    }
}
