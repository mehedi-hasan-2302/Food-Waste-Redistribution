import Joi from 'joi'
import { ValidationError } from '../utils/errors'

// Complete Profile Validation - for initial profile completion
interface DonorSellerProfileComplete {
    BusinessName: string;
}

interface CharityOrgProfileComplete {
    OrganizationName: string;
    GovRegistrationDocPath: string;
    AddressLine1: string;
}

interface BuyerProfileComplete {
    DefaultDeliveryAddress: string;
}

interface IndepDeliveryProfileComplete {
    FullName: string;
    SelfiePath: string;
    NIDPath: string;
    OperatingAreas: object;
}

interface OrgVolunteerProfileComplete {
    CharityOrgID: number;
    VolunteerName: string;
    VolunteerContactPhone: string;
}
type UserRole = any;  

type ProfileCompleteData =
    | DonorSellerProfileComplete
    | CharityOrgProfileComplete
    | BuyerProfileComplete
    | IndepDeliveryProfileComplete
    | OrgVolunteerProfileComplete;

export const validateCompleteProfileData = async (
    profileData: ProfileCompleteData,
    role: UserRole
): Promise<void> => {
    let schema;
    
    if (role === 'DONOR_SELLER') {
        schema = Joi.object({
            BusinessName: Joi.string()
                .min(2)
                .max(150)
                .required()
                .messages({
                    'string.empty': 'Business name is required',
                    'string.min': 'Business name must be at least 2 characters',
                    'string.max': 'Business name must be at most 150 characters',
                }),
        });
    } else if (role === 'CHARITY_ORG') {
        schema = Joi.object({
            OrganizationName: Joi.string()
                .min(2)
                .max(150)
                .required()
                .messages({
                    'string.empty': 'Organization name is required',
                    'string.min': 'Organization name must be at least 2 characters',
                    'string.max': 'Organization name must be at most 150 characters',
                }),
            GovRegistrationDocPath: Joi.string()
                .required()
                .messages({
                    'string.empty': 'Government registration document path is required',
                }),
            AddressLine1: Joi.string()
                .min(5)
                .max(200)
                .required()
                .messages({
                    'string.empty': 'Address is required',
                    'string.min': 'Address must be at least 5 characters',
                    'string.max': 'Address must be at most 200 characters',
                })
        });
    } else if (role === 'BUYER') {
        schema = Joi.object({
            DefaultDeliveryAddress: Joi.string()
                .min(5)
                .max(500)
                .required()
                .messages({
                    'string.empty': 'Default delivery address is required',
                    'string.min': 'Delivery address must be at least 5 characters',
                    'string.max': 'Delivery address must be at most 500 characters',
                }),
        });
    } else if (role === 'INDEP_DELIVERY') {
        schema = Joi.object({
            FullName: Joi.string()
                .min(2)
                .max(100)
                .required()
                .messages({
                    'string.empty': 'Full name is required',
                    'string.min': 'Full name must be at least 2 characters',
                    'string.max': 'Full name must be at most 100 characters',
                }),
            SelfiePath: Joi.string()
                .required()
                .messages({
                    'string.empty': 'Selfie image path is required',
                }),
            NIDPath: Joi.string()
                .required()
                .messages({
                    'string.empty': 'National ID document path is required',
                }),
            OperatingAreas: Joi.object()
                .required()
                .messages({
                    'object.base': 'Operating areas must be a valid object',
                    'any.required': 'Operating areas are required',
                })
        });
    } else if (role === 'ORG_VOLUNTEER') {
        schema = Joi.object({
            CharityOrgID: Joi.number()
                .integer()
                .positive()
                .required()
                .messages({
                    'number.base': 'Charity organization ID must be a number',
                    'number.integer': 'Charity organization ID must be an integer',
                    'number.positive': 'Charity organization ID must be positive',
                    'any.required': 'Charity organization ID is required',
                }),
            VolunteerName: Joi.string()
                .min(2)
                .max(100)
                .required()
                .messages({
                    'string.empty': 'Volunteer name is required',
                    'string.min': 'Volunteer name must be at least 2 characters',
                    'string.max': 'Volunteer name must be at most 100 characters',
                }),
            VolunteerContactPhone: Joi.string()
                .pattern(/^[0-9]{11}$/)
                .required()
                .messages({
                    'string.empty': 'Volunteer contact phone is required',
                    'string.pattern.base': 'Volunteer contact phone must be a valid 11-digit number',
                })
        });
    } else {
        throw new ValidationError('Invalid role');
    }

    const { error } = schema.validate(profileData);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }
};

