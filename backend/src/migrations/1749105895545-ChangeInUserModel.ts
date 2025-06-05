import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInUserModel1749105895545 implements MigrationInterface {
    name = 'ChangeInUserModel1749105895545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "isProfileComplete" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "isProfileComplete"`);
    }

}
