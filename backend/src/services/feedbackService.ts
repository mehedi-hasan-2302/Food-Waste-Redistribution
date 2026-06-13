import { AppDataSource } from '../config/data-source'
import { DonationClaim, ClaimStatus } from '../models/DonationClaim'
import { FeedbackComplaint, FeedbackType } from '../models/FeedbackComplaint'
import { IndependentDelivery } from '../models/IndependentDelivery'
import { Order, OrderStatus } from '../models/Order'
import { User } from '../models/User'
import { UserDoesNotExistError, UnauthorizedActionError, ValidationError } from '../utils/errors'
import logger from '../utils/logger'

interface CreateComplaintInput {
  orderId?: number
  claimId?: number
  regardingUserId?: number
  message: string
}

interface CreateRatingInput {
  orderId?: number
  claimId?: number
  regardingUserId?: number
  ratingValue: number
  message?: string
}

const feedbackRepo = AppDataSource.getRepository(FeedbackComplaint)
const userRepo = AppDataSource.getRepository(User)
const orderRepo = AppDataSource.getRepository(Order)
const donationClaimRepo = AppDataSource.getRepository(DonationClaim)
const independentDeliveryRepo = AppDataSource.getRepository(IndependentDelivery)

const pickRegardingUser = (
  submitterId: number,
  relatedUsers: User[],
  preferredUserId?: number
) => {
  const uniqueUsers = relatedUsers.filter(
    (user, index, users) =>
      user && users.findIndex(item => item.UserID === user.UserID) === index
  )

  if (preferredUserId) {
    const preferredUser = uniqueUsers.find(user => user.UserID === preferredUserId)
    if (!preferredUser || preferredUser.UserID === submitterId) {
      throw new ValidationError('Invalid user selected for this complaint')
    }
    return preferredUser
  }

  const defaultUser = uniqueUsers.find(user => user.UserID !== submitterId)
  if (!defaultUser) {
    throw new ValidationError('Complaint needs another related user')
  }
  return defaultUser
}

const ensureNoDuplicateRating = async (
  submitterId: number,
  regardingUserId: number,
  orderId?: number,
  claimId?: number
) => {
  const queryBuilder = feedbackRepo
    .createQueryBuilder('feedback')
    .leftJoin('feedback.submitter', 'submitter')
    .leftJoin('feedback.regarding', 'regarding')
    .where('feedback.FeedbackType = :type', { type: FeedbackType.RATING })
    .andWhere('submitter.UserID = :submitterId', { submitterId })
    .andWhere('regarding.UserID = :regardingUserId', { regardingUserId })

  if (orderId) {
    queryBuilder.leftJoin('feedback.order', 'order')
    queryBuilder.andWhere('order.OrderID = :orderId', { orderId })
  }

  if (claimId) {
    queryBuilder.leftJoin('feedback.claim', 'claim')
    queryBuilder.andWhere('claim.ClaimID = :claimId', { claimId })
  }

  const existingRating = await queryBuilder.getOne()
  if (existingRating) {
    throw new ValidationError('You already rated this user for this activity')
  }
}

const refreshIndependentDeliveryRating = async (userId: number) => {
  const deliveryProfile = await independentDeliveryRepo
    .createQueryBuilder('profile')
    .leftJoinAndSelect('profile.user', 'user')
    .where('user.UserID = :userId', { userId })
    .getOne()

  if (!deliveryProfile) return

  const result = await feedbackRepo
    .createQueryBuilder('feedback')
    .leftJoin('feedback.regarding', 'regarding')
    .select('AVG(feedback.RatingValue)', 'averageRating')
    .where('feedback.FeedbackType = :type', { type: FeedbackType.RATING })
    .andWhere('feedback.RatingValue IS NOT NULL')
    .andWhere('regarding.UserID = :userId', { userId })
    .getRawOne<{ averageRating: string | null }>()

  const averageRating = Number(result?.averageRating || 0)
  deliveryProfile.CurrentRating = Number(averageRating.toFixed(2))
  await independentDeliveryRepo.save(deliveryProfile)
}

export async function createComplaint(
  submitterId: number,
  input: CreateComplaintInput
) {
  const message = input.message?.trim()
  if (!message || message.length < 10) {
    throw new ValidationError('Complaint message must be at least 10 characters')
  }

  if (!input.orderId && !input.claimId) {
    throw new ValidationError('Order ID or claim ID is required')
  }

  const submitter = await userRepo.findOne({ where: { UserID: submitterId } })
  if (!submitter) {
    throw new UserDoesNotExistError()
  }

  if (input.orderId) {
    const order = await orderRepo.findOne({
      where: { OrderID: input.orderId },
      relations: [
        'buyer',
        'seller',
        'listing',
        'delivery',
        'delivery.independentDeliveryPersonnel'
      ]
    })

    if (!order) {
      throw new ValidationError('Order not found')
    }

    const relatedUsers = [
      order.buyer,
      order.seller,
      order.delivery?.independentDeliveryPersonnel
    ].filter(Boolean) as User[]
    const hasAccess = relatedUsers.some(user => user.UserID === submitterId)

    if (!hasAccess) {
      throw new UnauthorizedActionError('You can only report issues for your own order')
    }

    const complaint = feedbackRepo.create({
      submitter,
      regarding: pickRegardingUser(submitterId, relatedUsers, input.regardingUserId),
      listing: order.listing,
      order,
      delivery: order.delivery,
      FeedbackType: FeedbackType.COMPLAINT,
      Message: message
    })

    await feedbackRepo.save(complaint)
    logger.info('Order complaint created', { submitterId, orderId: input.orderId })

    return {
      complaintId: complaint.FeedbackID,
      status: complaint.AdminActionStatus,
      orderId: input.orderId
    }
  }

  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: input.claimId },
    relations: [
      'charityOrg',
      'donor',
      'listing',
      'delivery',
      'delivery.organizationVolunteer',
      'delivery.organizationVolunteer.user'
    ]
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  const relatedUsers = [
    claim.charityOrg,
    claim.donor,
    claim.delivery?.organizationVolunteer?.user
  ].filter(Boolean) as User[]
  const hasAccess = relatedUsers.some(user => user.UserID === submitterId)

  if (!hasAccess) {
    throw new UnauthorizedActionError('You can only report issues for your own donation claim')
  }

  const complaint = feedbackRepo.create({
    submitter,
    regarding: pickRegardingUser(submitterId, relatedUsers, input.regardingUserId),
    listing: claim.listing,
    claim,
    delivery: claim.delivery,
    FeedbackType: FeedbackType.COMPLAINT,
    Message: message
  })

  await feedbackRepo.save(complaint)
  logger.info('Donation complaint created', { submitterId, claimId: input.claimId })

  return {
    complaintId: complaint.FeedbackID,
    status: complaint.AdminActionStatus,
    claimId: input.claimId
  }
}

