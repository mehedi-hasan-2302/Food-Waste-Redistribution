import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInFoodListing1748362043865 implements MigrationInterface {
    name = 'ChangeInFoodListing1748362043865'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD "Quantity" character varying`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD "DietaryInfo" character varying`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD "ImagePublicId" character varying`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD "CreatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD "PickupWindowEnd" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD "PickupLocation" character varying(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP COLUMN "PickupLocation"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP COLUMN "PickupWindowEnd"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP COLUMN "CreatedAt"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP COLUMN "ImagePublicId"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP COLUMN "DietaryInfo"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP COLUMN "Quantity"`);
    }

}
