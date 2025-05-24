import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'

@Entity({ name: 'DonorSeller' })
export class DonorSeller {
  @PrimaryGeneratedColumn()
  ProfileID!: number

  @OneToOne(() => User, u => u.donorSeller, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID' })
  user!: User

  @Column({ length: 150 })
  BusinessName!: string

  @Column({ default: false })
  IsPhoneVerified!: boolean
}
