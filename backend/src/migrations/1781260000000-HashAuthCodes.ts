import { MigrationInterface, QueryRunner } from "typeorm";

export class HashAuthCodes1781260000000 implements MigrationInterface {
    name = 'HashAuthCodes1781260000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "verificationCode" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "passwordResetToken" TYPE character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "passwordResetToken" TYPE character varying`);
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "verificationCode" TYPE character varying(6)`);
    }
}
