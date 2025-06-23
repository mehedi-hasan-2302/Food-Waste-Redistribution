import { AppDataSource } from '../config/data-source'
import { MoreThanOrEqual } from 'typeorm';
import { User, UserRole, AccountStatus } from '../models/User'
import { CharityOrganization } from '../models/CharityOrganization'
import { IndependentDelivery } from '../models/IndependentDelivery'
import { FoodListing, ListingStatus } from '../models/FoodListing'
import { FeedbackComplaint, AdminActionStatus, FeedbackType } from '../models/FeedbackComplaint'
import { 
  UserDoesNotExistError, 
  UnauthorizedActionError, 
  ValidationError,
  ProfileNotFoundError 
} from '../utils/errors'
import logger from '../utils/logger'

export interface AdminStats {
  totalUsers: number
  totalDonors: number
  totalCharities: number
  totalBuyers: number
  totalDeliveryPersonnel: number
  pendingCharityVerifications: number
  pendingDeliveryVerifications: number
  totalFoodListings: number
  activeFoodListings: number
  totalComplaints: number
  pendingComplaints: number
}

export interface UserManagementFilters {
  role?: UserRole
  accountStatus?: AccountStatus
  isEmailVerified?: boolean
  limit?: number
  offset?: number
}

export interface VerificationRequest {
  userId: number
  type: 'charity' | 'delivery'
  status: 'approve' | 'reject'
  reason?: string
}

const userRepo = AppDataSource.getRepository(User)
const charityRepo = AppDataSource.getRepository(CharityOrganization)
const deliveryRepo = AppDataSource.getRepository(IndependentDelivery)
const foodListingRepo = AppDataSource.getRepository(FoodListing)
const feedbackRepo = AppDataSource.getRepository(FeedbackComplaint)

export async function getAdminDashboardStats(): Promise<AdminStats> {
  const [
    totalUsers,
    totalDonors,
    totalCharities,
    totalBuyers,
    totalDeliveryPersonnel,
    pendingCharityVerifications,
    pendingDeliveryVerifications,
    totalFoodListings,
    activeFoodListings,
    totalComplaints,
    pendingComplaints
  ] = await Promise.all([
    userRepo.count(),
    userRepo.count({ where: { Role: UserRole.DONOR_SELLER } }),
    userRepo.count({ where: { Role: UserRole.CHARITY_ORG } }),
    userRepo.count({ where: { Role: UserRole.BUYER } }),
    userRepo.count({ where: { Role: UserRole.INDEP_DELIVERY } }),
    charityRepo.count({ where: { IsDocVerifiedByAdmin: false } }),
    deliveryRepo.count({ where: { IsIDVerifiedByAdmin: false } }),
    foodListingRepo.count(),
    foodListingRepo.count({ where: { ListingStatus: ListingStatus.ACTIVE } }),
    feedbackRepo.count(),
    feedbackRepo.count({ where: { AdminActionStatus: AdminActionStatus.PENDING } })
  ])

  logger.info('Fetched admin dashboard stats')
  return {
    totalUsers,
    totalDonors,
    totalCharities,
    totalBuyers,
    totalDeliveryPersonnel,
    pendingCharityVerifications,
    pendingDeliveryVerifications,
    totalFoodListings,
    activeFoodListings,
    totalComplaints,
    pendingComplaints
  }
}


export async function getAllUsers(filters: UserManagementFilters) {
  const queryBuilder = userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.donorSeller', 'donorSeller')
    .leftJoinAndSelect('user.charityOrganization', 'charityOrg')
    .leftJoinAndSelect('user.buyer', 'buyer')
    .leftJoinAndSelect('user.independentDelivery', 'delivery')
    .where('user.Role != :adminRole', { adminRole: UserRole.ADMIN })

  if (filters.role) {
    queryBuilder.andWhere('user.Role = :role', { role: filters.role })
  }

  if (filters.accountStatus) {
    queryBuilder.andWhere('user.AccountStatus = :status', { status: filters.accountStatus })
  }

  if (filters.isEmailVerified !== undefined) {
    queryBuilder.andWhere('user.IsEmailVerified = :verified', { verified: filters.isEmailVerified })
  }

  const users = await queryBuilder
    .skip(filters.offset || 0)
    .take(filters.limit || 20)
    .orderBy('user.RegistrationDate', 'DESC')
    .getMany()

  logger.info('Fetched all users', { filters })
  return users.map(user => ({
    UserID: user.UserID,
    Username: user.Username,
    Email: user.Email,
    PhoneNumber: user.PhoneNumber,
    Role: user.Role,
    AccountStatus: user.AccountStatus,
    IsEmailVerified: user.IsEmailVerified,
    RegistrationDate: user.RegistrationDate,
    profile: user.donorSeller || user.charityOrganization || user.buyer || user.independentDelivery
  }))
}


