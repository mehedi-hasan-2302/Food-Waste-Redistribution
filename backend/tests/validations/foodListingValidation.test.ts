import { validateFoodListingData } from '../../src/validations/foodListingValidation';

const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const validListing = (overrides: Record<string, unknown> = {}) => ({
  Title: 'Fresh cooked meals',
  Description: 'Packed meals ready for pickup today.',
  FoodType: 'Cooked meal',
  CookedDate: hoursFromNow(-1),
  PickupWindowStart: hoursFromNow(0.25),
  PickupWindowEnd: hoursFromNow(4.25),
  PickupLocation: 'Main kitchen',
  IsDonation: false,
  Price: 120,
  Quantity: '12 servings',
  DietaryInfo: 'Contains rice',
  ...overrides,
});

describe('foodListingValidation', () => {
  it('accepts pickup windows up to 6 hours long', async () => {
    await expect(validateFoodListingData(validListing())).resolves.toEqual(
      expect.objectContaining({
        Title: 'Fresh cooked meals',
        Price: 120,
      })
    );
  });

  it('rejects pickup windows shorter than 1 hour', async () => {
    await expect(
      validateFoodListingData(
        validListing({
          PickupWindowStart: hoursFromNow(0.25),
          PickupWindowEnd: hoursFromNow(0.75),
        })
      )
    ).rejects.toThrow('Pickup window must be at least 1 hour long');
  });

  it('rejects pickup windows longer than 6 hours', async () => {
    await expect(
      validateFoodListingData(
        validListing({
          PickupWindowStart: hoursFromNow(0.25),
          PickupWindowEnd: hoursFromNow(7),
        })
      )
    ).rejects.toThrow('Pickup window cannot be longer than 6 hours');
  });
});
