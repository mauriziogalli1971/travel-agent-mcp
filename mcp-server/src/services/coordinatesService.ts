import { FetchClient } from "../infra/http/fetchClient";
import { withRetries } from "./serviceHelpers";
import { isValidCoords, Logger } from "@travel-agent/shared";
import {
  NotFoundError,
  RemoteApiError,
  ValidationError,
} from "@travel-agent/shared";

export class CoordinatesService {
  constructor() {}

  async get(place: string): Promise<{ lat: number; lon: number }> {
    const step = "CoordinatesService.get";
    const paramPlace = String(place ?? "").trim();
    const baseUrl = "https://nominatim.openstreetmap.org/search";

    // Basic validation
    if (!paramPlace) {
      throw new ValidationError("Place is required");
    }

    const url = new URL(baseUrl);
    url.searchParams.set("q", paramPlace);
    url.searchParams.set("limit", "1");
    url.searchParams.set("format", "json");

    const timeoutMs = 8000;
    const headers = {
      "User-Agent": "Travel Agent/1.0 (https://travel-agent.pages.dev/)",
      "Accept-Language": "en",
      accept: "application/json",
    };

    try {
      const data = await withRetries(async () => {
        const reqHandler = new FetchClient({ headers, apiUrl: url.toString() });
        const json = await reqHandler.handle(timeoutMs);

        if (!json) {
          throw new RemoteApiError(
            "CoordinatesService - fetching coordinates failed.",
            { fields: [`No data returned for place: ${paramPlace}`] },
          );
        }

        return json;
      });

      const [first] = Array.isArray(data) ? data : [];
      const coordinates = {
        lat: parseFloat(first.lat),
        lon: parseFloat(first.lon),
      };
      if (!isValidCoords(coordinates.lat, coordinates.lon)) {
        throw new NotFoundError("No coordinates found", { fields: [place] });
      }

      return coordinates;
    } catch (e: Error | any) {
      const logger = new Logger();
      logger.logError(step, e.message, {
        code: e.code,
        status: e.status,
      });
      throw e;
    }
  }
}
