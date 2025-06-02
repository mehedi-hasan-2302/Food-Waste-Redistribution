import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'
import { FoodListing } from './FoodListing'
import { Delivery } from './Delivery'


export enum ClaimStatus {
  PENDING   = 'PENDING',
  APPROVED  = 'APPROVED',
  REJECTED  = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum DonationDeliveryType {
  SELF_PICKUP   = 'SELF_PICKUP',
  HOME_DELIVERY = 'HOME_DELIVERY',
}

@Entity({ name: 'DonationClaims' })
export class DonationClaim {
  @PrimaryGeneratedColumn()
  ClaimID!: number

  @ManyToOne(() => User, u => u.claims, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'CharityOrgUserID' })
  charityOrg!: User

  @ManyToOne(() => User, u => u.donationOffers, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'DonorUserID' })
  donor!: User

  @ManyToOne(() => FoodListing, fl => fl.claims, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ListingID' })
  listing!: FoodListing

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
  ClaimStatus!: ClaimStatus

  @Column({ type: 'varchar', length: 20, unique: true })
  PickupCode!: string

  @Column({ type: 'enum', enum: DonationDeliveryType })
  DeliveryType!: DonationDeliveryType

  @OneToOne(() => Delivery, d => d.claim)
  delivery?: Delivery
}
