import { Not, IsNull } from 'typeorm';
import { AppDataSource } from '../config/data-source'
import { User, UserRole } from '../models/User'
import { FoodListing, ListingStatus } from '../models/FoodListing'
import { DonationClaim, ClaimStatus, DonationDeliveryType } from '../models/DonationClaim'
import { Delivery, DeliveryStatus, DeliveryPersonnelType } from '../models/Delivery'
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'
import { generateUniqueCode } from '../utils/codeGenerator'
import { sendRealTimeNotification, sendDeliveryNotification } from '../services/notificationService'

const userRepo = AppDataSource.getRepository(User)
const foodListingRepo = AppDataSource.getRepository(FoodListing)
const donationClaimRepo = AppDataSource.getRepository(DonationClaim)
const deliveryRepo = AppDataSource.getRepository(Delivery)

export interface CreateDonationClaimInput {
  listingId: number
  deliveryType: DonationDeliveryType
  deliveryAddress?: string
  claimNotes?: string
}

export interface DonationClaimResponse {
  claimId: number
  claimStatus: ClaimStatus
  pickupCode?: string
  listing: any
  donor: any
  assignedVolunteer?: any
  deliveryType: DonationDeliveryType
}


export async function createDonationClaim(charityOrgUserId: number, listingId: number, claimData: CreateDonationClaimInput): Promise<DonationClaimResponse> {
  const charityOrgUser = await userRepo.findOne({
    where: { UserID: charityOrgUserId },
    relations: ['charityOrganization'],
    select: {
      UserID: true,
      Role: true,
      AccountStatus: true,
      Username: true,
      PhoneNumber: true,
      charityOrganization: {
        ProfileID: true,
        OrganizationName: true,
        IsDocVerifiedByAdmin: true
      }
    }
  })

  if (!charityOrgUser) throw new UserDoesNotExistError()
  if (charityOrgUser.Role !== UserRole.CHARITY_ORG) {
    throw new UnauthorizedActionError('Only charity organizations can create donation claims')
  }

  if (!charityOrgUser.charityOrganization?.IsDocVerifiedByAdmin) {
    throw new UnauthorizedActionError('Organization must be verified by admin to claim donations')
  }

  const listing = await foodListingRepo.findOne({
    where: { ListingID: listingId },
    relations: ['donor'],
    select: {
      ListingID: true,
      Title: true,
      Description: true,
      IsDonation: true,
      ListingStatus: true,
      PickupLocation: true,
      CreatedAt: true,
      donor: {
        UserID: true,
        Username: true,
        PhoneNumber: true
      }
    }
  })

  if (!listing) throw new FoodListingNotFoundError()
  
  if (!listing.IsDonation) {
    throw new ValidationError('Cannot create donation claim for non-donation items. Use purchase order instead.')
  }

  if (listing.ListingStatus !== ListingStatus.ACTIVE) {
    throw new ValidationError('Cannot claim inactive donation listing')
  }

  if (listing.donor.UserID === charityOrgUserId) {
    throw new ValidationError('Cannot claim your own donation listing')
  }

  const existingClaim = await donationClaimRepo.findOne({
    where: { 
      listing: { ListingID: listingId },
      ClaimStatus: ClaimStatus.PENDING
    }
  })

  if (existingClaim) {
    throw new ValidationError('There is already a pending claim for this donation')
  }

  // let assignedVolunteer = null

  // if (claimData.deliveryType === DonationDeliveryType.HOME_DELIVERY) {
  //   if (!claimData.deliveryAddress) {
  //     throw new ValidationError('Delivery address is required for home delivery')
  //   }

  //   const availableVolunteer = await findAvailableOrgVolunteer(charityOrgUser.charityOrganization.ProfileID)
  //   if (!availableVolunteer) {
  //     throw new ValidationError('No volunteers available for delivery in your organization')
  //   }
  //   assignedVolunteer = availableVolunteer
  // }

  const pickupCode = generateUniqueCode()


  const claim = new DonationClaim()
  claim.charityOrg = charityOrgUser
  claim.donor = listing.donor
  claim.listing = listing
  claim.ClaimStatus = ClaimStatus.PENDING
  claim.DeliveryType = claimData.deliveryType
  claim.PickupCode = pickupCode
  

  const savedClaim = await donationClaimRepo.save(claim)

  const delivery = new Delivery()
  delivery.claim = savedClaim
  delivery.DeliveryPersonnelType = DeliveryPersonnelType.ORG_VOLUNTEER
  delivery.DeliveryStatus = DeliveryStatus.SCHEDULED

  await deliveryRepo.save(delivery)


  // if (claimData.deliveryType === DonationDeliveryType.HOME_DELIVERY && assignedVolunteer) {
  //   const delivery = new Delivery()
  //   delivery.claim = savedClaim
  //   delivery.DeliveryPersonnelType = DeliveryPersonnelType.ORG_VOLUNTEER
  //   delivery.organizationVolunteer = assignedVolunteer
  //   delivery.DeliveryStatus = DeliveryStatus.SCHEDULED

  //   await deliveryRepo.save(delivery)

  
  //   await sendDeliveryNotification(
  //     charityOrgUser.UserID,
  //     'NEW_DONATION_DELIVERY',
  //     `New donation delivery assigned. Claim ID: ${savedClaim.ClaimID}. Pickup code: ${pickupCode}`,
  //     savedClaim.ClaimID,
  //     {
  //       claimId: savedClaim.ClaimID,
  //       pickupCode: pickupCode,
  //       pickupLocation: listing.PickupLocation,
  //       deliveryAddress: claimData.deliveryAddress,
  //       donorPhone: listing.donor.PhoneNumber,
  //       organizationName: charityOrgUser.charityOrganization.OrganizationName
  //     }
  //   )
  // }


  await foodListingRepo.update(
    { ListingID: listing.ListingID },
    { ListingStatus: ListingStatus.CLAIMED }
  )

  
  await sendRealTimeNotification({
    recipientId: listing.donor.UserID,
    type: 'DONATION_CLAIMED',
    message: `Your donation "${listing.Title}" has been claimed by ${charityOrgUser.charityOrganization.OrganizationName}. Pickup code: ${pickupCode}`,
    referenceId: savedClaim.ClaimID,
    priority: 'high',
    data: {
      claimId: savedClaim.ClaimID,
      donationTitle: listing.Title,
      organizationName: charityOrgUser.charityOrganization.OrganizationName,
      pickupCode: pickupCode,
      deliveryType: claimData.deliveryType
    }
  })

  await sendRealTimeNotification({
    recipientId: charityOrgUserId,
    type: 'DONATION_CLAIMED',
    message: `Donation claim created successfully for "${listing.Title}". Claim ID: ${savedClaim.ClaimID}`,
    referenceId: savedClaim.ClaimID,
    priority: 'high',
    data: {
      claimId: savedClaim.ClaimID,
      donationTitle: listing.Title,
      donorName: listing.donor.Username,
      pickupCode: pickupCode
    }
  })

  return {
    claimId: savedClaim.ClaimID,
    claimStatus: savedClaim.ClaimStatus,
    pickupCode: pickupCode,
    deliveryType: savedClaim.DeliveryType,
    listing: {
      id: listing.ListingID,
      title: listing.Title,
      description: listing.Description,
      pickupLocation: listing.PickupLocation
    },
    donor: {
      id: listing.donor.UserID,
      username: listing.donor.Username,
      phone: listing.donor.PhoneNumber
    } 
  }
}



