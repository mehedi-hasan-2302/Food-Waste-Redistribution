export class BaseError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

// Auth/User Errors
export class UserAlreadyExistsError extends BaseError {
  constructor(message = 'User with this email already exists.') {
    super(message, 400)
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(message = 'Invalid username or password.') {
    super(message, 401)
  }
}

export class UserDoesNotExistError extends BaseError {
  constructor(message = 'User does not exist.') {
    super(message, 404)
  }
}

export class PasswordResetExpiredError extends BaseError {
  constructor(message = 'Password reset token has expired.') {
    super(message, 400)
  }
}

export class InvalidRoleError extends BaseError {
  constructor(message = 'Invalid role specified.') {
    super(message, 400)
  }
}

export class AccountNotActiveError extends BaseError {
  constructor(message = 'Account is not active. Please verify your email first.') {
    super(message, 403)
  }
}

export class EmailNotVerifiedError extends BaseError {
  constructor(message = 'Please verify your email before logging in.') {
    super(message, 403)
  }
}

export class EmailAlreadyVerifiedError extends BaseError {
  constructor(message = 'Email already verified.') {
    super(message, 400)
  }
}

export class VerificationCodeNotFoundError extends BaseError {
  constructor(message = 'No verification code found.') {
    super(message, 400)
  }
}

export class InvalidVerificationCodeError extends BaseError {
  constructor(message = 'Invalid or expired verification code.') {
    super(message, 400)
  }
}

export class PasswordResetTokenNotFoundError extends BaseError {
  constructor(message = 'No password reset code found.') {
    super(message, 400)
  }
}

export class InvalidPasswordResetTokenError extends BaseError {
  constructor(message = 'Invalid or expired password reset code.') {
    super(message, 400)
  }
}

export class PasswordMismatchError extends BaseError {
  constructor(message = 'Passwords do not match.') {
    super(message, 400)
  }
}

// Profile Errors
export class ProfileAlreadyCompletedError extends BaseError {
  constructor(message = 'Profile already completed.') {
    super(message, 400)
  }
}

export class ProfileNotFoundError extends BaseError {
  constructor(message = 'Profile not found.') {
    super(message, 404)
  }
}

export class ProfileNotCompletedError extends BaseError {
  constructor(message = 'Profile must be completed first.') {
    super(message, 400)
  }
}

export class CharityOrganizationNotFoundError extends BaseError {
  constructor(message = 'Charity organization not found.') {
    super(message, 404)
  }
}

// Validation
export class ValidationError extends BaseError {
  constructor(message = 'Validation failed.') {
    super(message, 422)
  }
}

// Admin
export class CoordinatorNotFoundError extends BaseError {
  constructor(message = 'Coordinator profile not found.') {
    super(message, 404)
  }
}

export class InvalidCoordinatorActionError extends BaseError {
  constructor(message = 'Invalid action performed by the coordinator.') {
    super(message, 400)
  }
}

// Organization
export class OrganizationNotFoundError extends BaseError {
  constructor(message = 'Organization not found.') {
    super(message, 404)
  }
}

export class OrganizationAlreadyApprovedError extends BaseError {
  constructor(message = 'Organization is already approved.') {
    super(message, 400)
  }
}

// Volunteer
export class VolunteerAlreadyInTeamError extends BaseError {
  constructor(message = 'The volunteer is already assigned to a team.') {
    super(message, 400)
  }
}

export class MissingUserError extends BaseError {
  constructor(message = 'Volunteer is missing user data.') {
    super(message, 404)
  }
}


export class FoodListingNotFoundError extends Error {
  statusCode: number
  
  constructor(message: string = 'Food listing not found') {
    super(message)
    this.name = 'FoodListingNotFoundError'
    this.statusCode = 404
  }
}

export class UnauthorizedActionError extends Error {
  statusCode: number
  
  constructor(message: string = 'Unauthorized action') {
    super(message)
    this.name = 'UnauthorizedActionError'
    this.statusCode = 403
  }
}