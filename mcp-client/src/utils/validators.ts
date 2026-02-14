export function isValidCoords(lat: number, lon: number): boolean {
	if (lat == null || lon == null) return false;
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
	if (lat < -90 || lat > 90) return false;
	return !(lon < -180 || lon > 180);
}

export function isValidTravellers(travellers: number): boolean {
	return Number.isFinite(travellers) && travellers > 0;
}

export function isValidLocation(location: string): boolean {
	// Location cannot contain special characters or digits
	if (/[^a-zA-Z ]/g.test(location)) return false;
	return location.length > 0;
}

export function isValidDateRange(start: string, end: string): boolean {
	if (!start || !end) return false;
	if (!isValidDate(start) || !isValidDate(end)) return false;
	// Range dates are valid if they are both valid dates and start is before end
	return Date.parse(start) < Date.parse(end);
}

export function isValidDate(date: string): boolean {
	return !isNaN(Date.parse(date)) && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidBudget(budget: number): boolean {
	return Number.isFinite(budget) && budget > 0;
}
