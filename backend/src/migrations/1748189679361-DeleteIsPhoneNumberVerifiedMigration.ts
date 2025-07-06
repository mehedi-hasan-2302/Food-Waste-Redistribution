import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteIsPhoneNumberVerifiedMigration1748189679361 implements MigrationInterface {
    name = 'DeleteIsPhoneNumberVerifiedMigration1748189679361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DonorSeller" DROP COLUMN "IsPhoneVerified"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DonorSeller" ADD "IsPhoneVerified" boolean NOT NULL DEFAULT false`);
    }

}
