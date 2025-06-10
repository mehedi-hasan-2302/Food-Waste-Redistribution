import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInAllProfileModels1749456804109 implements MigrationInterface {
    name = 'ChangeInAllProfileModels1749456804109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DonorSeller" DROP CONSTRAINT "FK_c854e5a20a936960338c622cfad"`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" ALTER COLUMN "UserID" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" DROP CONSTRAINT "FK_70e6729feb728b46fa2d8e8544d"`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" ALTER COLUMN "UserID" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" DROP CONSTRAINT "FK_5489c090253e4d8ced7d719b080"`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" ALTER COLUMN "UserID" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Buyer" DROP CONSTRAINT "FK_a353917c9042ec1013b9c0ec66f"`);
        await queryRunner.query(`ALTER TABLE "Buyer" ALTER COLUMN "UserID" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" DROP CONSTRAINT "FK_1633e8cb64230a794399a3892df"`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" ALTER COLUMN "UserID" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" ADD CONSTRAINT "FK_c854e5a20a936960338c622cfad" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" ADD CONSTRAINT "FK_70e6729feb728b46fa2d8e8544d" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" ADD CONSTRAINT "FK_5489c090253e4d8ced7d719b080" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Buyer" ADD CONSTRAINT "FK_a353917c9042ec1013b9c0ec66f" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" ADD CONSTRAINT "FK_1633e8cb64230a794399a3892df" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" DROP CONSTRAINT "FK_1633e8cb64230a794399a3892df"`);
        await queryRunner.query(`ALTER TABLE "Buyer" DROP CONSTRAINT "FK_a353917c9042ec1013b9c0ec66f"`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" DROP CONSTRAINT "FK_5489c090253e4d8ced7d719b080"`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" DROP CONSTRAINT "FK_70e6729feb728b46fa2d8e8544d"`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" DROP CONSTRAINT "FK_c854e5a20a936960338c622cfad"`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" ALTER COLUMN "UserID" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" ADD CONSTRAINT "FK_1633e8cb64230a794399a3892df" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Buyer" ALTER COLUMN "UserID" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Buyer" ADD CONSTRAINT "FK_a353917c9042ec1013b9c0ec66f" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" ALTER COLUMN "UserID" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" ADD CONSTRAINT "FK_5489c090253e4d8ced7d719b080" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" ALTER COLUMN "UserID" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" ADD CONSTRAINT "FK_70e6729feb728b46fa2d8e8544d" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" ALTER COLUMN "UserID" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" ADD CONSTRAINT "FK_c854e5a20a936960338c622cfad" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
