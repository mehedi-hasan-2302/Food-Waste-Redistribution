import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInUserTokenValidateFrom1752816886274 implements MigrationInterface {
    name = 'ChangeInUserTokenValidateFrom1752816886274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "TokenValidFrom" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "TokenValidFrom"`);
    }

}
