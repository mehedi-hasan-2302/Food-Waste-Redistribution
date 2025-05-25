import { User } from '../models/User';

declare global {
  namespace Express {
    export interface Request {
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