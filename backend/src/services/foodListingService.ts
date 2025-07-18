import { AppDataSource } from '../config/data-source'
import { User, UserRole } from '../models/User'
import { FoodListing, ListingStatus } from '../models/FoodListing'
import { validateFoodListingData } from '../validations/foodListingValidation'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../utils/imageUploads'
import {
  UserDoesNotExistError,
  ProfileNotFoundError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../utils/errors'
import logger from '../utils/logger'

export interface FoodListingInput {
  Title: string;
  Description: string;
  FoodType: string;
  CookedDate: string;
  PickupWindowStart: string;
  PickupWindowEnd?: string;
  PickupLocation?: string;
  IsDonation: boolean;
  Price?: number;
  Quantity?: string;
  DietaryInfo?: string;
}

export interface FoodListingFilters {
  foodType?: string
  isDonation?: string
  minPrice?: string
  maxPrice?: string
  location?: string
  status?: string
  limit?: string
  offset?: string
}

export interface SearchParams {
  q?: string 
  foodType?: string
  isDonation?: string
  minPrice?: string
  maxPrice?: string
  location?: string
  radius?: string 
  sortBy?: string 
  sortOrder?: string 
  limit?: string
  offset?: string
}

const userRepo = AppDataSource.getRepository(User)
const foodListingRepo = AppDataSource.getRepository(FoodListing)

// Helper function to validate and parse filter parameters
function validateFilters(filters: FoodListingFilters): {
  minPrice?: number;
  maxPrice?: number;
  isDonation?: boolean;
  limit: number;
  offset: number;
} {
  const result: any = {};
  
  if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
    result.minPrice = parseFloat(filters.minPrice);
  }
  
  if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
    result.maxPrice = parseFloat(filters.maxPrice);
  }
  
  if (filters.isDonation !== undefined) {
    result.isDonation = filters.isDonation === 'true';
  }
  
  result.limit = filters.limit ? Math.min(parseInt(filters.limit) || 20, 100) : 20;
  result.offset = filters.offset ? Math.max(parseInt(filters.offset) || 0, 0) : 0;
  
  return result;
}

// Helper function to validate and parse search parameters
function validateSearchParams(searchParams: SearchParams): {
  minPrice?: number;
  maxPrice?: number;
  isDonation?: boolean;
  limit: number;
  offset: number;
} {
  const result: any = {};
  
  if (searchParams.minPrice && !isNaN(parseFloat(searchParams.minPrice))) {
    result.minPrice = parseFloat(searchParams.minPrice);
  }
  
  if (searchParams.maxPrice && !isNaN(parseFloat(searchParams.maxPrice))) {
    result.maxPrice = parseFloat(searchParams.maxPrice);
  }
  
  if (searchParams.isDonation !== undefined) {
    result.isDonation = searchParams.isDonation === 'true';
  }
  
  result.limit = searchParams.limit ? Math.min(parseInt(searchParams.limit) || 20, 100) : 20;
  result.offset = searchParams.offset ? Math.max(parseInt(searchParams.offset) || 0, 0) : 0;
  
  return result;
}