// Update Profile Validation - for profile updates (all fields optional)
interface DonorSellerProfileUpdate {
    BusinessName?: string;
}

interface CharityOrgProfileUpdate {
    OrganizationName?: string;
    AddressLine1?: string;
}

interface BuyerProfileUpdate {
    DefaultDeliveryAddress?: string;
}

interface IndepDeliveryProfileUpdate {
    FullName?: string;
    OperatingAreas?: object;
}

interface OrgVolunteerProfileUpdate {
    VolunteerName?: string;
    VolunteerContactPhone?: string;
}

type Role =
    | 'DONOR_SELLER'
    | 'CHARITY_ORG'
    | 'BUYER'
    | 'INDEP_DELIVERY'
    | 'ORG_VOLUNTEER';

type ProfileUpdateData =
    | DonorSellerProfileUpdate
    | CharityOrgProfileUpdate
    | BuyerProfileUpdate
    | IndepDeliveryProfileUpdate
    | OrgVolunteerProfileUpdate;

export const validateUpdateProfileData = async (
    profileData: ProfileUpdateData,
    role: Role
): Promise<void> => {
    let schema;
    
    if (role === 'DONOR_SELLER') {
        schema = Joi.object({
            BusinessName: Joi.string()
                .min(2)
                .max(150)
                .optional()
                .messages({
                    'string.min': 'Business name must be at least 2 characters',
                    'string.max': 'Business name must be at most 150 characters',
                }),
        });
    } else if (role === 'CHARITY_ORG') {
        schema = Joi.object({
            OrganizationName: Joi.string()
                .min(2)
                .max(150)
                .optional()
                .messages({
                    'string.min': 'Organization name must be at least 2 characters',
                    'string.max': 'Organization name must be at most 150 characters',
                }),
            AddressLine1: Joi.string()
                .min(5)
                .max(200)
                .optional()
                .messages({
                    'string.min': 'Address must be at least 5 characters',
                    'string.max': 'Address must be at most 200 characters',
                })
        });
    } else if (role === 'BUYER') {
        schema = Joi.object({
            DefaultDeliveryAddress: Joi.string()
                .min(5)
                .max(500)
                .optional()
                .messages({
                    'string.min': 'Delivery address must be at least 5 characters',
                    'string.max': 'Delivery address must be at most 500 characters',
                })
        });
    } else if (role === 'INDEP_DELIVERY') {
        schema = Joi.object({
            FullName: Joi.string()
                .min(2)
                .max(100)
                .optional()
                .messages({
                    'string.min': 'Full name must be at least 2 characters',
                    'string.max': 'Full name must be at most 100 characters',
                }),
            OperatingAreas: Joi.object()
                .optional()
                .messages({
                    'object.base': 'Operating areas must be a valid object',
                })
        });
    } else if (role === 'ORG_VOLUNTEER') {
        schema = Joi.object({
            VolunteerName: Joi.string()
                .min(2)
                .max(100)
                .optional()
                .messages({
                    'string.min': 'Volunteer name must be at least 2 characters',
                    'string.max': 'Volunteer name must be at most 100 characters',
                }),
            VolunteerContactPhone: Joi.string()
                .pattern(/^[0-9]{11}$/)
                .optional()
                .messages({
                    'string.pattern.base': 'Volunteer contact phone must be a valid 11-digit number',
                })
        });
    } else {
        throw new ValidationError('Invalid role');
    }

    const { error } = schema.validate(profileData);
    if (error) {
        throw new ValidationError(error.details[0].message);
    }
};
