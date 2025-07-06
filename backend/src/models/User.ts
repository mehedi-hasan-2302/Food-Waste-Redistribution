import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
} from 'typeorm'
import { DonorSeller } from './DonorSeller'
import { CharityOrganization } from './CharityOrganization'
import { Buyer } from './Buyer'
import { IndependentDelivery } from './IndependentDelivery'
import { OrganizationVolunteer } from './OrganizationVolunteer'
import { FoodListing } from './FoodListing'
import { Order } from './Order'
import { DonationClaim } from './DonationClaim'
import { Delivery } from './Delivery'
import { FeedbackComplaint } from './FeedbackComplaint'
import { Notification } from './Notification'

export enum UserRole {
    DONOR_SELLER = 'DONOR_SELLER',
    CHARITY_ORG = 'CHARITY_ORG',
    BUYER = 'BUYER',
    INDEP_DELIVERY = 'INDEP_DELIVERY',
    ORG_VOLUNTEER = 'ORG_VOLUNTEER',
    ADMIN = 'ADMIN',
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    PENDING = 'PENDING',
}

@Entity({ name: 'Users' })
export class User {
    @PrimaryGeneratedColumn()
    UserID!: number

    @Column({ length: 100 })
    Username!: string

    @Column()
    PasswordHash!: string

    @Column({ unique: true })
    Email!: string

    @Column({ nullable: true })
    PhoneNumber?: string

    @Column({ type: 'enum', enum: UserRole })
    Role!: UserRole

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    RegistrationDate!: Date

    @Column({ default: false })
    IsEmailVerified!: boolean

    @Column({ type: 'varchar', length: 6, nullable: true })
    verificationCode?: string | null

    @Column({ type: 'timestamp', nullable: true })
    verificationCodeExpires?: Date | null

    @Column({ type:'varchar', nullable: true })
    passwordResetToken?: string | null

    @Column({ type: 'timestamp', nullable: true })
    passwordResetExpires?: Date | null

    @Column({ type: 'boolean', default: false })
    isProfileComplete?: boolean

    @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING })
    AccountStatus!: AccountStatus

    // Profiles
    @OneToOne(() => DonorSeller, p => p.user, { cascade: true })
    donorSeller?: DonorSeller

    @OneToOne(() => CharityOrganization, p => p.user, { cascade: true })
    charityOrganization?: CharityOrganization

    @OneToOne(() => Buyer, p => p.user, { cascade: true })
    buyer?: Buyer

    @OneToOne(
        () => IndependentDelivery,
        p => p.user,
        { cascade: true }
    )
    independentDelivery?: IndependentDelivery

    @OneToOne(() => OrganizationVolunteer, ov => ov.user, { cascade: true })
    organizationVolunteer?: OrganizationVolunteer

    // Activities
    @OneToMany(() => FoodListing, fl => fl.donor)
    foodListings?: FoodListing[]

    @OneToMany(() => Order, o => o.buyer)
    purchases?: Order[]

    @OneToMany(() => Order, o => o.seller)
    sales?: Order[]

    @OneToMany(() => DonationClaim, dc => dc.charityOrg)
    claims?: DonationClaim[]

    @OneToMany(() => DonationClaim, dc => dc.donor)
    donationOffers?: DonationClaim[]

    @OneToMany(() => Delivery, d => d.independentDeliveryPersonnel)
    independentDeliveries?: Delivery[]

    @OneToMany(() => FeedbackComplaint, fc => fc.submitter)
    feedbacksByMe?: FeedbackComplaint[]

    @OneToMany(() => FeedbackComplaint, fc => fc.regarding)
    feedbacksAboutMe?: FeedbackComplaint[]

    @OneToMany(() => Notification, n => n.recipient)
    notifications?: Notification[]
}
