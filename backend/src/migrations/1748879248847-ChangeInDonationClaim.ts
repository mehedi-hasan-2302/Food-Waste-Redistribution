import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInDonationClaim1748879248847 implements MigrationInterface {
    name = 'ChangeInDonationClaim1748879248847'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DonationClaims" ADD "PickupCode" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ADD CONSTRAINT "UQ_396982e516131f6580a2da06afb" UNIQUE ("PickupCode")`);
        await queryRunner.query(`ALTER TYPE "public"."DonationClaims_claimstatus_enum" RENAME TO "DonationClaims_claimstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."DonationClaims_claimstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ALTER COLUMN "ClaimStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ALTER COLUMN "ClaimStatus" TYPE "public"."DonationClaims_claimstatus_enum" USING "ClaimStatus"::"text"::"public"."DonationClaims_claimstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ALTER COLUMN "ClaimStatus" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."DonationClaims_claimstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."DonationClaims_claimstatus_enum_old" AS ENUM('APPROVED', 'CANCELLED', 'PENDING', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ALTER COLUMN "ClaimStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ALTER COLUMN "ClaimStatus" TYPE "public"."DonationClaims_claimstatus_enum_old" USING "ClaimStatus"::"text"::"public"."DonationClaims_claimstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ALTER COLUMN "ClaimStatus" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."DonationClaims_claimstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."DonationClaims_claimstatus_enum_old" RENAME TO "DonationClaims_claimstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" DROP CONSTRAINT "UQ_396982e516131f6580a2da06afb"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" DROP COLUMN "PickupCode"`);
    }

}
