using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TabletopMatch.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationReadStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Messages_ConversationId_Id",
                table: "Messages");

            migrationBuilder.AddColumn<long>(
                name: "LastReadMessageId",
                table: "ConversationParticipants",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Messages_ConversationId_Id",
                table: "Messages",
                columns: new[] { "ConversationId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_ConversationId_LastReadMessageId",
                table: "ConversationParticipants",
                columns: new[] { "ConversationId", "LastReadMessageId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationParticipants_Messages_ConversationId_LastReadMe~",
                table: "ConversationParticipants",
                columns: new[] { "ConversationId", "LastReadMessageId" },
                principalTable: "Messages",
                principalColumns: new[] { "ConversationId", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversationParticipants_Messages_ConversationId_LastReadMe~",
                table: "ConversationParticipants");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Messages_ConversationId_Id",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_ConversationParticipants_ConversationId_LastReadMessageId",
                table: "ConversationParticipants");

            migrationBuilder.DropColumn(
                name: "LastReadMessageId",
                table: "ConversationParticipants");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId_Id",
                table: "Messages",
                columns: new[] { "ConversationId", "Id" });
        }
    }
}
