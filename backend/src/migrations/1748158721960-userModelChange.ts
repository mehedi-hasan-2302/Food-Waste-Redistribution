import { MigrationInterface, QueryRunner } from "typeorm";

export class UserModelChange1748158721960 implements MigrationInterface {
    name = 'UserModelChange1748158721960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "verificationCodeExpires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "verificationCode"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "verificationCode" character varying(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "verificationCode"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "verificationCode" character varying`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "verificationCodeExpires"`);
    }

}