export async function createFoodListingWithImage(
  userId: number, 
  listingData: FoodListingInput,
  imageFile?: Express.Multer.File
) {
  return await AppDataSource.transaction(async manager => {
    const userRepo = manager.getRepository(User);
    const foodListingRepo = manager.getRepository(FoodListing);
    
    const user = await userRepo.findOne({
      where: { UserID: userId },
      relations: ['donorSeller'],
      select: {
        UserID: true,
        Username: true,
        Email: true,
        PhoneNumber: true,
        Role: true,
        AccountStatus: true,
        donorSeller: {
          ProfileID: true,
          BusinessName: true
        }
      }
    });

    if (!user) throw new UserDoesNotExistError();
    if (user.Role !== UserRole.DONOR_SELLER) {
      logger.warn('Unauthorized attempt to create food listing', { userId })
      throw new UnauthorizedActionError('Only donors/sellers can create food listings');
    }
    if (!user.donorSeller) throw new ProfileNotFoundError('Donor/Seller profile not found');

    const validatedData = await validateFoodListingData(listingData);

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;
    if (imageFile) {
      try {
        const uploadResult = await uploadImageToCloudinary(imageFile, 'food-listings');
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
        logger.info('Image uploaded to Cloudinary', { userId, imageUrl });
      } catch (error) {
        logger.error('Image upload failed', { error });
        throw new ValidationError(`Image upload failed: ${error}`);
      }
    }

    const pickupStart = new Date(listingData.PickupWindowStart);
    const pickupEnd = listingData.PickupWindowEnd 
      ? new Date(listingData.PickupWindowEnd)
      : new Date(pickupStart.getTime() + 4 * 60 * 60 * 1000);

    const foodListing = new FoodListing();
    foodListing.donor = user;
    foodListing.Title = listingData.Title;
    foodListing.Description = listingData.Description;
    foodListing.FoodType = listingData.FoodType;
    foodListing.CookedDate = new Date(listingData.CookedDate);
    foodListing.IsDonation = validatedData.IsDonation;
    foodListing.Price = validatedData.Price;
    foodListing.ImagePath = imageUrl;
    foodListing.ImagePublicId = imagePublicId;
    foodListing.Quantity = validatedData.Quantity;
    foodListing.DietaryInfo = validatedData.DietaryInfo;
    foodListing.ListingStatus = ListingStatus.ACTIVE;
    foodListing.PickupWindowStart = pickupStart;
    foodListing.PickupWindowEnd = pickupEnd;
    foodListing.PickupLocation = validatedData.PickupLocation;

    const savedListing = await foodListingRepo.save(foodListing);
    logger.info('Food listing created', { userId, listingId: savedListing.ListingID });

    return {
      listing: savedListing,
      donorSeller: {
        BusinessName: user.donorSeller.BusinessName,
        UserID: user.UserID,
        Username: user.Username
      }
    };
  });
}