export async function authorizeDonationPickup(donorId: number, claimId: number, providedCode: string): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'charityOrg.charityOrganization', 'listing', 'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user'],
    select: {
      ClaimID: true,
      ClaimStatus: true,
      DeliveryType: true,
      PickupCode: true,
      donor: { UserID: true, Username: true },
      charityOrg: { 
        UserID: true, 
        charityOrganization: { OrganizationName: true }
      },
      listing: { ListingID: true, Title: true }
    }
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (claim.donor.UserID !== donorId) {
    throw new UnauthorizedActionError('Only the donor can authorize pickup for this donation')
  }

  if (claim.ClaimStatus !== ClaimStatus.PENDING) {
    throw new ValidationError('Donation claim is not in pending status')
  }

  if (claim.PickupCode !== providedCode) {
    throw new ValidationError('Invalid pickup code')
  }

  claim.ClaimStatus = ClaimStatus.APPROVED
  if (!claim.delivery) {
    throw new ValidationError('No delivery record found for this claim');
  }
  claim.delivery.DeliveryStatus = DeliveryStatus.IN_TRANSIT
  await deliveryRepo.save(claim.delivery)
  const updatedClaim = await donationClaimRepo.save(claim)

  // if (claim.DeliveryType === DonationDeliveryType.HOME_DELIVERY) {
  //   if (claim.delivery) {
  //     claim.delivery.DeliveryStatus = DeliveryStatus.IN_TRANSIT
  //     await deliveryRepo.save(claim.delivery)

    
  //     await sendRealTimeNotification({
  //       recipientId: claim.delivery.organizationVolunteer?.user.UserID || 0,
  //       type: 'DONATION_PICKUP_AUTHORIZED',
  //       message: `Donation pickup authorized for claim #${claimId}. Please deliver to organization.`,
  //       referenceId: claimId,
  //       priority: 'high',
  //       data: {
  //         claimId: claimId,
  //         donationTitle: claim.listing.Title,
  //         donorName: claim.donor.Username
  //       }
  //     })
  //   }

  //   await sendRealTimeNotification({
  //     recipientId: claim.charityOrg.UserID,
  //     type: 'DONATION_PICKED_UP',
  //     message: `Your claimed donation #${claimId} has been picked up by volunteer and is on the way.`,
  //     referenceId: claimId,
  //     priority: 'normal',
  //     data: {
  //       claimId: claimId,
  //       donationTitle: claim.listing.Title,
  //       volunteerName: claim.delivery?.organizationVolunteer?.VolunteerName
  //     }
  //   })
  // }

    // claim.ClaimStatus = ClaimStatus.COMPLETED
    // await donationClaimRepo.save(claim)

    await foodListingRepo.update(
      { ListingID: claim.listing.ListingID },
      { ListingStatus: ListingStatus.SOLD }
    )


    await sendRealTimeNotification({
      recipientId: claim.charityOrg.UserID,
      type: 'DONATION_CLAIMED',
      message: `Your claimed donation #${claimId} has been picked up by volunteer and is on the way.`,
      referenceId: claimId,
      priority: 'high',
      data: {
        claimId: claimId,
        donationTitle: claim.listing.Title
      }
    })
  

  return updatedClaim
}