export async function getPendingVerifications() {
  const [pendingCharities, pendingDelivery] = await Promise.all([
    charityRepo.find({
      where: { IsDocVerifiedByAdmin: false },
      relations: ['user'],
      select: {
        ProfileID: true,
        OrganizationName: true,
        GovRegistrationDocPath: true,
        AddressLine1: true,
        user: {
          UserID: true,
          Username: true,
          Email: true,
          PhoneNumber: true,
          RegistrationDate: true
        }
      }
    }),
    deliveryRepo.find({
      where: { IsIDVerifiedByAdmin: false },
      relations: ['user'],
      select: {
        ProfileID: true,
        FullName: true,
        SelfiePath: true,
        NIDPath: true,
        OperatingAreas: true,
        user: {
          UserID: true,
          Username: true,
          Email: true,
          PhoneNumber: true,
          RegistrationDate: true
        }
      }
    })
  ])

  logger.info('Fetched pending verifications')
  return {
    pendingCharities,
    pendingDelivery
  }
}



export async function processVerificationRequest(request: VerificationRequest) {
  const user = await userRepo.findOne({
    where: { UserID: request.userId },
    relations: ['charityOrganization', 'independentDelivery']
  })

  if (!user) {
    logger.warn('User not found for verification', { userId: request.userId })
    throw new UserDoesNotExistError()
  }

  if (request.type === 'charity') {
    if (!user.charityOrganization) {
      logger.warn('Charity organization profile not found', { userId: request.userId })
      throw new ProfileNotFoundError('Charity organization profile not found')
    }

    user.charityOrganization.IsDocVerifiedByAdmin = request.status === 'approve'
    await charityRepo.save(user.charityOrganization)

    if (request.status === 'reject') {
      user.AccountStatus = AccountStatus.CLOSED
      await userRepo.save(user)
    }
    logger.info('Processed charity verification', { userId: request.userId, status: request.status })
  } else if (request.type === 'delivery') {
    if (!user.independentDelivery) {
      logger.warn('Delivery personnel profile not found', { userId: request.userId })
      throw new ProfileNotFoundError('Delivery personnel profile not found')
    }

    user.independentDelivery.IsIDVerifiedByAdmin = request.status === 'approve'
    await deliveryRepo.save(user.independentDelivery)

    if (request.status === 'reject') {
      user.AccountStatus = AccountStatus.CLOSED
      await userRepo.save(user)
    }
    logger.info('Processed delivery verification', { userId: request.userId, status: request.status })
  }

  return {
    userId: request.userId,
    type: request.type,
    status: request.status,
    reason: request.reason
  }
}



export async function suspendUser(userId: number, reason: string) {
  const user = await userRepo.findOne({
    where: { UserID: userId },
    select: ['UserID', 'Username', 'Email', 'Role', 'AccountStatus']
  })

  if (!user) {
    logger.warn('User not found for suspension', { userId })
    throw new UserDoesNotExistError()
  }

  if (user.Role === UserRole.ADMIN) {
    logger.warn('Attempt to suspend admin user', { userId })
    throw new UnauthorizedActionError('Cannot suspend admin users')
  }

  if (user.AccountStatus === AccountStatus.CLOSED) {
    logger.warn('User already closed', { userId })
    throw new ValidationError('User is already closed')
  }

  user.AccountStatus = AccountStatus.CLOSED
  await userRepo.save(user)
  logger.info('User suspended', { userId, reason })

  return {
    userId,
    previousStatus: AccountStatus.ACTIVE,
    newStatus: AccountStatus.CLOSED,
    reason
  }
}


export async function reactivateUser(userId: number) {
  const user = await userRepo.findOne({
    where: { UserID: userId },
    select: ['UserID', 'Username', 'Email', 'Role', 'AccountStatus']
  })

  if (!user) {
    logger.warn('User not found for reactivation', { userId })
    throw new UserDoesNotExistError()
  }

  if (user.AccountStatus !== AccountStatus.CLOSED) {
    logger.warn('User is not closed for reactivation', { userId })
    throw new ValidationError('User is not closed')
  }

  user.AccountStatus = AccountStatus.ACTIVE
  await userRepo.save(user)
  logger.info('User reactivated', { userId })

  return {
    userId,
    previousStatus: AccountStatus.CLOSED,
    newStatus: AccountStatus.ACTIVE
  }
}


