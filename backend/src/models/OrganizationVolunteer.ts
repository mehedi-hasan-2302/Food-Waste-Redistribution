import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import { CharityOrganization } from './CharityOrganization'
import { User } from './User'

@Entity({ name: 'OrganizationVolunteers' })
export class OrganizationVolunteer {
  @PrimaryGeneratedColumn()
  OrgVolunteerID!: number

  @ManyToOne(
    () => CharityOrganization,
    c => c.volunteers,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'CharityOrgID' })
  charityOrg!: CharityOrganization

  @OneToOne(() => User, u => u.organizationVolunteer)
  @JoinColumn({ name: 'UserID' })
  user!: User

  @Column()
  VolunteerName!: string

  @Column()
  VolunteerContactPhone!: string

  @Column({ default: true })
  IsActive!: boolean
}
