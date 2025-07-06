import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInFoodListingModel1748803297590 implements MigrationInterface {
    name = 'ChangeInFoodListingModel1748803297590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."FoodListings_listingstatus_enum" RENAME TO "FoodListings_listingstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."FoodListings_listingstatus_enum" AS ENUM('ACTIVE', 'CLAIMED', 'EXPIRED', 'REMOVED', 'SOLD', 'CANCELLED', 'COMPLETED', 'PENDING')`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "ListingStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "ListingStatus" TYPE "public"."FoodListings_listingstatus_enum" USING "ListingStatus"::"text"::"public"."FoodListings_listingstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "ListingStatus" SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`DROP TYPE "public"."FoodListings_listingstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."FoodListings_listingstatus_enum_old" AS ENUM('ACTIVE', 'CLAIMED', 'EXPIRED', 'REMOVED')`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "ListingStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "ListingStatus" TYPE "public"."FoodListings_listingstatus_enum_old" USING "ListingStatus"::"text"::"public"."FoodListings_listingstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ALTER COLUMN "ListingStatus" SET DEFAULT 'ACTIVE'`);
        await queryRunner.query(`DROP TYPE "public"."FoodListings_listingstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."FoodListings_listingstatus_enum_old" RENAME TO "FoodListings_listingstatus_enum"`);
    }

}
