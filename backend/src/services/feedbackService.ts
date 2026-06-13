import { AppDataSource } from '../config/data-source'
import { DonationClaim } from '../models/DonationClaim'
import { FeedbackComplaint, FeedbackType } from '../models/FeedbackComplaint'
import { Order } from '../models/Order'
import { User } from '../models/User'
import { UserDoesNotExistError, UnauthorizedActionError, ValidationError } from '../utils/errors'
import logger from '../utils/logger'

interface CreateComplaintInput {
  orderId?: number
  claimId?: number
  regardingUserId?: number
  message: string
}

const feedbackRepo = AppDataSource.getRepository(FeedbackComplaint)
const userRepo = AppDataSource.getRepository(User)
const orderRepo = AppDataSource.getRepository(Order)
const donationClaimRepo = AppDataSource.getRepository(DonationClaim)

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
