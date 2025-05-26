import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1748102866395 implements MigrationInterface {
    name = 'InitSchema1748102866395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "DonorSeller" ("ProfileID" SERIAL NOT NULL, "BusinessName" character varying(150) NOT NULL, "IsPhoneVerified" boolean NOT NULL DEFAULT false, "UserID" integer, CONSTRAINT "REL_c854e5a20a936960338c622cfa" UNIQUE ("UserID"), CONSTRAINT "PK_b349844a1f0e7c46fe7776b81c1" PRIMARY KEY ("ProfileID"))`);
        await queryRunner.query(`CREATE TABLE "OrganizationVolunteers" ("OrgVolunteerID" SERIAL NOT NULL, "VolunteerName" character varying NOT NULL, "VolunteerContactPhone" character varying NOT NULL, "IsActive" boolean NOT NULL DEFAULT true, "CharityOrgID" integer, "UserID" integer, CONSTRAINT "REL_70e6729feb728b46fa2d8e8544" UNIQUE ("UserID"), CONSTRAINT "PK_93c91a2607cad146cdd43719a0a" PRIMARY KEY ("OrgVolunteerID"))`);
        await queryRunner.query(`CREATE TABLE "CharityOrganization" ("ProfileID" SERIAL NOT NULL, "OrganizationName" character varying(150) NOT NULL, "GovRegistrationDocPath" character varying NOT NULL, "IsDocVerifiedByAdmin" boolean NOT NULL DEFAULT false, "AddressLine1" character varying(200) NOT NULL, "UserID" integer, CONSTRAINT "REL_5489c090253e4d8ced7d719b08" UNIQUE ("UserID"), CONSTRAINT "PK_9a1a74fa333c8ee7e164631b72f" PRIMARY KEY ("ProfileID"))`);
        await queryRunner.query(`CREATE TABLE "Buyer" ("ProfileID" SERIAL NOT NULL, "DefaultDeliveryAddress" text NOT NULL, "UserID" integer, CONSTRAINT "REL_a353917c9042ec1013b9c0ec66" UNIQUE ("UserID"), CONSTRAINT "PK_105946f0bad7dcbb5edb613f92c" PRIMARY KEY ("ProfileID"))`);
        await queryRunner.query(`CREATE TABLE "IndependentDelivery" ("ProfileID" SERIAL NOT NULL, "FullName" character varying NOT NULL, "SelfiePath" character varying NOT NULL, "NIDPath" character varying NOT NULL, "IsIDVerifiedByAdmin" boolean NOT NULL DEFAULT false, "OperatingAreas" json NOT NULL, "CurrentRating" numeric(3,2) NOT NULL DEFAULT '0', "UserID" integer, CONSTRAINT "REL_1633e8cb64230a794399a3892d" UNIQUE ("UserID"), CONSTRAINT "PK_7763aee976d2aa4dbed8a1f3a42" PRIMARY KEY ("ProfileID"))`);
        await queryRunner.query(`CREATE TYPE "public"."DonationClaims_claimstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."DonationClaims_deliverytype_enum" AS ENUM('SELF_PICKUP', 'HOME_DELIVERY')`);
        await queryRunner.query(`CREATE TABLE "DonationClaims" ("ClaimID" SERIAL NOT NULL, "ClaimStatus" "public"."DonationClaims_claimstatus_enum" NOT NULL DEFAULT 'PENDING', "DeliveryType" "public"."DonationClaims_deliverytype_enum" NOT NULL, "CharityOrgUserID" integer, "DonorUserID" integer, "ListingID" integer, CONSTRAINT "PK_c8b569be4010cc9f16b946cc256" PRIMARY KEY ("ClaimID"))`);
        await queryRunner.query(`CREATE TYPE "public"."Deliveries_deliverypersonneltype_enum" AS ENUM('INDEPENDENT', 'ORG_VOLUNTEER')`);
        await queryRunner.query(`CREATE TYPE "public"."Deliveries_deliverystatus_enum" AS ENUM('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "Deliveries" ("DeliveryID" SERIAL NOT NULL, "DeliveryPersonnelType" "public"."Deliveries_deliverypersonneltype_enum" NOT NULL, "DeliveryStatus" "public"."Deliveries_deliverystatus_enum" NOT NULL DEFAULT 'SCHEDULED', "OrderID" integer, "ClaimID" integer, "IndependentDeliveryUserID" integer, "OrganizationVolunteerID" integer, CONSTRAINT "REL_ee35a658e08617e88d9b44a9a3" UNIQUE ("OrderID"), CONSTRAINT "REL_a1f408e14afa0b167e903a8dc6" UNIQUE ("ClaimID"), CONSTRAINT "PK_03b610e46b82b621f2dd276b95b" PRIMARY KEY ("DeliveryID"))`);
        await queryRunner.query(`CREATE TYPE "public"."Orders_orderstatus_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."Orders_paymentstatus_enum" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED')`);
        await queryRunner.query(`CREATE TYPE "public"."Orders_deliverytype_enum" AS ENUM('SELF_PICKUP', 'HOME_DELIVERY')`);
        await queryRunner.query(`CREATE TABLE "Orders" ("OrderID" SERIAL NOT NULL, "DeliveryFee" numeric(8,2) NOT NULL, "OrderStatus" "public"."Orders_orderstatus_enum" NOT NULL DEFAULT 'PENDING', "PaymentStatus" "public"."Orders_paymentstatus_enum" NOT NULL DEFAULT 'PENDING', "DeliveryType" "public"."Orders_deliverytype_enum" NOT NULL, "DeliveryAddress" text NOT NULL, "BuyerUserID" integer, "SellerUserID" integer, "ListingID" integer, CONSTRAINT "PK_55f8443f4d79e9a848cf42b69d9" PRIMARY KEY ("OrderID"))`);
        await queryRunner.query(`CREATE TYPE "public"."FoodListings_listingstatus_enum" AS ENUM('ACTIVE', 'CLAIMED', 'EXPIRED', 'REMOVED')`);
        await queryRunner.query(`CREATE TABLE "FoodListings" ("ListingID" SERIAL NOT NULL, "Title" character varying(150) NOT NULL, "Description" text NOT NULL, "FoodType" character varying NOT NULL, "CookedDate" date NOT NULL, "PickupWindowStart" TIMESTAMP NOT NULL, "IsDonation" boolean NOT NULL DEFAULT true, "Price" numeric(8,2), "ListingStatus" "public"."FoodListings_listingstatus_enum" NOT NULL DEFAULT 'ACTIVE', "ImagePath" character varying, "DonorSellerUserID" integer, CONSTRAINT "PK_deb74355faa066228470751af33" PRIMARY KEY ("ListingID"))`);
        await queryRunner.query(`CREATE TYPE "public"."FeedbackComplaints_feedbacktype_enum" AS ENUM('REVIEW', 'COMPLAINT', 'RATING')`);
        await queryRunner.query(`CREATE TYPE "public"."FeedbackComplaints_adminactionstatus_enum" AS ENUM('PENDING', 'RESOLVED', 'DISMISSED')`);
        await queryRunner.query(`CREATE TABLE "FeedbackComplaints" ("FeedbackID" SERIAL NOT NULL, "FeedbackType" "public"."FeedbackComplaints_feedbacktype_enum" NOT NULL, "RatingValue" double precision, "Message" text, "AdminActionStatus" "public"."FeedbackComplaints_adminactionstatus_enum" NOT NULL DEFAULT 'PENDING', "SubmitterUserID" integer, "RegardingUserID" integer, "ListingID" integer, "OrderID" integer, "ClaimID" integer, "DeliveryID" integer, CONSTRAINT "PK_2a29182a8bd8594d458d7eaa4bb" PRIMARY KEY ("FeedbackID"))`);
        await queryRunner.query(`CREATE TYPE "public"."Notifications_notificationtype_enum" AS ENUM('NEW_LISTING', 'EXPIRY_ALERT', 'CLAIM_UPDATE', 'ORDER_UPDATE', 'DELIVERY_UPDATE', 'FEEDBACK_REQUEST')`);
        await queryRunner.query(`CREATE TABLE "Notifications" ("NotificationID" SERIAL NOT NULL, "NotificationType" "public"."Notifications_notificationtype_enum" NOT NULL, "Message" text NOT NULL, "ReferenceID" integer, "IsRead" boolean NOT NULL DEFAULT false, "RecipientUserID" integer, CONSTRAINT "PK_154d7b725af89120f01920f4b6f" PRIMARY KEY ("NotificationID"))`);
        await queryRunner.query(`CREATE TYPE "public"."Users_role_enum" AS ENUM('DONOR_SELLER', 'CHARITY_ORG', 'BUYER', 'INDEP_DELIVERY', 'ORG_VOLUNTEER', 'ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."Users_accountstatus_enum" AS ENUM('ACTIVE', 'CLOSED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "Users" ("UserID" SERIAL NOT NULL, "Username" character varying(100) NOT NULL, "PasswordHash" character varying NOT NULL, "Email" character varying NOT NULL, "PhoneNumber" character varying, "Role" "public"."Users_role_enum" NOT NULL, "RegistrationDate" TIMESTAMP NOT NULL DEFAULT now(), "IsEmailVerified" boolean NOT NULL DEFAULT false, "verificationCode" character varying, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP, "AccountStatus" "public"."Users_accountstatus_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "UQ_884fdf47515c24dbbf6d89c2d84" UNIQUE ("Email"), CONSTRAINT "PK_fe45fe4ee5317851eb4746a23d8" PRIMARY KEY ("UserID"))`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" ADD CONSTRAINT "FK_c854e5a20a936960338c622cfad" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" ADD CONSTRAINT "FK_405f7325410f3fe2c6609d0f5cc" FOREIGN KEY ("CharityOrgID") REFERENCES "CharityOrganization"("ProfileID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" ADD CONSTRAINT "FK_70e6729feb728b46fa2d8e8544d" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" ADD CONSTRAINT "FK_5489c090253e4d8ced7d719b080" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Buyer" ADD CONSTRAINT "FK_a353917c9042ec1013b9c0ec66f" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" ADD CONSTRAINT "FK_1633e8cb64230a794399a3892df" FOREIGN KEY ("UserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ADD CONSTRAINT "FK_37f0e0ee8f36b857e5568bc39d2" FOREIGN KEY ("CharityOrgUserID") REFERENCES "Users"("UserID") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ADD CONSTRAINT "FK_9826bb141a2cc798ee62cc8e388" FOREIGN KEY ("DonorUserID") REFERENCES "Users"("UserID") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" ADD CONSTRAINT "FK_7ec4466faee6b85b2aa2d40f7be" FOREIGN KEY ("ListingID") REFERENCES "FoodListings"("ListingID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Deliveries" ADD CONSTRAINT "FK_ee35a658e08617e88d9b44a9a37" FOREIGN KEY ("OrderID") REFERENCES "Orders"("OrderID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Deliveries" ADD CONSTRAINT "FK_a1f408e14afa0b167e903a8dc63" FOREIGN KEY ("ClaimID") REFERENCES "DonationClaims"("ClaimID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Deliveries" ADD CONSTRAINT "FK_916b95e5252cdd0c06043d08c57" FOREIGN KEY ("IndependentDeliveryUserID") REFERENCES "Users"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Deliveries" ADD CONSTRAINT "FK_b5ca8864c18a5ff414e01e2b28b" FOREIGN KEY ("OrganizationVolunteerID") REFERENCES "OrganizationVolunteers"("OrgVolunteerID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD CONSTRAINT "FK_22eeb1f85db6e5e82445cf07e71" FOREIGN KEY ("BuyerUserID") REFERENCES "Users"("UserID") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD CONSTRAINT "FK_cc28ac70c3826cac9d742743cb6" FOREIGN KEY ("SellerUserID") REFERENCES "Users"("UserID") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Orders" ADD CONSTRAINT "FK_ba25bee3b8756a87618809b6547" FOREIGN KEY ("ListingID") REFERENCES "FoodListings"("ListingID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FoodListings" ADD CONSTRAINT "FK_7f8fddbd051ad0c6fb6b983aa93" FOREIGN KEY ("DonorSellerUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD CONSTRAINT "FK_8e394a0a8715a9dd4e74470c3c5" FOREIGN KEY ("SubmitterUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD CONSTRAINT "FK_44828b9a4a1985ed59a1196190d" FOREIGN KEY ("RegardingUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD CONSTRAINT "FK_75c384d426becca32e8505a884e" FOREIGN KEY ("ListingID") REFERENCES "FoodListings"("ListingID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD CONSTRAINT "FK_fcc096a93291a78bef354b462ab" FOREIGN KEY ("OrderID") REFERENCES "Orders"("OrderID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD CONSTRAINT "FK_7e8a771f8c92edf44e09a9e8680" FOREIGN KEY ("ClaimID") REFERENCES "DonationClaims"("ClaimID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" ADD CONSTRAINT "FK_3b97d72e87bd67090ea7d8c4cac" FOREIGN KEY ("DeliveryID") REFERENCES "Deliveries"("DeliveryID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Notifications" ADD CONSTRAINT "FK_5241001f37f7d9c972c68366576" FOREIGN KEY ("RecipientUserID") REFERENCES "Users"("UserID") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Notifications" DROP CONSTRAINT "FK_5241001f37f7d9c972c68366576"`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP CONSTRAINT "FK_3b97d72e87bd67090ea7d8c4cac"`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP CONSTRAINT "FK_7e8a771f8c92edf44e09a9e8680"`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP CONSTRAINT "FK_fcc096a93291a78bef354b462ab"`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP CONSTRAINT "FK_75c384d426becca32e8505a884e"`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP CONSTRAINT "FK_44828b9a4a1985ed59a1196190d"`);
        await queryRunner.query(`ALTER TABLE "FeedbackComplaints" DROP CONSTRAINT "FK_8e394a0a8715a9dd4e74470c3c5"`);
        await queryRunner.query(`ALTER TABLE "FoodListings" DROP CONSTRAINT "FK_7f8fddbd051ad0c6fb6b983aa93"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP CONSTRAINT "FK_ba25bee3b8756a87618809b6547"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP CONSTRAINT "FK_cc28ac70c3826cac9d742743cb6"`);
        await queryRunner.query(`ALTER TABLE "Orders" DROP CONSTRAINT "FK_22eeb1f85db6e5e82445cf07e71"`);
        await queryRunner.query(`ALTER TABLE "Deliveries" DROP CONSTRAINT "FK_b5ca8864c18a5ff414e01e2b28b"`);
        await queryRunner.query(`ALTER TABLE "Deliveries" DROP CONSTRAINT "FK_916b95e5252cdd0c06043d08c57"`);
        await queryRunner.query(`ALTER TABLE "Deliveries" DROP CONSTRAINT "FK_a1f408e14afa0b167e903a8dc63"`);
        await queryRunner.query(`ALTER TABLE "Deliveries" DROP CONSTRAINT "FK_ee35a658e08617e88d9b44a9a37"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" DROP CONSTRAINT "FK_7ec4466faee6b85b2aa2d40f7be"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" DROP CONSTRAINT "FK_9826bb141a2cc798ee62cc8e388"`);
        await queryRunner.query(`ALTER TABLE "DonationClaims" DROP CONSTRAINT "FK_37f0e0ee8f36b857e5568bc39d2"`);
        await queryRunner.query(`ALTER TABLE "IndependentDelivery" DROP CONSTRAINT "FK_1633e8cb64230a794399a3892df"`);
        await queryRunner.query(`ALTER TABLE "Buyer" DROP CONSTRAINT "FK_a353917c9042ec1013b9c0ec66f"`);
        await queryRunner.query(`ALTER TABLE "CharityOrganization" DROP CONSTRAINT "FK_5489c090253e4d8ced7d719b080"`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" DROP CONSTRAINT "FK_70e6729feb728b46fa2d8e8544d"`);
        await queryRunner.query(`ALTER TABLE "OrganizationVolunteers" DROP CONSTRAINT "FK_405f7325410f3fe2c6609d0f5cc"`);
        await queryRunner.query(`ALTER TABLE "DonorSeller" DROP CONSTRAINT "FK_c854e5a20a936960338c622cfad"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TYPE "public"."Users_accountstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Users_role_enum"`);
        await queryRunner.query(`DROP TABLE "Notifications"`);
        await queryRunner.query(`DROP TYPE "public"."Notifications_notificationtype_enum"`);
        await queryRunner.query(`DROP TABLE "FeedbackComplaints"`);
        await queryRunner.query(`DROP TYPE "public"."FeedbackComplaints_adminactionstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."FeedbackComplaints_feedbacktype_enum"`);
        await queryRunner.query(`DROP TABLE "FoodListings"`);
        await queryRunner.query(`DROP TYPE "public"."FoodListings_listingstatus_enum"`);
        await queryRunner.query(`DROP TABLE "Orders"`);
        await queryRunner.query(`DROP TYPE "public"."Orders_deliverytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Orders_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Orders_orderstatus_enum"`);
        await queryRunner.query(`DROP TABLE "Deliveries"`);
        await queryRunner.query(`DROP TYPE "public"."Deliveries_deliverystatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Deliveries_deliverypersonneltype_enum"`);
        await queryRunner.query(`DROP TABLE "DonationClaims"`);
        await queryRunner.query(`DROP TYPE "public"."DonationClaims_deliverytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."DonationClaims_claimstatus_enum"`);
        await queryRunner.query(`DROP TABLE "IndependentDelivery"`);
        await queryRunner.query(`DROP TABLE "Buyer"`);
        await queryRunner.query(`DROP TABLE "CharityOrganization"`);
        await queryRunner.query(`DROP TABLE "OrganizationVolunteers"`);
        await queryRunner.query(`DROP TABLE "DonorSeller"`);
    }

}
