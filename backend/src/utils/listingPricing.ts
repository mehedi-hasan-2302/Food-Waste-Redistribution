export interface ListingPriceInput {
  Price?: number | string | null;
  IsDonation: boolean;
  CookedDate?: Date | string | null;
  PickupWindowEnd?: Date | string | null;
}

export interface ListingPriceResult {
  originalPrice: number;
  currentPrice: number;
  discountApplied: number;
  isExpired: boolean;
}

const DISCOUNT_PER_HOUR = 5;
const MAX_DISCOUNT_RATE = 0.5;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const toTimestamp = (value?: Date | string | null) => {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

export function calculateDynamicListingPrice(
  listing: ListingPriceInput,
  now: Date = new Date()
): ListingPriceResult {
  const originalPrice = Number(listing.Price ?? 0);
  const safeOriginalPrice = Number.isFinite(originalPrice) ? originalPrice : 0;
  const currentTimestamp = now.getTime();
  const pickupEndTimestamp = toTimestamp(listing.PickupWindowEnd);
  const cookedTimestamp = toTimestamp(listing.CookedDate);
  const isExpired =
    pickupEndTimestamp !== null && pickupEndTimestamp <= currentTimestamp;

  if (
    listing.IsDonation ||
    safeOriginalPrice <= 0 ||
    isExpired ||
    cookedTimestamp === null
  ) {
    return {
      originalPrice: roundMoney(safeOriginalPrice),
      currentPrice: roundMoney(safeOriginalPrice),
      discountApplied: 0,
      isExpired,
    };
  }

  const hoursFromCooking = Math.max(
    0,
    (currentTimestamp - cookedTimestamp) / (1000 * 60 * 60)
  );
  const maxDiscount = safeOriginalPrice * MAX_DISCOUNT_RATE;
  const discountAmount = Math.min(hoursFromCooking * DISCOUNT_PER_HOUR, maxDiscount);
  const currentPrice = roundMoney(safeOriginalPrice - discountAmount);
  const discountApplied = Math.round(
    ((safeOriginalPrice - currentPrice) / safeOriginalPrice) * 100
  );

  return {
    originalPrice: roundMoney(safeOriginalPrice),
    currentPrice,
    discountApplied: Math.max(0, discountApplied),
    isExpired,
  };
}
