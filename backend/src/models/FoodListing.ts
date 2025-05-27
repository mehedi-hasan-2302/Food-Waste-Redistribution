import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { DonationClaim } from './DonationClaim';

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED',
}

@Entity({ name: 'FoodListings' })
export class FoodListing {
  @PrimaryGeneratedColumn()
  ListingID!: number;

  @ManyToOne(() => User, u => u.foodListings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'DonorSellerUserID' })
  donor!: User;

  @Column({ length: 150 })
  Title!: string;

  @Column('text')
  Description!: string;

  @Column()
  FoodType!: string;

  @Column({ nullable: true })
  Quantity?: string;

  @Column({ nullable: true })
  DietaryInfo?: string;

  @Column('date')
  CookedDate!: Date;

  @Column({ default: true })
  IsDonation!: boolean;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  Price?: number;

  @Column({ type: 'enum', enum: ListingStatus, default: ListingStatus.ACTIVE })
  ListingStatus!: ListingStatus;

  @Column({ type: 'varchar', nullable: true })
  ImagePath?: string | null;

  @Column({ type: 'varchar', nullable: true })
  ImagePublicId?: string | null;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt!: Date;

  @Column('timestamp')
  PickupWindowStart!: Date;

  @Column('timestamp', { nullable: true })
  PickupWindowEnd?: Date;

  @Column({ length: 200, nullable: true })
  PickupLocation?: string;

  @OneToMany(() => Order, o => o.listing)
  orders?: Order[];

  @OneToMany(() => DonationClaim, dc => dc.listing)
  claims?: DonationClaim[];
}