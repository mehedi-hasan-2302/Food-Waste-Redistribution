import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from './User'
import { OrganizationVolunteer } from './OrganizationVolunteer'

@Entity({ name: 'CharityOrganization' })
export class CharityOrganization {
  @PrimaryGeneratedColumn()
  ProfileID!: number

  @OneToOne(() => User, u => u.charityOrganization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID' })
  user!: User

  @Column({ length: 150 })
  OrganizationName!: string

  @Column()
  GovRegistrationDocPath!: string

  @Column({ default: false })
  IsDocVerifiedByAdmin!: boolean

  @Column({ length: 200 })
  AddressLine1!: string

  @OneToMany(() => OrganizationVolunteer, ov => ov.charityOrg)
  volunteers?: OrganizationVolunteer[]
}
