import { Not, IsNull } from 'typeorm';
import { AppDataSource } from '../config/data-source'
import { User, UserRole } from '../models/User'
import { FoodListing, ListingStatus } from '../models/FoodListing'
import { DonationClaim, ClaimStatus, DonationDeliveryType } from '../models/DonationClaim'
import { Delivery, DeliveryStatus, DeliveryPersonnelType } from '../models/Delivery'
import { CharityOrganization } from '../models/CharityOrganization'
import { OrganizationVolunteer } from '../models/OrganizationVolunteer'
import {
  UserDoesNotExistError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'
import { generateUniqueCode } from '../utils/codeGenerator'
import { sendNotification } from '../services/notificationService'

const userRepo = AppDataSource.getRepository(User)
const foodListingRepo = AppDataSource.getRepository(FoodListing)
const donationClaimRepo = AppDataSource.getRepository(DonationClaim)
const charityOrgRepo = AppDataSource.getRepository(CharityOrganization)
const orgVolunteerRepo = AppDataSource.getRepository(OrganizationVolunteer)
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

// Create donation claim by charity organization
export async function createDonationClaim(charityOrgUserId: number, claimData: CreateDonationClaimInput): Promise<DonationClaimResponse> {
  const charityOrgUser = await userRepo.findOne({
    where: { UserID: charityOrgUserId },
    relations: ['charityOrganization'],
    select: {
      UserID: true,
      Role: true,
      AccountStatus: true,
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
    where: { ListingID: claimData.listingId },
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

  // Check if there's already a pending claim for this listing
  const existingClaim = await donationClaimRepo.findOne({
    where: { 
      listing: { ListingID: claimData.listingId },
      ClaimStatus: ClaimStatus.PENDING
    }
  })

  if (existingClaim) {
    throw new ValidationError('There is already a pending claim for this donation')
  }

  let assignedVolunteer = null
  let pickupCode = null

  // For home delivery, assign an organization volunteer
  if (claimData.deliveryType === DonationDeliveryType.HOME_DELIVERY) {
    if (!claimData.deliveryAddress) {
      throw new ValidationError('Delivery address is required for home delivery')
    }

    const availableVolunteer = await findAvailableOrgVolunteer(charityOrgUser.charityOrganization.ProfileID)
    if (!availableVolunteer) {
      throw new ValidationError('No volunteers available for delivery in your organization')
    }
    assignedVolunteer = availableVolunteer
  }

  // Generate unique pickup code for donor authorization
  pickupCode = generateUniqueCode()

  // Create donation claim
  const claim = new DonationClaim()
  claim.charityOrg = charityOrgUser
  claim.donor = listing.donor
  claim.listing = listing
  claim.ClaimStatus = ClaimStatus.PENDING
  claim.DeliveryType = claimData.deliveryType

  const savedClaim = await donationClaimRepo.save(claim)

  // Create delivery record if home delivery
  if (claimData.deliveryType === DonationDeliveryType.HOME_DELIVERY && assignedVolunteer) {
    const delivery = new Delivery()
    delivery.claim = savedClaim
    delivery.DeliveryPersonnelType = DeliveryPersonnelType.ORG_VOLUNTEER
    delivery.organizationVolunteer = assignedVolunteer
    delivery.DeliveryStatus = DeliveryStatus.SCHEDULED

    await deliveryRepo.save(delivery)

    // Send notification to assigned volunteer
    await sendNotification(
      assignedVolunteer.user.UserID,
      'NEW_DONATION_DELIVERY',
      `New donation delivery assigned. Claim ID: ${savedClaim.ClaimID}. Pickup code: ${pickupCode}`,
      savedClaim.ClaimID
    )
  }

  // Update listing status to claimed
  await foodListingRepo.update(
    { ListingID: listing.ListingID },
    { ListingStatus: ListingStatus.CLAIMED }
  )

  // Send notification to donor
  await sendNotification(
    listing.donor.UserID,
    'DONATION_CLAIM_RECEIVED',
    `Your donation "${listing.Title}" has been claimed by ${charityOrgUser.charityOrganization.OrganizationName}. Pickup code: ${pickupCode}`,
    savedClaim.ClaimID
  )

  // Send notification to charity organization
  await sendNotification(
    charityOrgUserId,
    'DONATION_CLAIM_CREATED',
    `Donation claim created successfully for "${listing.Title}". Claim ID: ${savedClaim.ClaimID}`,
    savedClaim.ClaimID
  )

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
    },
    assignedVolunteer: assignedVolunteer ? {
      id: assignedVolunteer.user.UserID,
      name: assignedVolunteer.VolunteerName,
      phone: assignedVolunteer.VolunteerContactPhone
    } : undefined
  }
}


// Donor authorizes pickup for donation (verifies pickup code when volunteer arrives)
export async function authorizeDonationPickup(donorId: number, claimId: number, providedCode: string): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'charityOrg.charityOrganization', 'listing', 'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user'],
    select: {
      ClaimID: true,
      ClaimStatus: true,
      DeliveryType: true,
      donor: { UserID: true },
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

  // Note: You'll need to add PickupCode field to DonationClaim model or handle it differently
  // For now, assuming the code validation logic
  if (!validatePickupCode(providedCode, claimId)) {
    throw new ValidationError('Invalid pickup code')
  }

  // Update claim status to approved (pickup authorized)
  claim.ClaimStatus = ClaimStatus.APPROVED
  const updatedClaim = await donationClaimRepo.save(claim)

  if (claim.DeliveryType === DonationDeliveryType.HOME_DELIVERY) {
    // Update delivery status to in transit
    if (claim.delivery) {
      claim.delivery.DeliveryStatus = DeliveryStatus.IN_TRANSIT
      await deliveryRepo.save(claim.delivery)

      // Notify volunteer
      await sendNotification(
        claim.delivery.organizationVolunteer?.user.UserID || 0,
        'DONATION_PICKUP_AUTHORIZED',
        `Donation pickup authorized for claim #${claimId}. Please deliver to organization.`,
        claimId
      )
    }

    // Notify charity organization
    await sendNotification(
      claim.charityOrg.UserID,
      'DONATION_PICKED_UP',
      `Your claimed donation #${claimId} has been picked up by volunteer and is on the way.`,
      claimId
    )
  } else {
    // For self pickup, organization has the item now, so complete the claim
    // This would typically happen when org representative picks up directly
    // We'll keep it as approved for now, completion happens in a separate step
  }

  return updatedClaim
}



// Complete donation delivery (used by organization volunteer for home delivery)
export async function completeDonationDelivery(volunteerId: number, claimId: number): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'listing', 'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user']
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (!claim.delivery || claim.delivery.organizationVolunteer?.user.UserID !== volunteerId) {
    throw new UnauthorizedActionError('You are not assigned to this donation delivery')
  }

  if (claim.ClaimStatus !== ClaimStatus.APPROVED) {
    throw new ValidationError('Donation claim must be approved (picked up) first')
  }

  if (claim.delivery.DeliveryStatus !== DeliveryStatus.IN_TRANSIT) {
    throw new ValidationError('Delivery must be in transit to complete')
  }

  // Complete the delivery
  claim.delivery.DeliveryStatus = DeliveryStatus.DELIVERED
  await deliveryRepo.save(claim.delivery)

  // Send notifications
  await sendNotification(
    claim.charityOrg.UserID,
    'DONATION_DELIVERED',
    `Your claimed donation #${claimId} has been delivered successfully.`,
    claimId
  )

  await sendNotification(
    claim.donor.UserID,
    'DONATION_COMPLETED',
    `Your donation #${claimId} has been successfully delivered to the charity organization.`,
    claimId
  )

  return claim
}