export async function getAllFoodListings(filters: any) {
  const queryBuilder = foodListingRepo
    .createQueryBuilder('listing')
    .leftJoinAndSelect('listing.donor', 'donor')
    .leftJoinAndSelect('donor.donorSeller', 'donorSeller')

  if (filters.status) {
    queryBuilder.where('listing.ListingStatus = :status', { status: filters.status })
  }

  if (filters.isDonation !== undefined) {
    queryBuilder.andWhere('listing.IsDonation = :isDonation', { 
      isDonation: filters.isDonation === 'true' 
    })
  }

  if (filters.foodType) {
    queryBuilder.andWhere('listing.FoodType ILIKE :foodType', { 
      foodType: `%${filters.foodType}%` 
    })
  }

  const listings = await queryBuilder
    .skip(filters.offset || 0)
    .take(filters.limit || 20)
    .orderBy('listing.CreatedAt', 'DESC')
    .getMany()

  logger.info('Fetched all food listings', { filters })
  return listings.map(listing => ({
    ...listing,
    donor: listing.donor ? {
      UserID: listing.donor.UserID,
      Username: listing.donor.Username,
      Email: listing.donor.Email,
      PhoneNumber: listing.donor.PhoneNumber,
      Role: listing.donor.Role,
      RegistrationDate: listing.donor.RegistrationDate,
      IsEmailVerified: listing.donor.IsEmailVerified,
      AccountStatus: listing.donor.AccountStatus,
      donorSeller: listing.donor.donorSeller
    } : null
  }))
}


export async function removeFoodListing(listingId: number, reason: string) {
  const listing = await foodListingRepo.findOne({
    where: { ListingID: listingId },
    relations: ['donor']
  })

  if (!listing) {
    logger.warn('Food listing not found for removal', { listingId })
    throw new ValidationError('Food listing not found')
  }

  listing.ListingStatus = ListingStatus.REMOVED
  await foodListingRepo.save(listing)
  logger.info('Food listing removed', { listingId, reason })

  return {
    listingId,
    reason,
    previousStatus: listing.ListingStatus,
    newStatus: ListingStatus.REMOVED
  }
}


export async function getAllComplaints(filters: any) {
  const queryBuilder = feedbackRepo
    .createQueryBuilder('feedback')
    .leftJoinAndSelect('feedback.submitter', 'submitter')
    .leftJoinAndSelect('feedback.regardingUser', 'regardingUser')
    .where('feedback.FeedbackType = :type', { type: 'COMPLAINT' })

  if (filters.status) {
    queryBuilder.andWhere('feedback.AdminActionStatus = :status', { status: filters.status })
  }

  const complaints = await queryBuilder
    .skip(filters.offset || 0)
    .take(filters.limit || 20)
    .orderBy('feedback.CreatedAt', 'DESC')
    .getMany()

  logger.info('Fetched all complaints', { filters })
  return complaints
}


export async function resolveComplaint(complaintId: number, action: string, adminNotes?: string) {
  const complaint = await feedbackRepo.findOne({
    where: { FeedbackID: complaintId }
  })

  if (!complaint) {
    logger.warn('Complaint not found for resolution', { complaintId })
    throw new ValidationError('Complaint not found')
  }

  complaint.AdminActionStatus = action === 'resolve' ? AdminActionStatus.RESOLVED : AdminActionStatus.DISMISSED
  complaint.AdminNotes = adminNotes
  await feedbackRepo.save(complaint)
  logger.info('Complaint resolved', { complaintId, action })

  return {
    complaintId,
    action,
    adminNotes
  }
}


export async function getSystemHealth() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    recentUsers,
    recentListings,
    systemErrors
  ] = await Promise.all([
    userRepo.count({
      where: {
        RegistrationDate: MoreThanOrEqual(sevenDaysAgo)
      }
    }),
    foodListingRepo.count({
      where: {
        CreatedAt: MoreThanOrEqual(sevenDaysAgo)
      }
    }),
    feedbackRepo.count({
      where: {
        FeedbackType: FeedbackType.COMPLAINT,
        AdminActionStatus: AdminActionStatus.PENDING
      }
    })
  ]);

  logger.info('Fetched system health')
  return {
    recentUsers,
    recentListings,
    systemErrors,
    status: systemErrors > 10 ? 'warning' : 'healthy'
  }
}