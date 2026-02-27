import { ValidationError } from "./errors";
import {
	isValidBudget,
	isValidDate,
	isValidDateRange,
	isValidLocation,
	isValidTravellers,
} from "../utils/validators";

export type TripResponse = {
	from: string;
	to: string;
	travellers: number;
	start: string;
	end: string;
	budget: number;
};

export class TripData {
	from: string;
	to: string;
	travellers: number;
	start: string;
	end: string;
	budget: number;

	constructor(response: TripResponse) {
		this.from = response.from;
		this.to = response.to;
		this.travellers = response.travellers;
		this.start = response.start;
		this.end = response.end;
		this.budget = response.budget;
	}

	static create(response: TripResponse): TripData {
		const errors: string[] = [];

		const from = String(response.from || "").trim();
		const to = String(response.to || "").trim();
		const travellers = Number(response.travellers || 1);
		const start = String(response.start || "").trim();
		const end = String(response.end || "").trim();
		const budget = Number(response.budget || 0);

		if (!isValidLocation(from)) errors.push("Invalid from location: " + from);
		if (!isValidLocation(to)) errors.push("Invalid to location: " + to);
		if (!isValidTravellers(travellers))
			errors.push("Invalid travellers: " + travellers);
		if (!isValidDate(start)) errors.push("Invalid start date: " + start);
		if (!isValidDate(end)) errors.push("Invalid end date: " + end);
		if (!isValidDateRange(start, end))
			errors.push('Invalid dates: "start" "date must be before "end" date');
		if (!isValidBudget(budget))
			errors.push("Budget must be a number greater than 0.");

		if (errors.length) {
			throw new ValidationError("Invalid TripRequest", { fields: errors });
		}

		return new TripData({ from, to, travellers, start, end, budget });
	}
}
