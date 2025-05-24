import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { Order } from './Order'
import { DonationClaim } from './DonationClaim'
import { User } from './User'
import { OrganizationVolunteer } from './OrganizationVolunteer'

export enum DeliveryPersonnelType {
  INDEPENDENT  = 'INDEPENDENT',
  ORG_VOLUNTEER= 'ORG_VOLUNTEER',
}
export enum DeliveryStatus {
  SCHEDULED  = 'SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED  = 'DELIVERED',
  FAILED     = 'FAILED',
}

@Entity({ name: 'Deliveries' })
export class Delivery {
  @PrimaryGeneratedColumn()
  DeliveryID!: number

  @OneToOne(() => Order, o => o.delivery, { nullable: true })
  @JoinColumn({ name: 'OrderID' })
  order?: Order

  @OneToOne(() => DonationClaim, dc => dc.delivery, { nullable: true })
  @JoinColumn({ name: 'ClaimID' })
  claim?: DonationClaim

  @Column({ type: 'enum', enum: DeliveryPersonnelType })
  DeliveryPersonnelType!: DeliveryPersonnelType

  @ManyToOne(() => User, u => u.independentDeliveries, { nullable: true })
  @JoinColumn({ name: 'IndependentDeliveryUserID' })
  independentDeliveryPersonnel?: User

  @ManyToOne(() => OrganizationVolunteer, ov => ov.charityOrg, { nullable: true })
  @JoinColumn({ name: 'OrganizationVolunteerID' })
  organizationVolunteer?: OrganizationVolunteer

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.SCHEDULED })
  DeliveryStatus!: DeliveryStatus
}
