import { calculateDynamicListingPrice } from '../../src/utils/listingPricing';

describe('listingPricing', () => {
  const now = new Date('2026-06-13T12:00:00.000Z');

  it('discounts sale listings by 5 Tk per hour from cooking time', () => {
    const result = calculateDynamicListingPrice(
      {
        IsDonation: false,
        Price: 120,
        CookedDate: '2026-06-13T08:00:00.000Z',
        PickupWindowEnd: '2026-06-13T18:00:00.000Z',
      },
      now
    );

    expect(result).toEqual({
      originalPrice: 120,
      currentPrice: 100,
      discountApplied: 17,
      isExpired: false,
    });
  });

  it('caps sale discounts at 50 percent', () => {
    const result = calculateDynamicListingPrice(
      {
        IsDonation: false,
        Price: 100,
        CookedDate: '2026-06-12T20:00:00.000Z',
        PickupWindowEnd: '2026-06-13T18:00:00.000Z',
      },
      now
    );

    expect(result.currentPrice).toBe(50);
    expect(result.discountApplied).toBe(50);
  });

  it('does not discount donation listings', () => {
    const result = calculateDynamicListingPrice(
      {
        IsDonation: true,
        Price: 0,
        CookedDate: '2026-06-13T08:00:00.000Z',
        PickupWindowEnd: '2026-06-13T18:00:00.000Z',
      },
      now
    );

    expect(result.currentPrice).toBe(0);
    expect(result.discountApplied).toBe(0);
  });

  it('marks listings expired when the pickup window has ended', () => {
    const result = calculateDynamicListingPrice(
      {
        IsDonation: false,
        Price: 100,
        CookedDate: '2026-06-13T08:00:00.000Z',
        PickupWindowEnd: '2026-06-13T11:59:59.000Z',
      },
      now
    );

    expect(result.isExpired).toBe(true);
    expect(result.currentPrice).toBe(100);
  });
});
