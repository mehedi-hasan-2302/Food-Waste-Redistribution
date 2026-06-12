import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatTables1781261000000 implements MigrationInterface {
    name = 'AddChatTables1781261000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ChatConversations" ("ConversationID" SERIAL NOT NULL, "CreatedAt" TIMESTAMP NOT NULL DEFAULT now(), "UpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ParticipantOneUserID" integer NOT NULL, "ParticipantTwoUserID" integer NOT NULL, CONSTRAINT "UQ_ChatConversations_participants" UNIQUE ("ParticipantOneUserID", "ParticipantTwoUserID"), CONSTRAINT "PK_ChatConversations" PRIMARY KEY ("ConversationID"))`);
        await queryRunner.query(`CREATE TABLE "ChatMessages" ("MessageID" SERIAL NOT NULL, "Message" text NOT NULL, "IsRead" boolean NOT NULL DEFAULT false, "CreatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ConversationID" integer NOT NULL, "SenderUserID" integer NOT NULL, "RecipientUserID" integer NOT NULL, CONSTRAINT "PK_ChatMessages" PRIMARY KEY ("MessageID"))`);
        await queryRunner.query(`ALTER TABLE "ChatConversations" ADD CONSTRAINT "FK_ChatConversations_participant_one" FOREIGN KEY ("ParticipantOneUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ChatConversations" ADD CONSTRAINT "FK_ChatConversations_participant_two" FOREIGN KEY ("ParticipantTwoUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ChatMessages" ADD CONSTRAINT "FK_ChatMessages_conversation" FOREIGN KEY ("ConversationID") REFERENCES "ChatConversations"("ConversationID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ChatMessages" ADD CONSTRAINT "FK_ChatMessages_sender" FOREIGN KEY ("SenderUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ChatMessages" ADD CONSTRAINT "FK_ChatMessages_recipient" FOREIGN KEY ("RecipientUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE INDEX "IDX_ChatMessages_conversation_created" ON "ChatMessages" ("ConversationID", "CreatedAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_ChatMessages_conversation_created"`);
        await queryRunner.query(`ALTER TABLE "ChatMessages" DROP CONSTRAINT "FK_ChatMessages_recipient"`);
        await queryRunner.query(`ALTER TABLE "ChatMessages" DROP CONSTRAINT "FK_ChatMessages_sender"`);
        await queryRunner.query(`ALTER TABLE "ChatMessages" DROP CONSTRAINT "FK_ChatMessages_conversation"`);
        await queryRunner.query(`ALTER TABLE "ChatConversations" DROP CONSTRAINT "FK_ChatConversations_participant_two"`);
        await queryRunner.query(`ALTER TABLE "ChatConversations" DROP CONSTRAINT "FK_ChatConversations_participant_one"`);
        await queryRunner.query(`DROP TABLE "ChatMessages"`);
        await queryRunner.query(`DROP TABLE "ChatConversations"`);
    }
}