export async function getAllFoodListings(filters: FoodListingFilters, offset: number, limit: number) {
  const validatedFilters = validateFilters(filters);
  
  const queryBuilder = foodListingRepo.createQueryBuilder('listing')
    .leftJoinAndSelect('listing.donor', 'donor')
    .leftJoinAndSelect('donor.donorSeller', 'donorSeller')
    .where('listing.ListingStatus = :status', { status: ListingStatus.ACTIVE })
    .andWhere('listing.PickupWindowEnd > :now', { now: new Date() })
    .andWhere('listing.CreatedAt > :now', { now: new Date(Date.now() - 24 * 60 * 60 * 1000) });

  if (filters.foodType) {
    queryBuilder.andWhere('listing.FoodType ILIKE :foodType', { 
      foodType: `%${filters.foodType}%` 
    })
  }

  if (validatedFilters.isDonation !== undefined) {
    queryBuilder.andWhere('listing.IsDonation = :isDonation', { 
      isDonation: validatedFilters.isDonation 
    })
  }

  if (validatedFilters.minPrice !== undefined && validatedFilters.isDonation !== true) {
    queryBuilder.andWhere('listing.Price >= :minPrice', { 
      minPrice: validatedFilters.minPrice 
    })
  }

  if (validatedFilters.maxPrice !== undefined && validatedFilters.isDonation !== true) {
    queryBuilder.andWhere('listing.Price <= :maxPrice', { 
      maxPrice: validatedFilters.maxPrice 
    })
  }

  if (filters.location) {
    queryBuilder.andWhere('listing.PickupLocation ILIKE :location', { 
      location: `%${filters.location}%` 
    })
  }

  queryBuilder
    .skip(offset)
    .take(limit)
    .orderBy('listing.CreatedAt', 'DESC')

  const listings = await queryBuilder.getMany()

  const formattedListings = listings.map(listing => {
    const baseData = {
      listing: {
        ListingID: listing.ListingID,
        title: listing.Title,
        description: listing.Description,
        foodType: listing.FoodType,
        quantity: listing.Quantity,
        dietaryInfo: listing.DietaryInfo,
        cookedDate: listing.CookedDate,
        isDonation: listing.IsDonation,
        price: listing.Price,
        listingStatus: listing.ListingStatus,
        imagePath: listing.ImagePath,
        createdAt: listing.CreatedAt,
        pickupWindowStart: listing.PickupWindowStart,
        pickupWindowEnd: listing.PickupWindowEnd,
        pickupLocation: listing.PickupLocation,
      },
      donorSeller: {
        userId: listing.donor.UserID,
        username: listing.donor.Username,
        email: listing.donor.Email,
        phoneNumber: listing.donor.PhoneNumber,
        businessName: listing.donor.donorSeller?.BusinessName
      }
    }

    if (!listing.IsDonation && (listing.Price ?? 0) > 0) {
      const price = listing.Price ?? 0;
      const now = Date.now();
      const hoursElapsed = (now - listing.CookedDate.getTime()) / (1000 * 60 * 60);
      
      const pickupWindowEnd = listing.PickupWindowEnd ? new Date(listing.PickupWindowEnd).getTime() : 0;
      const isWithinPickupWindow = pickupWindowEnd > 0 && now <= pickupWindowEnd;
      
      // Check if food is within 24 hours of cooking time
      const hoursFromCooking = (now - listing.CookedDate.getTime()) / (1000 * 60 * 60);
      const isWithin24Hours = hoursFromCooking <= 24;
      
      if (isWithinPickupWindow && isWithin24Hours) {
        // Fixed discount: 5tk per hour elapsed from cooking time
        const discountAmount = Math.min(hoursFromCooking * 5, price * 0.5);
        const dynamicPrice = Math.max(price - discountAmount, price * 0.5);
        const discountRate = ((price - dynamicPrice) / price) * 100;
        
        return {
          ...baseData,
          listing: {
            ...baseData.listing,
            originalPrice: price,
            currentPrice: Math.round(dynamicPrice * 100) / 100,
            discountApplied: Math.round(discountRate)
          }
        }
      }
    }
    
    return baseData
  })

  return formattedListings
}


export async function getFoodListingById(listingId: number) {
  try {
    logger.info('Fetching food listing by ID', { listingId });
    
    const listing = await foodListingRepo.findOne({
      where: { 
        ListingID: listingId
       },
      relations: ['donor', 'donor.donorSeller'],
      select: {
        ListingID: true,
        Title: true,
        Description: true,
        FoodType: true,
        Quantity: true,
        DietaryInfo: true,
        CookedDate: true,
        IsDonation: true,
        Price: true,
        ListingStatus: true,
        ImagePath: true,
        ImagePublicId: true,
        CreatedAt: true,
        PickupWindowStart: true,
        PickupWindowEnd: true,
        PickupLocation: true,
        donor: {
          UserID: true,
          Username: true,
          Email: true,
          PhoneNumber: true,
          Role: true,
          AccountStatus: true,
          donorSeller: {
            ProfileID: true,
            BusinessName: true
          }
        }
      }
    })

    if (!listing) {
      logger.warn('Food listing not found in database', { listingId });
      throw new FoodListingNotFoundError()
    }

    logger.info('Food listing found successfully', { 
      listingId, 
      title: listing.Title, 
      status: listing.ListingStatus,
      donorId: listing.donor.UserID
    });

    const cookedDateTimestamp = new Date(listing.CookedDate).getTime();
    const currentTimestamp = Date.now();
    const hoursFromCooking = (currentTimestamp - cookedDateTimestamp) / (1000 * 60 * 60);

    const price = parseFloat((listing.Price ?? 0).toString());

    // applying discount if within pickup window and not a donation
    if (!listing.IsDonation && price > 0) {
      const pickupWindowEnd = listing.PickupWindowEnd ? new Date(listing.PickupWindowEnd).getTime() : 0;
      const isWithinPickupWindow = pickupWindowEnd > 0 && currentTimestamp <= pickupWindowEnd;
      
      // Check if food is within 24 hours of cooking time
      const isWithin24Hours = hoursFromCooking <= 24;
      
      if (isWithinPickupWindow && isWithin24Hours) {
        // Fixed discount: 5tk per hour elapsed from cooking time
        const discountAmount = Math.min(hoursFromCooking * 5, price * 0.5);
        const discountedPrice = Math.max(price - discountAmount, price * 0.5);
        const discountRate = ((price - discountedPrice) / price);
        
        logger.info('Applied dynamic pricing', { 
          listingId, 
          originalPrice: price, 
          discountedPrice: Math.round(discountedPrice * 100) / 100,
          discountRate: Math.round(discountRate * 100),
          hoursFromCooking: hoursFromCooking.toFixed(2)
        });
        return {
          ...listing,
          originalPrice: price,
          currentPrice: Math.round(discountedPrice * 100) / 100, 
          discountApplied: Math.round(discountRate * 100) 
        };
      }
    }

    return listing;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Error fetching food listing by ID', { listingId, error: errorMessage, stack: errorStack });
    throw error;
  }
}


