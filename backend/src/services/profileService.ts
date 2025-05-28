import { AppDataSource } from '../config/data-source'
import { User, UserRole } from '../models/User'
import { DonorSeller } from '../models/DonorSeller'
import { CharityOrganization } from '../models/CharityOrganization'
import { Buyer } from '../models/Buyer'
import { IndependentDelivery } from '../models/IndependentDelivery'
import { OrganizationVolunteer } from '../models/OrganizationVolunteer'
import { validateCompleteProfileData , validateUpdateProfileData } from '../validations/profileValidation' 
import {
  UserDoesNotExistError,
  EmailNotVerifiedError,
  ProfileAlreadyCompletedError,
  ProfileNotFoundError,
  CharityOrganizationNotFoundError,
  InvalidRoleError
} from '../utils/errors'

export interface DonorSellerProfileInput {
  BusinessName: string
}

export interface CharityOrgProfileInput {
  OrganizationName: string
  GovRegistrationDocPath: string
  AddressLine1: string
}

export interface BuyerProfileInput {
  DefaultDeliveryAddress: string
}

export interface IndependentDeliveryProfileInput {
  FullName: string
  SelfiePath: string
  NIDPath: string
  OperatingAreas: Record<string, any>
}

export interface OrganizationVolunteerProfileInput {
  CharityOrgID: number
  VolunteerName: string
  VolunteerContactPhone: string
}


const userRepo = AppDataSource.getRepository(User)
const donorSellerRepo = AppDataSource.getRepository(DonorSeller)
const charityOrgRepo = AppDataSource.getRepository(CharityOrganization)
const buyerRepo = AppDataSource.getRepository(Buyer)
const independentDeliveryRepo = AppDataSource.getRepository(IndependentDelivery)
const orgVolunteerRepo = AppDataSource.getRepository(OrganizationVolunteer)


function cleanProfileResponse(profile: any): any {
  if (!profile) return profile
  
  const { user, ...cleanProfile } = profile
  return cleanProfile
}


export async function completeProfile(
  userId: number,
  profileData: any
) {
  const user = await userRepo.findOne({
    where: { UserID: userId },
    relations: [
      'donorSeller',
      'charityOrganization',
      'buyer',
      'independentDelivery',
      'organizationVolunteer'
    ]
  })

  if (!user) {
    throw new UserDoesNotExistError()
  }

  if (!user.IsEmailVerified) {
    throw new EmailNotVerifiedError('Email must be verified before completing profile')
  }

  const hasExistingProfile = user.donorSeller || 
                            user.charityOrganization || 
                            user.buyer || 
                            user.independentDelivery || 
                            user.organizationVolunteer

  if (hasExistingProfile) {
    throw new ProfileAlreadyCompletedError()
  }

  if (profileData.PhoneNumber) {
    user.PhoneNumber = profileData.PhoneNumber
    await userRepo.save(user)
  }

  await validateCompleteProfileData(profileData, user.Role);

  let createdProfile: any

  switch (user.Role) {
    case UserRole.DONOR_SELLER:
      createdProfile = await createDonorSellerProfile(user, profileData as DonorSellerProfileInput)
      break
    
    case UserRole.CHARITY_ORG:
      createdProfile = await createCharityOrgProfile(user, profileData as CharityOrgProfileInput)
      break
    
    case UserRole.BUYER:
      createdProfile = await createBuyerProfile(user, profileData as BuyerProfileInput)
      break
    
    case UserRole.INDEP_DELIVERY:
      createdProfile = await createIndependentDeliveryProfile(user, profileData as IndependentDeliveryProfileInput)
      break
    
    case UserRole.ORG_VOLUNTEER:
      createdProfile = await createOrganizationVolunteerProfile(user, profileData as OrganizationVolunteerProfileInput)
      break
    
    default:
      throw new InvalidRoleError()
  }

  return {
    user: {
      UserID: user.UserID,
      Username: user.Username,
      Email: user.Email,
      PhoneNumber: user.PhoneNumber,
      Role: user.Role
    },
    profile: cleanProfileResponse(createdProfile)
  }
}


async function createDonorSellerProfile(user: User, data: DonorSellerProfileInput) {
  const profile = donorSellerRepo.create({
    user: user,
    BusinessName: data.BusinessName,
  })
  
  return await donorSellerRepo.save(profile)
}


async function createCharityOrgProfile(user: User, data: CharityOrgProfileInput) {
  const profile = charityOrgRepo.create({
    user: user,
    OrganizationName: data.OrganizationName,
    GovRegistrationDocPath: data.GovRegistrationDocPath,
    AddressLine1: data.AddressLine1,
    IsDocVerifiedByAdmin: false
  })
  
  return await charityOrgRepo.save(profile)
}


async function createBuyerProfile(user: User, data: BuyerProfileInput) {
  const profile = buyerRepo.create({
    user: user,
    DefaultDeliveryAddress: data.DefaultDeliveryAddress
  })
  
  return await buyerRepo.save(profile)
}


