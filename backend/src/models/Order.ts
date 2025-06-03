import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './User'
import { FoodListing } from './FoodListing'
import { Delivery } from './Delivery'

export enum OrderStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID    = 'PAID',
  FAILED  = 'FAILED',
  REFUNDED= 'REFUNDED',
}

export enum DeliveryType {
  SELF_PICKUP   = 'SELF_PICKUP',
  HOME_DELIVERY = 'HOME_DELIVERY',
}

@Entity({ name: 'Orders' })
export class Order {
  @PrimaryGeneratedColumn()
  OrderID!: number

  @ManyToOne(() => User, u => u.purchases, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'BuyerUserID' })
  buyer!: User

  @ManyToOne(() => User, u => u.sales, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'SellerUserID' })
  seller!: User

  @ManyToOne(() => FoodListing, fl => fl.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ListingID' })
  listing!: FoodListing

  @Column('decimal', { precision: 8, scale: 2 })
  DeliveryFee!: number

  @Column('decimal', { precision: 8, scale: 2 })
  FinalPrice!: number

  @Column({ type: 'varchar', length: 20, unique: true })
  PickupCode!: string

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  OrderStatus!: OrderStatus

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  PaymentStatus!: PaymentStatus

  @Column({ type: 'enum', enum: DeliveryType })
  DeliveryType!: DeliveryType

  @Column('text')
  DeliveryAddress!: string

  @Column({ type: 'text', nullable: true })
  OrderNotes?: string

  @CreateDateColumn()
  CreatedAt!: Date

  @UpdateDateColumn()
  UpdatedAt!: Date

  @OneToOne(() => Delivery, d => d.order)
  delivery?: Delivery
}