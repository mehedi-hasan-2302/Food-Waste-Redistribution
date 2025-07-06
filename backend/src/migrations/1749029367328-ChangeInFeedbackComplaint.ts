import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInFeedbackComplaint1749029367328 implements MigrationInterface {
    name = 'ChangeInFeedbackComplaint1749029367328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD "AdminNotes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP COLUMN "AdminNotes"`);
    }

}
