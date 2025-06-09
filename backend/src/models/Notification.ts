import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'

export enum NotificationType {
  NEW_LISTING     = 'NEW_LISTING',
  EXPIRY_ALERT    = 'EXPIRY_ALERT',
  CLAIM_UPDATE    = 'CLAIM_UPDATE',
  ORDER_UPDATE    = 'ORDER_UPDATE',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  FEEDBACK_REQUEST= 'FEEDBACK_REQUEST',
}

@Entity({ name: 'Notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  NotificationID!: number

  @ManyToOne(() => User, u => u.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'RecipientUserID' })
  recipient!: User

  @Column({ type: 'enum', enum: NotificationType })
  NotificationType!: NotificationType

  @Column('text')
  Message!: string

  @Column({ nullable: true })
  ReferenceID?: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Column({ default: false })
  IsRead!: boolean
}