export async function completeDonationDelivery(charityOrgId: number, claimId: number): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'charityOrg.charityOrganization', 'listing', 'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user']
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (!claim.delivery || claim.charityOrg?.UserID !== charityOrgId) {
    throw new UnauthorizedActionError('You are not assigned to this donation delivery')
  }

  if (claim.ClaimStatus !== ClaimStatus.APPROVED) {
    throw new ValidationError('Donation claim must be approved (picked up) first')
  }

  if (claim.delivery.DeliveryStatus !== DeliveryStatus.IN_TRANSIT) {
    throw new ValidationError('Delivery must be in transit to complete')
  }

  
  claim.ClaimStatus = ClaimStatus.COMPLETED
  claim.delivery.DeliveryStatus = DeliveryStatus.DELIVERED
  
  await donationClaimRepo.save(claim)
  await deliveryRepo.save(claim.delivery)


  await foodListingRepo.update(
    { ListingID: claim.listing.ListingID },
    { ListingStatus: ListingStatus.CLAIMED }
  )

  await sendRealTimeNotification({
    recipientId: claim.charityOrg.UserID,
    type: 'DONATION_CLAIMED',
    message: `Your claimed donation #${claimId} has been delivered successfully.`,
    referenceId: claimId,
    priority: 'normal',
    data: {
      claimId: claimId,
      donationTitle: claim.listing.Title,
      organizationName: claim.charityOrg.charityOrganization?.OrganizationName
    }
  })

  await sendRealTimeNotification({
    recipientId: claim.donor.UserID,
    type: 'DONATION_CLAIMED',
    message: `Your donation #${claimId} has been successfully delivered to ${claim.charityOrg.charityOrganization?.OrganizationName}.`,
    referenceId: claimId,
    priority: 'normal',
    data: {
      claimId: claimId,
      donationTitle: claim.listing.Title,
      organizationName: claim.charityOrg.charityOrganization?.OrganizationName
    }
  })

  return claim
}