export async function getMyComplaints(submitterId: number) {
  return feedbackRepo.find({
    where: {
      submitter: { UserID: submitterId },
      FeedbackType: FeedbackType.COMPLAINT
    },
    relations: ['regarding', 'listing', 'order', 'claim', 'delivery'],
    order: { FeedbackID: 'DESC' }
  })
}

export async function createRating(submitterId: number, input: CreateRatingInput) {
  const ratingValue = Number(input.ratingValue)
  if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw new ValidationError('Rating must be between 1 and 5')
  }

  if (!input.regardingUserId) {
    throw new ValidationError('A user to rate is required')
  }

  if (!input.orderId && !input.claimId) {
    throw new ValidationError('Order ID or claim ID is required')
  }

  const submitter = await userRepo.findOne({ where: { UserID: submitterId } })
  if (!submitter) {
    throw new UserDoesNotExistError()
  }

  if (input.orderId) {
    const order = await orderRepo.findOne({
      where: { OrderID: input.orderId },
      relations: [
        'buyer',
        'seller',
        'listing',
        'delivery',
        'delivery.independentDeliveryPersonnel'
      ]
    })

    if (!order) {
      throw new ValidationError('Order not found')
    }

    if (order.OrderStatus !== OrderStatus.COMPLETED) {
      throw new ValidationError('You can rate only after the order is completed')
    }

    const relatedUsers = [
      order.buyer,
      order.seller,
      order.delivery?.independentDeliveryPersonnel
    ].filter(Boolean) as User[]
    const hasAccess = relatedUsers.some(user => user.UserID === submitterId)

    if (!hasAccess) {
      throw new UnauthorizedActionError('You can only rate users from your own order')
    }

    const regarding = pickRegardingUser(submitterId, relatedUsers, input.regardingUserId)
    await ensureNoDuplicateRating(submitterId, regarding.UserID, input.orderId)

    const rating = feedbackRepo.create({
      submitter,
      regarding,
      listing: order.listing,
      order,
      delivery: order.delivery,
      FeedbackType: FeedbackType.RATING,
      RatingValue: ratingValue,
      Message: input.message?.trim() || undefined
    })

    await feedbackRepo.save(rating)
    await refreshIndependentDeliveryRating(regarding.UserID)
    logger.info('Order rating created', { submitterId, orderId: input.orderId })

    return {
      ratingId: rating.FeedbackID,
      orderId: input.orderId,
      ratingValue
    }
  }

  const claim = await donationClaimRepo.findOne({
    where: { ClaimID: input.claimId },
    relations: [
      'charityOrg',
      'donor',
      'listing',
      'delivery',
      'delivery.organizationVolunteer',
      'delivery.organizationVolunteer.user'
    ]
  })

  if (!claim) {
    throw new ValidationError('Donation claim not found')
  }

  if (claim.ClaimStatus !== ClaimStatus.COMPLETED) {
    throw new ValidationError('You can rate only after the donation claim is completed')
  }

  const relatedUsers = [
    claim.charityOrg,
    claim.donor,
    claim.delivery?.organizationVolunteer?.user
  ].filter(Boolean) as User[]
  const hasAccess = relatedUsers.some(user => user.UserID === submitterId)

  if (!hasAccess) {
    throw new UnauthorizedActionError('You can only rate users from your own donation claim')
  }

  const regarding = pickRegardingUser(submitterId, relatedUsers, input.regardingUserId)
  await ensureNoDuplicateRating(submitterId, regarding.UserID, undefined, input.claimId)

  const rating = feedbackRepo.create({
    submitter,
    regarding,
    listing: claim.listing,
    claim,
    delivery: claim.delivery,
    FeedbackType: FeedbackType.RATING,
    RatingValue: ratingValue,
    Message: input.message?.trim() || undefined
  })

  await feedbackRepo.save(rating)
  await refreshIndependentDeliveryRating(regarding.UserID)
  logger.info('Donation rating created', { submitterId, claimId: input.claimId })

  return {
    ratingId: rating.FeedbackID,
    claimId: input.claimId,
    ratingValue
  }
}