// Report donation delivery failure
export async function reportDonationDeliveryFailure(volunteerId: number, claimId: number, reason: string): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'listing', 'delivery', 'delivery.organizationVolunteer', 'delivery.organizationVolunteer.user']
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (!claim.delivery || claim.delivery.organizationVolunteer?.user.UserID !== volunteerId) {
    throw new UnauthorizedActionError('You are not assigned to this donation delivery')
  }

  // Update delivery status
  claim.delivery.DeliveryStatus = DeliveryStatus.FAILED
  await deliveryRepo.save(claim.delivery)

  // Revert claim status back to pending for potential reassignment
  claim.ClaimStatus = ClaimStatus.PENDING
  await donationClaimRepo.save(claim)

  // Send notifications
  await sendNotification(
    claim.charityOrg.UserID,
    'DONATION_DELIVERY_FAILED',
    `Donation delivery failed for claim #${claimId}. Reason: ${reason}`,
    claimId
  )

  await sendNotification(
    claim.donor.UserID,
    'DONATION_DELIVERY_FAILED',
    `Donation delivery failed for claim #${claimId}. Reason: ${reason}`,
    claimId
  )

  return claim
}

// Get donation claim details
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

  // Check if user has access to this claim
  const hasAccess = claim.donor.UserID === userId || 
                   claim.charityOrg.UserID === userId ||
                   claim.delivery?.organizationVolunteer?.user.UserID === userId

  if (!hasAccess) {
    throw new UnauthorizedActionError('Access denied')
  }

  return claim
}

// Get charity organization's claims
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

// Get donor's donation offers (claims on their donations)
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

// Get volunteer's assigned donation deliveries
export async function getMyDonationDeliveries(volunteerId: number, offset: number, limit: number): Promise<any> {
  const deliveries = await deliveryRepo.find({
    where: { 
      organizationVolunteer: { user: { UserID: volunteerId } },
       claim: Not(IsNull()) // Only donation deliveries
    },
    relations: ['claim', 'claim.donor', 'claim.charityOrg', 'claim.listing'],
    skip: offset,
    take: limit,
    order: { DeliveryID: 'DESC' }
  })

  return deliveries
}

// Cancel donation claim
export async function cancelDonationClaim(userId: number, claimId: number, reason?: string): Promise<any> {
  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: claimId },
    relations: ['donor', 'charityOrg', 'listing', 'delivery']
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (claim.donor.UserID !== userId && claim.charityOrg.UserID !== userId) {
    throw new UnauthorizedActionError('Only donor or charity organization can cancel this claim')
  }

  if (claim.ClaimStatus === ClaimStatus.APPROVED && claim.delivery?.DeliveryStatus === DeliveryStatus.DELIVERED) {
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

  // Send notifications
  const cancellerRole = claim.donor.UserID === userId ? 'donor' : 'charity organization'
  const otherPartyId = cancellerRole === 'donor' ? claim.charityOrg.UserID : claim.donor.UserID

  await sendNotification(
    otherPartyId,
    'DONATION_CLAIM_CANCELLED',
    `Donation claim #${claimId} has been cancelled by the ${cancellerRole}. ${reason ? 'Reason: ' + reason : ''}`,
    claimId
  )

  return updatedClaim
}


async function findAvailableOrgVolunteer(charityOrgId: number): Promise<any> {
  const volunteer = await orgVolunteerRepo.findOne({
    where: { 
      charityOrg: { ProfileID: charityOrgId },
      IsActive: true
    },
    relations: ['user'],
    select: {
      OrgVolunteerID: true,
      VolunteerName: true,
      VolunteerContactPhone: true,
      user: { UserID: true }
    }
  })

  return volunteer
}


function validatePickupCode(providedCode: string, claimId: number): boolean {
  return true 
}