export async function reportDonationDeliveryFailure(volunteerId: number, claimId: number, reason: string): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'charityOrg.charityOrganization', 'listing', 'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user']
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (!claim.delivery || claim.delivery.organizationVolunteer?.user.UserID !== volunteerId) {
    throw new UnauthorizedActionError('You are not assigned to this donation delivery')
  }


  claim.delivery.DeliveryStatus = DeliveryStatus.FAILED
  await deliveryRepo.save(claim.delivery)

  
  claim.ClaimStatus = ClaimStatus.PENDING
  await donationClaimRepo.save(claim)

  await sendRealTimeNotification({
    recipientId: claim.charityOrg.UserID,
    type: 'DONATION_DELIVERY_FAILED',
    message: `Donation delivery failed for claim #${claimId}. Reason: ${reason}`,
    referenceId: claimId,
    priority: 'high',
    data: {
      claimId: claimId,
      donationTitle: claim.listing.Title,
      failureReason: reason
    }
  })

  await sendRealTimeNotification({
    recipientId: claim.donor.UserID,
    type: 'DONATION_DELIVERY_FAILED',
    message: `Donation delivery failed for claim #${claimId}. Reason: ${reason}`,
    referenceId: claimId,
    priority: 'high',
    data: {
      claimId: claimId,
      donationTitle: claim.listing.Title,
      failureReason: reason
    }
  })

  return claim
}


export async function getDonationClaimById(userId: number, claimId: number): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: [
      'donor', 'charityOrg', 'charityOrg.charityOrganization', 'listing', 
      'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user'
    ]
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }


  const hasAccess = claim.donor.UserID === userId || 
                   claim.charityOrg.UserID === userId ||
                   claim.delivery?.organizationVolunteer?.user.UserID === userId

  if (!hasAccess) {
    throw new UnauthorizedActionError('Access denied')
  }

  return claim
}


export async function getMyDonationClaims(charityOrgUserId: number, offset: number, limit: number): Promise<any> {
  const claims = await donationClaimRepo.find({
    where: { charityOrg: { UserID: charityOrgUserId } },
    relations: ['donor', 'listing', 'delivery', 'delivery.organizationVolunteer'],
    skip: offset,
    take: limit,
    order: { ClaimID: 'DESC' }
  })

  return claims
}


export async function getMyDonationOffers(donorId: number, offset: number, limit: number): Promise<any> {
  const offers = await donationClaimRepo.find({
    where: { donor: { UserID: donorId } },
    relations: ['charityOrg', 'charityOrg.charityOrganization', 'listing', 'delivery'],
    skip: offset,
    take: limit,
    order: { ClaimID: 'DESC' }
  })

  return offers
}


export async function getMyDonationDeliveries(volunteerId: number, offset: number, limit: number): Promise<any> {
  const deliveries = await deliveryRepo.find({
    where: { 
      organizationVolunteer: { user: { UserID: volunteerId } },
      claim: Not(IsNull()) 
    },
    relations: ['claim', 'claim.donor', 'claim.charityOrg', 'claim.listing'],
    skip: offset,
    take: limit,
    order: { DeliveryID: 'DESC' }
  })

  return deliveries
}


