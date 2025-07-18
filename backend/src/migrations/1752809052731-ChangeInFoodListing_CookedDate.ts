import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInFoodListingCookedDate1752809052731 implements MigrationInterface {
    name = 'ChangeInFoodListingCookedDate1752809052731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "FoodListings" SET "CookedDate" = CURRENT_TIMESTAMP WHERE "CookedDate" IS NULL`);
        
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "CookedDate" TYPE TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "CookedDate" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "CookedDate" TYPE date`);
    }

}
