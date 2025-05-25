// Base Error Class
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