export async function cancelDonationClaim(userId: number, claimId: number, reason?: string): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'charityOrg.charityOrganization', 'listing', 'delivery']
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (claim.donor.UserID !== userId && claim.charityOrg.UserID !== userId) {
    throw new UnauthorizedActionError('Only donor or charity organization can cancel this claim')
  }

  if (claim.ClaimStatus === ClaimStatus.COMPLETED) {
    throw new ValidationError('Cannot cancel completed donation delivery')
  }

  if (claim.ClaimStatus === ClaimStatus.APPROVED && claim.delivery?.DeliveryStatus === DeliveryStatus.IN_TRANSIT) {
    throw new ValidationError('Cannot cancel donation claim that is in transit')
  }

  claim.ClaimStatus = ClaimStatus.CANCELLED
  const updatedClaim = await donationClaimRepo.save(claim)

  await foodListingRepo.update(
    { ListingID: claim.listing.ListingID },
    { ListingStatus: ListingStatus.ACTIVE }
  )

  if (claim.delivery) {
    claim.delivery.DeliveryStatus = DeliveryStatus.FAILED
    await deliveryRepo.save(claim.delivery)
  }


  const cancellerRole = claim.donor.UserID === userId ? 'donor' : 'charity organization'
  const otherPartyId = cancellerRole === 'donor' ? claim.charityOrg.UserID : claim.donor.UserID

  await sendRealTimeNotification({
    recipientId: otherPartyId,
    type: 'DONATION_CLAIM_CANCELLED',
    message: `Donation claim #${claimId} has been cancelled by the ${cancellerRole}. ${reason ? 'Reason: ' + reason : ''}`,
    referenceId: claimId,
    priority: 'normal',
    data: {
      claimId: claimId,
      donationTitle: claim.listing.Title,
      cancellerRole: cancellerRole,
      reason: reason
    }
  })

  return updatedClaim
}


export async function getDonationStats(userId: number): Promise<any> {
  const user = await userRepo.findOne({
    where: { UserID: userId },
    select: ['UserID', 'Role']
  })

  if (!user) throw new UserDoesNotExistError()

  let stats: any = {}

  if (user.Role === UserRole.CHARITY_ORG) {
    const claims = await getMyDonationClaims(userId, 0, 1000)
    stats.claims = {
      total: claims.length,
      pending: claims.filter((c: any) => c.ClaimStatus === ClaimStatus.PENDING).length,
      approved: claims.filter((c: any) => c.ClaimStatus === ClaimStatus.APPROVED).length,
      completed: claims.filter((c: any) => c.ClaimStatus === ClaimStatus.COMPLETED).length,
      cancelled: claims.filter((c: any) => c.ClaimStatus === ClaimStatus.CANCELLED).length
    }
  }

  if (user.Role === UserRole.DONOR_SELLER) {
    const offers = await getMyDonationOffers(userId, 0, 1000)
    stats.offers = {
      total: offers.length,
      pending: offers.filter((o: any) => o.ClaimStatus === ClaimStatus.PENDING).length,
      approved: offers.filter((o: any) => o.ClaimStatus === ClaimStatus.APPROVED).length,
      completed: offers.filter((o: any) => o.ClaimStatus === ClaimStatus.COMPLETED).length,
      cancelled: offers.filter((o: any) => o.ClaimStatus === ClaimStatus.CANCELLED).length
    }
  }

  return stats
}

// async function findAvailableOrgVolunteer(charityOrgId: number): Promise<any> {
//   const volunteer = await orgVolunteerRepo.findOne({
//     where: { 
//       charityOrg: { ProfileID: charityOrgId },
//       IsActive: true
//     },
//     relations: ['user'],
//     select: {
//       OrgVolunteerID: true,
//       VolunteerName: true,
//       VolunteerContactPhone: true,
//       user: { UserID: true }
//     }
//   })

//   return volunteer
// }