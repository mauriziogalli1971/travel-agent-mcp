export class DomainError extends Error {
	code: string;
	details: { fields: string[] } | undefined;

	constructor(
		message: string,
		code = "DOMAIN_ERROR",
		details: { fields: string[] } | undefined = undefined,
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.details = details;
	}
}

export class ValidationError extends DomainError {
	constructor(
		message = "Validation failed",
		details: { fields: string[] } | undefined = undefined,
	) {
		super(message, "VALIDATION_ERROR", details);
	}
}

export class NotFoundError extends DomainError {
	constructor(
		message = "Not found",
		details: { fields: string[] } | undefined = undefined,
	) {
		super(message, "NOT_FOUND", details);
	}
}

export class RemoteApiError extends DomainError {
	constructor(
		message = "Remote API error",
		details: { fields: string[] } | undefined = undefined,
	) {
		super(message, "REMOTE_API_ERROR", details);
	}
}

export class TimeoutError extends DomainError {
	constructor(
		message = "Timeout expired",
		details: { fields: string[] } | undefined = undefined,
	) {
		super(message, "TIMEOUT_ERROR", details);
	}
}
