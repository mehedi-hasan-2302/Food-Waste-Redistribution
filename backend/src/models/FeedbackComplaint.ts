import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'
import { FoodListing } from './FoodListing'
import { Order } from './Order'
import { DonationClaim } from './DonationClaim'
import { Delivery } from './Delivery'

export enum FeedbackType {
  REVIEW    = 'REVIEW',
  COMPLAINT = 'COMPLAINT',
  RATING    = 'RATING',
}
export enum AdminActionStatus {
  PENDING   = 'PENDING',
  RESOLVED  = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

@Entity({ name: 'FeedbackComplaints' })
export class FeedbackComplaint {
  @PrimaryGeneratedColumn()
  FeedbackID!: number

  @ManyToOne(() => User, u => u.feedbacksByMe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SubmitterUserID' })
  submitter!: User

  @ManyToOne(() => User, u => u.feedbacksAboutMe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'RegardingUserID' })
  regarding!: User

  @ManyToOne(() => FoodListing, { nullable: true })
  @JoinColumn({ name: 'ListingID' })
  listing?: FoodListing

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'OrderID' })
  order?: Order

  @ManyToOne(() => DonationClaim, { nullable: true })
  @JoinColumn({ name: 'ClaimID' })
  claim?: DonationClaim

  @ManyToOne(() => Delivery, { nullable: true })
  @JoinColumn({ name: 'DeliveryID' })
  delivery?: Delivery

  @Column({ type: 'enum', enum: FeedbackType })
  FeedbackType!: FeedbackType

  @Column({ type: 'float', unsigned: true, nullable: true })
  RatingValue?: number

  @Column('text', { nullable: true })
  Message?: string

  @Column('text', { nullable: true })
  AdminNotes?: string

  @Column({
    type: 'enum',
    enum: AdminActionStatus,
    default: AdminActionStatus.PENDING,
  })
  AdminActionStatus!: AdminActionStatus
}
