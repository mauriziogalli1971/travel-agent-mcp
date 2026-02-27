import { withRetries } from "./serviceHelpers";
import { FetchClient } from "../infra/http/fetchClient";
import {
  Logger,
  NotFoundError,
  RemoteApiError,
  ValidationError,
} from "@travel-agent/shared";

interface FlightsServiceOptions {
  hl?: string;
  currency?: string;
  api_key?: string;
  timeoutMs?: number;
}

interface FlightsServiceRequest {
  fromIata: string[];
  toIata: string[];
  start: string;
  end: string;
}

export class FlightsService {
  private readonly hl: string;
  private readonly currency: string;
  private readonly api_key: string;
  private readonly apiUrl: string;
  private readonly engine: string;
  private readonly timeoutMs: number;

  constructor({
    hl,
    currency,
    api_key,
    timeoutMs,
  }: FlightsServiceOptions = {}) {
    if (!api_key) throw new ValidationError("api_key is required");
    this.hl = hl || "en";
    this.currency = currency || "EUR";
    this.api_key = api_key || "";
    this.apiUrl = "https://serpapi.com/search.json";
    this.engine = "google_flights";
    this.timeoutMs = timeoutMs || 20000;
  }

  async get(
    {
      fromIata,
      toIata,
      start,
      end,
    }: FlightsServiceRequest = {} as FlightsServiceRequest,
  ) {
    const step = "FlightsService.get";

    if (!(fromIata && toIata && start && end))
      throw new ValidationError("Invalid parameters");

    const url = new URL(this.apiUrl);
    url.searchParams.set("engine", this.engine);
    url.searchParams.set("api_key", this.api_key);
    url.searchParams.set("hl", this.hl);
    url.searchParams.set("currency", this.currency);
    url.searchParams.set("deep_search", "true");
    url.searchParams.set("departure_id", fromIata.join(","));
    url.searchParams.set("arrival_id", toIata.join(","));
    url.searchParams.set("outbound_date", start);
    url.searchParams.set("return_date", end);

    const headers = { accept: "application/json" };

    try {
      const flightsData = await withRetries(async () => {
        const reqHandler = new FetchClient({
          headers,
          apiUrl: url.toString(),
        });
        const json = await reqHandler.handle(this.timeoutMs);

        if (!json) {
          throw new RemoteApiError("Fetching flights data failed");
        }

        return json;
      });

      const { best_flights, other_flights, airports } = flightsData;
      if (
        !(
          Array.isArray(best_flights) &&
          best_flights.length > 0 &&
          Array.isArray(other_flights) &&
          other_flights.length > 0 &&
          Array.isArray(airports) &&
          airports.length > 0
        )
      ) {
        throw new NotFoundError("No flights data found");
      }

      return flightsData;
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
