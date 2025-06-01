import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInOrderModel1748767647249 implements MigrationInterface {
    name = 'ChangeInOrderModel1748767647249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Orders" ADD "FinalPrice" numeric(8,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD "PickupCode" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD CONSTRAINT "UQ_6ede858f78fac739cae697136fa" UNIQUE ("PickupCode")`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD "OrderNotes" text`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD "CreatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD "UpdatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Orders" DROP COLUMN "UpdatedAt"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP COLUMN "CreatedAt"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP COLUMN "OrderNotes"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP CONSTRAINT "UQ_6ede858f78fac739cae697136fa"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP COLUMN "PickupCode"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP COLUMN "FinalPrice"`);
    }

}
