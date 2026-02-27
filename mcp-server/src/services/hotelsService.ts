import { withRetries } from "./serviceHelpers";
import { FetchClient } from "../infra/http/fetchClient";
import {
  Logger,
  NotFoundError,
  RemoteApiError,
  TripData,
  ValidationError,
} from "@travel-agent/shared";

interface HotelsServiceOptions {
  hl?: string;
  currency?: string;
  api_key?: string;
  timeoutMs?: number;
}

interface HotelsServiceRequest {
  to: string;
  travellers: number;
  start: string;
  end: string;
}

export class HotelsService {
  private readonly hl: string;
  private readonly currency: string;
  private readonly api_key: string;
  private readonly apiUrl: string;
  private readonly engine: string;
  private readonly timeoutMs: number;

  constructor(
    {
      hl,
      currency,
      api_key,
      timeoutMs,
    }: HotelsServiceOptions = {} as HotelsServiceOptions,
  ) {
    if (!api_key) throw new Error("api_key is required");
    this.hl = hl || "en";
    this.currency = currency || "EUR";
    this.api_key = api_key || "";
    this.apiUrl = "https://serpapi.com/search.json";
    this.engine = "google_hotels";
    this.timeoutMs = timeoutMs || 20000;
  }

  async get({ to, travellers, start, end }: HotelsServiceRequest) {
    const step = "HotelsService.get";

    if (!(to && travellers && start && end))
      throw new ValidationError("Invalid parameters");

    const url = new URL(this.apiUrl);
    url.searchParams.set("engine", this.engine);
    url.searchParams.set("api_key", this.api_key);
    url.searchParams.set("hl", this.hl);
    url.searchParams.set("currency", this.currency);
    url.searchParams.set("q", to);
    url.searchParams.set("check_in_date", start);
    url.searchParams.set("check_out_date", end);
    url.searchParams.set("adults", travellers.toString());
    url.searchParams.set("children", "0");

    const headers = { accept: "application/json" };

    try {
      const hotelsData = await withRetries(async () => {
        const reqHandler = new FetchClient({
          headers,
          apiUrl: url.toString(),
        });
        const json = await reqHandler.handle(this.timeoutMs);

        if (!json) {
          throw new RemoteApiError("Fetching hotels data failed");
        }

        return json;
      });

      const { ads } = hotelsData;
      if (!Array.isArray(ads) || ads.length === 0) {
        throw new NotFoundError("No hotels data found");
      }

      return hotelsData;
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
