import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'

@Entity({ name: 'Buyer' })
export class Buyer {
  @PrimaryGeneratedColumn()
  ProfileID!: number

  @OneToOne(() => User, u => u.buyer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID' })
  user!: User

  @Column('text')
  DefaultDeliveryAddress!: string
}
