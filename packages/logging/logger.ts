type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
	level: LogLevel;
	step: string;
	msg: string;
	meta?: Record<string, unknown>;
};

export class Logger {
	constructor() {}

	// Private field: core log function
	#log(entry: LogEntry): void {
		console.log(JSON.stringify({ ...entry, ts: new Date().toISOString() }));
	}

	logInfo(
		step: string,
		msg: string,
		meta: Record<string, unknown> | undefined = undefined,
	): void {
		this.#log({ level: "info", step, msg, meta });
	}

	logDebug(step: string, msg: string, meta: Record<string, unknown>): void {
		this.#log({ level: "debug", step, msg, meta });
	}

	logWarn(step: string, msg: string, meta: Record<string, unknown>): void {
		this.#log({ level: "warn", step, msg, meta });
	}

	logError(step: string, msg: string, meta: Record<string, unknown>): void {
		this.#log({ level: "error", step, msg, meta });
	}
}
