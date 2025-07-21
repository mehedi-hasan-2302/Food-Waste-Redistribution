import {
  createFoodListingWithImage,
  getFoodListingById,
  deleteFoodListing,
  FoodListingInput
} from '../../src/services/foodListingService';
import { User, UserRole, AccountStatus } from '../../src/models/User';
import { FoodListing, ListingStatus } from '../../src/models/FoodListing';
import {
  UserDoesNotExistError,
  ProfileNotFoundError,
  FoodListingNotFoundError,
  UnauthorizedActionError,
  ValidationError
} from '../../src/utils/errors';

// Mock dependencies
jest.mock('../../src/config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('../../src/validations/foodListingValidation');
jest.mock('../../src/utils/imageUploads');
jest.mock('../../src/utils/logger');

const mockValidateFoodListingData = require('../../src/validations/foodListingValidation').validateFoodListingData as jest.MockedFunction<any>;
const mockUploadImageToCloudinary = require('../../src/utils/imageUploads').uploadImageToCloudinary as jest.MockedFunction<any>;
const mockDeleteImageFromCloudinary = require('../../src/utils/imageUploads').deleteImageFromCloudinary as jest.MockedFunction<any>;

describe('FoodListingService', () => {
  let mockUserRepository: any;
  let mockFoodListingRepository: any;
  let mockTransaction: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock repositories
    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockFoodListingRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    // Mock transaction
    mockTransaction = {
      getRepository: jest.fn(),
    };

    // Setup AppDataSource mock
    const { AppDataSource } = require('../../src/config/data-source');
    AppDataSource.getRepository = jest.fn((entity) => {
      if (entity === User) return mockUserRepository;
      if (entity === FoodListing) return mockFoodListingRepository;
      return {};
    });
    AppDataSource.transaction = jest.fn().mockImplementation((fn) => fn(mockTransaction));

    // Setup transaction repositories
    mockTransaction.getRepository = jest.fn((entity) => {
      if (entity === User) return mockUserRepository;
      if (entity === FoodListing) return mockFoodListingRepository;
      return {};
    });

    // Mock validation
    mockValidateFoodListingData.mockResolvedValue({
      Title: 'Test Food',
      Description: 'Test Description',
      FoodType: 'Vegetables',
      CookedDate: '2024-01-15',
      PickupWindowStart: '2024-01-16T10:00:00Z',
      IsDonation: true,
      Price: null,
      Quantity: '5 servings',
      DietaryInfo: 'Vegan',
      PickupLocation: 'Test Location'
    });
  });

  describe('createFoodListingWithImage', () => {
    const mockListingInput: FoodListingInput = {
      Title: 'Fresh Vegetables',
      Description: 'Organic vegetables from local farm',
      FoodType: 'Vegetables',
      CookedDate: '2024-01-15',
      PickupWindowStart: '2024-01-16T10:00:00Z',
      PickupWindowEnd: '2024-01-16T14:00:00Z',
      PickupLocation: 'Downtown Market',
      IsDonation: true,
      Quantity: '5 kg',
      DietaryInfo: 'Vegan, Organic'
    };

    it('should create food listing successfully for donor/seller', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        UserID: 1,
        Username: 'donoruser',
        Email: 'donor@test.com',
        Role: UserRole.DONOR_SELLER,
        donorSeller: {
          ProfileID: 1,
          BusinessName: 'Green Farm'
        }
      } as Partial<User>;

      const mockSavedListing = {
        ListingID: 1,
        Title: 'Fresh Vegetables',
        Description: 'Organic vegetables from local farm',
        FoodType: 'Vegetables',
        IsDonation: true,
        ListingStatus: ListingStatus.ACTIVE,
        donor: mockUser
      } as Partial<FoodListing>;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFoodListingRepository.save.mockResolvedValue(mockSavedListing);

      // Act
      const result = await createFoodListingWithImage(userId, mockListingInput);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
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
      expect(mockValidateFoodListingData).toHaveBeenCalledWith(mockListingInput);
      expect(mockFoodListingRepository.save).toHaveBeenCalled();
      expect(result.listing).toEqual(mockSavedListing);
      expect(result.donorSeller.BusinessName).toBe('Green Farm');
    });

    it('should create food listing with image upload', async () => {
      // Arrange
      const userId = 1;
      const mockImageFile = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test')
      } as Express.Multer.File;

      const mockUser = {
        UserID: 1,
        Role: UserRole.DONOR_SELLER,
        donorSeller: { ProfileID: 1, BusinessName: 'Test Farm' }
      } as Partial<User>;

      const mockUploadResult = {
        url: 'https://cloudinary.com/test-image.jpg',
        publicId: 'test-public-id'
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUploadImageToCloudinary.mockResolvedValue(mockUploadResult);
      mockFoodListingRepository.save.mockResolvedValue({ ListingID: 1 });

      // Act
      const result = await createFoodListingWithImage(userId, mockListingInput, mockImageFile);

      // Assert
      expect(mockUploadImageToCloudinary).toHaveBeenCalledWith(mockImageFile, 'food-listings');
      expect(mockFoodListingRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ImagePath: mockUploadResult.url,
          ImagePublicId: mockUploadResult.publicId
        })
      );
    });

    it('should throw UserDoesNotExistError when user not found', async () => {
      // Arrange
      const userId = 999;
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(createFoodListingWithImage(userId, mockListingInput))
        .rejects.toThrow(UserDoesNotExistError);
    });

    it('should throw UnauthorizedActionError when user is not donor/seller', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        UserID: 1,
        Role: UserRole.BUYER,
        donorSeller: undefined
      } as Partial<User>;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(createFoodListingWithImage(userId, mockListingInput))
        .rejects.toThrow(UnauthorizedActionError);
    });

    it('should throw ProfileNotFoundError when donor profile missing', async () => {
      // Arrange
      const userId = 1;
      const mockUser = {
        UserID: 1,
        Role: UserRole.DONOR_SELLER,
        donorSeller: undefined
      } as Partial<User>;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(createFoodListingWithImage(userId, mockListingInput))
        .rejects.toThrow(ProfileNotFoundError);
    });

    it('should handle image upload failure', async () => {
      // Arrange
      const userId = 1;
      const mockImageFile = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test')
      } as Express.Multer.File;

      const mockUser = {
        UserID: 1,
        Role: UserRole.DONOR_SELLER,
        donorSeller: { ProfileID: 1, BusinessName: 'Test Farm' }
      } as Partial<User>;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUploadImageToCloudinary.mockRejectedValue(new Error('Upload failed'));

      // Act & Assert
      await expect(createFoodListingWithImage(userId, mockListingInput, mockImageFile))
        .rejects.toThrow(ValidationError);
    });
  });



  describe('deleteFoodListing', () => {
    it('should delete food listing successfully', async () => {
      // Arrange
      const userId = 1;
      const listingId = 1;

      const mockListing = {
        ListingID: 1,
        ImagePublicId: 'test-public-id',
        donor: { UserID: 1 }
      } as Partial<FoodListing>;

      mockFoodListingRepository.findOne.mockResolvedValue(mockListing);
      mockDeleteImageFromCloudinary.mockResolvedValue(undefined);

      // Act
      await deleteFoodListing(userId, listingId);

      // Assert
      expect(mockFoodListingRepository.findOne).toHaveBeenCalledWith({
        where: { ListingID: listingId },
        relations: ['donor'],
        select: {
          ListingID: true,
          ImagePublicId: true,
          donor: { UserID: true }
        }
      });
      expect(mockDeleteImageFromCloudinary).toHaveBeenCalledWith('test-public-id');
      expect(mockFoodListingRepository.remove).toHaveBeenCalledWith(mockListing);
    });

    it('should throw FoodListingNotFoundError when listing not found', async () => {
      // Arrange
      const userId = 1;
      const listingId = 999;

      mockFoodListingRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteFoodListing(userId, listingId))
        .rejects.toThrow(FoodListingNotFoundError);
    });
  });
});
