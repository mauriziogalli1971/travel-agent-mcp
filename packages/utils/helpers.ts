export function isLocalDev(url: URL): boolean {
	return url.hostname === "localhost" || url.hostname.includes("127.0.0.1");
}