export async function updateFoodListingWithImage(
  userId: number, 
  listingId: number, 
  updateData: Partial<FoodListingInput>,
  imageFile?: Express.Multer.File
) {
  const listing = await foodListingRepo.findOne({
    where: { ListingID: listingId },
    relations: ['donor'],
    select: {
      ListingID: true,
      Title: true,
      Description: true,
      FoodType: true,
      Quantity: true,
      DietaryInfo: true,
      CookedDate: true,
      IsDonation: true,
      Price: true,
      ListingStatus: true,
      ImagePath: true,
      ImagePublicId: true,
      CreatedAt: true,
      PickupWindowStart: true,
      PickupWindowEnd: true,
      PickupLocation: true,
      donor: {
        UserID: true,
        Username: true,
        Role: true
      }
    }
  })

  if (!listing) {
    throw new FoodListingNotFoundError()
  }

  if (listing.donor.UserID !== userId) {
    throw new UnauthorizedActionError('You can only update your own listings')
  }

  if (listing.ListingStatus !== ListingStatus.ACTIVE) {
    throw new ValidationError('Cannot update inactive listings')
  }

  if (imageFile) {
    let imageUrl = null
    let imagePublicId = null
    let oldImagePublicId = listing.ImagePublicId

    try {
      const uploadResult = await uploadImageToCloudinary(imageFile, 'food-listings')
      imageUrl = uploadResult.url
      imagePublicId = uploadResult.publicId

      listing.ImagePath = imageUrl
      listing.ImagePublicId = imagePublicId

      logger.info('Image updated for food listing', { listingId, imageUrl });
    } catch (error) {
      logger.error('Image upload failed', { error });
      throw new ValidationError(`Image upload failed: ${error}`)
    }
    //Old image delete
    if (oldImagePublicId) {
      try {
        await deleteImageFromCloudinary(oldImagePublicId)
        logger.info('Old image deleted from Cloudinary', { listingId, oldImagePublicId });
      } catch (error) {
        logger.error('Failed to delete old image from Cloudinary', { error, listingId, oldImagePublicId });
      
      }
    }
  }

  if (updateData.Title) listing.Title = updateData.Title
  if (updateData.Description) listing.Description = updateData.Description
  if (updateData.Price !== undefined && !listing.IsDonation) {
    listing.Price = updateData.Price
  }
  if (updateData.PickupWindowStart) {
    listing.PickupWindowStart = new Date(updateData.PickupWindowStart)
  }
  if (updateData.PickupWindowEnd) {
    listing.PickupWindowEnd = new Date(updateData.PickupWindowEnd)
  }
  if (updateData.PickupLocation) listing.PickupLocation = updateData.PickupLocation
  if (updateData.Quantity) listing.Quantity = updateData.Quantity
  if (updateData.DietaryInfo) listing.DietaryInfo = updateData.DietaryInfo

  const updatedListing = await foodListingRepo.save(listing)
  logger.info('Food listing updated', { listingId });
  return updatedListing
}



