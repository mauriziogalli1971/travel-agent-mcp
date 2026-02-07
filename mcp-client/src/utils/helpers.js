export function isDev(url) {
	return url.hostname === 'localhost' || url.hostname.includes('127.0.0.1');
}
