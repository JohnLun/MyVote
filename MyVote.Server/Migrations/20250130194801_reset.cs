using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyVote.Server.Migrations
{
    /// <inheritdoc />
    public partial class reset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Polls_Users_UserId",
                table: "Polls");

            migrationBuilder.DropTable(
                name: "UserChoices");

            migrationBuilder.DropTable(
                name: "UserPolls");

            migrationBuilder.DropIndex(
                name: "IX_Polls_UserId",
                table: "Polls");

            migrationBuilder.AddColumn<int>(
                name: "ChoiceId",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PollId",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "Polls",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ChoiceId",
                table: "Users",
                column: "ChoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Polls_UserId1",
                table: "Polls",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Polls_Users_UserId1",
                table: "Polls",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Choices_ChoiceId",
                table: "Users",
                column: "ChoiceId",
                principalTable: "Choices",
                principalColumn: "ChoiceId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Polls_Users_UserId1",
                table: "Polls");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Choices_ChoiceId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_ChoiceId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Polls_UserId1",
                table: "Polls");

            migrationBuilder.DropColumn(
                name: "ChoiceId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PollId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Polls");

            migrationBuilder.CreateTable(
                name: "UserChoices",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ChoiceId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserChoices", x => new { x.UserId, x.ChoiceId });
                    table.ForeignKey(
                        name: "FK_UserChoices_Choices_ChoiceId",
                        column: x => x.ChoiceId,
                        principalTable: "Choices",
                        principalColumn: "ChoiceId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserChoices_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPolls",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PollId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPolls", x => new { x.UserId, x.PollId });
                    table.ForeignKey(
                        name: "FK_UserPolls_Polls_PollId",
                        column: x => x.PollId,
                        principalTable: "Polls",
                        principalColumn: "PollId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPolls_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Polls_UserId",
                table: "Polls",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChoices_ChoiceId",
                table: "UserChoices",
                column: "ChoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPolls_PollId",
                table: "UserPolls",
                column: "PollId");

            migrationBuilder.AddForeignKey(
                name: "FK_Polls_Users_UserId",
                table: "Polls",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