export async function deleteFoodListing(userId: number, listingId: number) {
  return await AppDataSource.transaction(async manager => {
    const foodListingRepo = manager.getRepository(FoodListing);
    
    const listing = await foodListingRepo.findOne({
      where: { ListingID: listingId },
      relations: ['donor'],
      select: {
        ListingID: true,
        ImagePublicId: true,
        donor: {
          UserID: true
        }
      }
    })

    if (!listing) {
      logger.warn('Food listing not found for deletion', { listingId });
      throw new FoodListingNotFoundError()
    }

    if (listing.donor.UserID !== userId) {
      logger.warn('Unauthorized attempt to delete food listing', { userId, listingId });
      throw new UnauthorizedActionError('You can only delete your own listings')
    }

    // Delete from database 
    await foodListingRepo.remove(listing)
    logger.info('Food listing deleted from database', { userId, listingId });

    if (listing.ImagePublicId) {
      try {
        await deleteImageFromCloudinary(listing.ImagePublicId)
        logger.info('Deleted image from Cloudinary', { listingId, imagePublicId: listing.ImagePublicId });
      } catch (error) {
        logger.error('Failed to delete image from Cloudinary but listing was deleted', { 
          error, 
          listingId, 
          imagePublicId: listing.ImagePublicId 
        });
   
      }
    }
  });
}



export async function getMyFoodListings(userId: number, filters: FoodListingFilters, offset: number, limit: number) {
  const validatedFilters = validateFilters(filters);
  
  const queryBuilder = foodListingRepo.createQueryBuilder('listing')
    .leftJoinAndSelect('listing.donor', 'donor')
    .where('listing.donor.UserID = :userId', { userId })

  if (filters.status) {
    queryBuilder.andWhere('listing.ListingStatus = :status', { status: filters.status })
  } else {
    queryBuilder.andWhere('listing.ListingStatus != :removedStatus', { 
      removedStatus: ListingStatus.REMOVED 
    })
  }

  if (filters.foodType) {
    queryBuilder.andWhere('listing.FoodType ILIKE :foodType', { 
      foodType: `%${filters.foodType}%` 
    })
  }

  if (validatedFilters.isDonation !== undefined) {
    queryBuilder.andWhere('listing.IsDonation = :isDonation', { 
      isDonation: validatedFilters.isDonation 
    })
  }

  const listings = await queryBuilder
    .skip(offset)
    .take(limit)
    .orderBy('listing.CreatedAt', 'DESC')
    .select([
      'listing',
      'donor.UserID',
      'donor.Username',
      'donor.Email',
      'donor.PhoneNumber',
      'donor.Role',
      'donor.AccountStatus'
    ])
    .getMany()

  const formattedListings = listings.map(listing => ({
    listing: {
      ListingID: listing.ListingID,
      title: listing.Title,
      description: listing.Description,
      foodType: listing.FoodType,
      quantity: listing.Quantity,
      dietaryInfo: listing.DietaryInfo,
      cookedDate: listing.CookedDate,
      isDonation: listing.IsDonation,
      price: listing.Price,
      listingStatus: listing.ListingStatus,
      imagePath: listing.ImagePath,
      createdAt: listing.CreatedAt,
      pickupWindowStart: listing.PickupWindowStart,
      pickupWindowEnd: listing.PickupWindowEnd,
      pickupLocation: listing.PickupLocation,
    },
    donor: {
      userId: listing.donor.UserID,
      username: listing.donor.Username,
      email: listing.donor.Email,
      phoneNumber: listing.donor.PhoneNumber,
      role: listing.donor.Role,
      accountStatus: listing.donor.AccountStatus
    }
  }))

  return formattedListings
}



