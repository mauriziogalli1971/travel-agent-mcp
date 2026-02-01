/**
 * Parse SSE (Server-Sent Events) response and extract JSON-RPC result
 * SSE format: "event: message\ndata: {json}\n\n"
 */
export function parseSSEResponse(sseText) {
	const lines = sseText.split('\n');
	let jsonData = null;

	for (const line of lines) {
		if (line.startsWith('data: ')) {
			const dataContent = line.slice(6); // Remove "data: " prefix
			try {
				const parsed = JSON.parse(dataContent);
				if (parsed.result && parsed.result.tools) {
					return parsed.result.tools;
				}
				jsonData = parsed;
			} catch (e) {
				// Continue if this line isn't valid JSON
			}
		}
	}

	// Return whatever we found, or empty array
	return jsonData?.result?.tools || [];
}

export function isDev(url) {
	return url.hostname === 'localhost' || url.hostname.includes('127.0.0.1');
}
