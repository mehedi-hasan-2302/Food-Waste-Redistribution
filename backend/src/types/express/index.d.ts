import { User } from "../../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        donorSellerId?: number;
        charityOrganizationId?: number;
        buyerId?: number;
        independentDeliveryId?: number;
        organizationVolunteerId?: number;
      };
    }
  }
}

export {};