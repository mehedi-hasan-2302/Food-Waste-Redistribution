import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInNotificationModel1749108279732 implements MigrationInterface {
    name = 'ChangeInNotificationModel1749108279732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Notifications" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Notifications" DROP COLUMN "createdAt"`);
    }

}
