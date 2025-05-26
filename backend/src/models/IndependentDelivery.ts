import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'

@Entity({ name: 'IndependentDelivery' })
export class IndependentDelivery {
  @PrimaryGeneratedColumn()
  ProfileID!: number

  @OneToOne(() => User, u => u.independentDelivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID' })
  user!: User

  @Column()
  FullName!: string

  @Column()
  SelfiePath!: string

  @Column()
  NIDPath!: string

  @Column({ default: false })
  IsIDVerifiedByAdmin!: boolean

  @Column('json')
  OperatingAreas!: Record<string, any>

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  CurrentRating!: number
}
