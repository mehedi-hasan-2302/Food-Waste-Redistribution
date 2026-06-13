import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderPaymentMethod1781262000000 implements MigrationInterface {
    name = 'AddOrderPaymentMethod1781262000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Orders_paymentmethod_enum" AS ENUM('PAY_ON_DELIVERY', 'PAY_ON_PICKUP')`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD "PaymentMethod" "public"."Orders_paymentmethod_enum" NOT NULL DEFAULT 'PAY_ON_DELIVERY'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Orders" DROP COLUMN "PaymentMethod"`);
        await queryRunner.query(`DROP TYPE "public"."Orders_paymentmethod_enum"`);
    }
}