async function createIndependentDeliveryProfile(user: User, data: IndependentDeliveryProfileInput) {
  const profile = independentDeliveryRepo.create({
    user: user,
    FullName: data.FullName,
    SelfiePath: data.SelfiePath,
    NIDPath: data.NIDPath,
    OperatingAreas: data.OperatingAreas,
    IsIDVerifiedByAdmin: false,
    CurrentRating: 0
  })
  
  return await independentDeliveryRepo.save(profile)
}


async function createOrganizationVolunteerProfile(user: User, data: OrganizationVolunteerProfileInput) {
  const charityOrg = await charityOrgRepo.findOne({
    where: { ProfileID: data.CharityOrgID }
  })
  
  if (!charityOrg) {
    throw new CharityOrganizationNotFoundError()
  }

  const profile = orgVolunteerRepo.create({
    user: user,
    charityOrg: charityOrg,
    VolunteerName: data.VolunteerName,
    VolunteerContactPhone: data.VolunteerContactPhone,
    IsActive: true
  })
  
  return await orgVolunteerRepo.save(profile)
}


export async function getProfile(userId: number) {
  const user = await userRepo.findOne({
    where: { UserID: userId },
    relations: [
      'donorSeller',
      'charityOrganization',
      'charityOrganization.volunteers',
      'buyer',
      'independentDelivery',
      'organizationVolunteer',
      'organizationVolunteer.charityOrg'
    ]
  })

  if (!user) {
    throw new UserDoesNotExistError()
  }

  const profile = user.donorSeller || 
                  user.charityOrganization || 
                  user.buyer || 
                  user.independentDelivery || 
                  user.organizationVolunteer

  return {
    user: {
      UserID: user.UserID,
      Username: user.Username,
      Email: user.Email,
      PhoneNumber: user.PhoneNumber,
      Role: user.Role,
      RegistrationDate: user.RegistrationDate,
      IsEmailVerified: user.IsEmailVerified,
      AccountStatus: user.AccountStatus
    },
    profile: cleanProfileResponse(profile),
    profileCompleted: !!profile
  }
}



export async function updateProfile(userId: number, updateData: any) {
  const user = await userRepo.findOne({
    where: { UserID: userId },
    relations: [
      'donorSeller',
      'charityOrganization',
      'buyer',
      'independentDelivery',
      'organizationVolunteer'
    ]
  })

  if (!user) {
    throw new UserDoesNotExistError()
  }

  if (updateData.PhoneNumber !== undefined) {
    user.PhoneNumber = updateData.PhoneNumber
    await userRepo.save(user)
  }

  await validateUpdateProfileData(updateData, user.Role as any);
  
  let updatedProfile: any

  switch (user.Role) {
    case UserRole.DONOR_SELLER:
      if (!user.donorSeller) {
        throw new ProfileNotFoundError()
      }
      if (updateData.BusinessName) {
        user.donorSeller.BusinessName = updateData.BusinessName
      }
      updatedProfile = await donorSellerRepo.save(user.donorSeller)
      break

    case UserRole.CHARITY_ORG:
      if (!user.charityOrganization) {
        throw new ProfileNotFoundError()
      }
      if (updateData.OrganizationName) {
        user.charityOrganization.OrganizationName = updateData.OrganizationName
      }
      if (updateData.AddressLine1) {
        user.charityOrganization.AddressLine1 = updateData.AddressLine1
      }
      updatedProfile = await charityOrgRepo.save(user.charityOrganization)
      break

    case UserRole.BUYER:
      if (!user.buyer) {
        throw new ProfileNotFoundError()
      }
      if (updateData.DefaultDeliveryAddress) {
        user.buyer.DefaultDeliveryAddress = updateData.DefaultDeliveryAddress
      }
      updatedProfile = await buyerRepo.save(user.buyer)
      break

    case UserRole.INDEP_DELIVERY:
      if (!user.independentDelivery) {
        throw new ProfileNotFoundError()
      }
      if (updateData.FullName) {
        user.independentDelivery.FullName = updateData.FullName
      }
      if (updateData.OperatingAreas) {
        user.independentDelivery.OperatingAreas = updateData.OperatingAreas
      }
      updatedProfile = await independentDeliveryRepo.save(user.independentDelivery)
      break

    case UserRole.ORG_VOLUNTEER:
      if (!user.organizationVolunteer) {
        throw new ProfileNotFoundError()
      }
      if (updateData.VolunteerName) {
        user.organizationVolunteer.VolunteerName = updateData.VolunteerName
      }
      if (updateData.VolunteerContactPhone) {
        user.organizationVolunteer.VolunteerContactPhone = updateData.VolunteerContactPhone
      }
      updatedProfile = await orgVolunteerRepo.save(user.organizationVolunteer)
      break

    default:
      throw new InvalidRoleError('Cannot update profile for this role')
  }

  return {
    user: {
      UserID: user.UserID,
      Username: user.Username,
      Email: user.Email,
      PhoneNumber: user.PhoneNumber,
      Role: user.Role
    },
    profile: cleanProfileResponse(updatedProfile)
  }
}