export async function negotiatePrice(buyerId: number, listingId: number, proposedPrice: number) {
  const listing = await foodListingRepo.findOne({
    where: { ListingID: listingId },
    relations: ['donor'],
    select: {
      ListingID: true,
      IsDonation: true,
      Price: true,
      ListingStatus: true,
      donor: {
        UserID: true
      }
    }
  })

  if (!listing) {
    throw new FoodListingNotFoundError()
  }

  if (listing.IsDonation) {
    throw new ValidationError('Cannot negotiate price for donation items')
  }

  if (listing.ListingStatus !== ListingStatus.ACTIVE) {
    throw new ValidationError('Cannot negotiate price for inactive listings')
  }

  if (listing.donor.UserID === buyerId) {
    throw new ValidationError('Cannot negotiate price on your own listing')
  }

  if (proposedPrice <= 0) {
    throw new ValidationError('Proposed price must be greater than 0')
  }

  const currentPrice = listing.Price ?? 0;

  return {
    listingId,
    currentPrice,
    proposedPrice,
    sellerId: listing.donor.UserID,
    buyerId,
    message: 'Price negotiation request sent to seller'
  }
}



export async function searchFoodListings(
  searchParams: SearchParams,
  offset: number,
  limit: number
) {
  const validatedParams = validateSearchParams(searchParams);
  
  const queryBuilder = foodListingRepo
    .createQueryBuilder('listing')
    .leftJoinAndSelect('listing.donor', 'donor')
    .leftJoinAndSelect('donor.donorSeller', 'donorSeller')
    .where('listing.ListingStatus = :status', { status: ListingStatus.ACTIVE })
    .andWhere('listing.PickupWindowEnd > :now', { now: new Date() })
    .andWhere('listing.CreatedAt > :now', { now: new Date(Date.now() - 24 * 60 * 60 * 1000) });

  if (searchParams.q) {
    queryBuilder.andWhere(
      '(listing.Title ILIKE :search OR listing.Description ILIKE :search OR listing.FoodType ILIKE :search)',
      { search: `%${searchParams.q}%` }
    );
  }

  if (searchParams.foodType) {
    queryBuilder.andWhere('listing.FoodType ILIKE :foodType', {
      foodType: `%${searchParams.foodType}%`
    });
  }

  if (validatedParams.isDonation !== undefined) {
    queryBuilder.andWhere('listing.IsDonation = :isDonation', { isDonation: validatedParams.isDonation });
  }

  if (validatedParams.minPrice !== undefined && validatedParams.isDonation !== true) {
    queryBuilder.andWhere('listing.Price >= :minPrice', {
      minPrice: validatedParams.minPrice
    });
  }

  if (validatedParams.maxPrice !== undefined && validatedParams.isDonation !== true) {
    queryBuilder.andWhere('listing.Price <= :maxPrice', {
      maxPrice: validatedParams.maxPrice
    });
  }

  if (searchParams.location) {
    queryBuilder.andWhere('listing.PickupLocation ILIKE :location', {
      location: `%${searchParams.location}%`
    });
  }

  const sortBy = searchParams.sortBy || 'date';
  const sortOrder = searchParams.sortOrder === 'desc' ? 'DESC' : 'ASC';
  if (sortBy === 'price') {
    queryBuilder.orderBy('listing.Price', sortOrder);
  } else {
    queryBuilder.orderBy('listing.CreatedAt', sortOrder);
  }

  queryBuilder.skip(offset).take(limit);

  queryBuilder.select([
    'listing',
    'donor.UserID',
    'donor.Username',
    'donor.Email',
    'donor.PhoneNumber',
    'donor.Role',
    'donor.AccountStatus',
    'donorSeller.ProfileID',
    'donorSeller.BusinessName'
  ]);

  const listings = await queryBuilder.getMany();

  const formattedListings = listings.map(listing => {
    const baseData = {
      listing: {
        ListingID: listing.ListingID,
        title: listing.Title,
        description: listing.Description,
        foodType: listing.FoodType,
        quantity: listing.Quantity,
        dietaryInfo: listing.DietaryInfo,
        cookedDate: listing.CookedDate,
        isDonation: listing.IsDonation,
        price: listing.Price,
        listingStatus: listing.ListingStatus,
        imagePath: listing.ImagePath,
        createdAt: listing.CreatedAt,
        pickupWindowStart: listing.PickupWindowStart,
        pickupWindowEnd: listing.PickupWindowEnd,
        pickupLocation: listing.PickupLocation,
      },
      donorSeller: {
        userId: listing.donor.UserID,
        username: listing.donor.Username,
        email: listing.donor.Email,
        phoneNumber: listing.donor.PhoneNumber,
        businessName: listing.donor.donorSeller?.BusinessName
      }
    }

    // dynamic pricing for non-donation items
    if (!listing.IsDonation && (listing.Price ?? 0) > 0) {
      const price = listing.Price ?? 0;
      const now = Date.now();
      const hoursFromCooking = (now - listing.CookedDate.getTime()) / (1000 * 60 * 60);
      
      // applying discount if within pickup window
      const pickupWindowEnd = listing.PickupWindowEnd ? new Date(listing.PickupWindowEnd).getTime() : 0;
      const isWithinPickupWindow = pickupWindowEnd > 0 && now <= pickupWindowEnd;
      
      // Check if food is within 24 hours of cooking time
      const isWithin24Hours = hoursFromCooking <= 24;
      
      if (isWithinPickupWindow && isWithin24Hours) {
        // Fixed discount: 5tk per hour elapsed from cooking time
        const discountAmount = Math.min(hoursFromCooking * 5, price * 0.5);
        const dynamicPrice = Math.max(price - discountAmount, price * 0.5);
        const discountRate = ((price - dynamicPrice) / price) * 100;
        
        return {
          ...baseData,
          listing: {
            ...baseData.listing,
            originalPrice: price,
            currentPrice: Math.round(dynamicPrice * 100) / 100,
            discountApplied: Math.round(discountRate)
          }
        }
      }
    }
    
    return baseData
  });

  return {
    listings: formattedListings,
    searchQuery: searchParams.q
  };
}



