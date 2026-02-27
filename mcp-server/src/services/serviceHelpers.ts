import { TimeoutError } from "@travel-agent/shared";

export async function withRetries(
	fn: () => Promise<any>,
	{ retries = 2, baseDelayMs = 200, maxElapsedMs = 30_000 } = {},
) {
	let attempt = 0;
	const start = Date.now();
	// simple backoff: 200 ms, 400 ms
	while (attempt <= retries) {
		try {
			return await fn();
		} catch (e: any) {
			const elapsed = Date.now() - start;
			if (attempt >= retries || elapsed >= maxElapsedMs || !isRetryable(e)) {
				throw e;
			}
			await delay(baseDelayMs * 2 ** attempt);
			attempt += 1;
		}
	}
	// Should never reach here, but keep a final safeguard
	throw new TimeoutError(
		`${fn.name} failed after ${retries} attempts within ${maxElapsedMs} ms.`,
	);
}

function isRetryable(e: any | Error): boolean {
	// network issues (no status) or 429/5xx
	return (
		!("status" in e) || e.status === 429 || (e.status >= 500 && e.status <= 599)
	);
}

function delay(milliseconds: number = 0): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