export async function getFoodListingStats(userId: number) {
  const stats = await foodListingRepo
    .createQueryBuilder('listing')
    .select([
      'COUNT(*) as totalListings',
      'COUNT(CASE WHEN listing.ListingStatus = :active THEN 1 END) as activeListings',
      'COUNT(CASE WHEN listing.ListingStatus = :claimed THEN 1 END) as claimedListings',
      'COUNT(CASE WHEN listing.IsDonation = true THEN 1 END) as donationListings',
      'COUNT(CASE WHEN listing.IsDonation = false THEN 1 END) as saleListings',
      'COALESCE(AVG(CASE WHEN listing.IsDonation = false THEN listing.Price END), 0) as avgPrice'
    ])
    .where('listing.donor.UserID = :userId', { userId })
    .setParameter('active', ListingStatus.ACTIVE)
    .setParameter('claimed', ListingStatus.CLAIMED)
    .getRawOne()

  return {
    totalListings: parseInt(stats.totalListings),
    activeListings: parseInt(stats.activeListings),
    claimedListings: parseInt(stats.claimedListings),
    donationListings: parseInt(stats.donationListings),
    saleListings: parseInt(stats.saleListings),
    averagePrice: parseFloat(stats.avgPrice).toFixed(2)
  }
}



export async function toggleListingStatus(userId: number, listingId: number, status: ListingStatus) {
  const listing = await foodListingRepo.findOne({
    where: { ListingID: listingId },
    relations: ['donor'],
    select: {
      ListingID: true,
      ListingStatus: true,
      donor: {
        UserID: true
      }
    }
  })

  if (!listing) {
    throw new FoodListingNotFoundError()
  }

  if (listing.donor.UserID !== userId) {
    throw new UnauthorizedActionError('You can only update your own listings')
  }

  const validStatuses = Object.values(ListingStatus)
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid listing status')
  }

  const previousStatus = listing.ListingStatus;
  listing.ListingStatus = status
  const updatedListing = await foodListingRepo.save(listing)

  return {
    ListingID: listingId,
    previousStatus,
    newStatus: status,
    listing: updatedListing
  }
}