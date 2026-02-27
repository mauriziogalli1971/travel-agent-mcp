import { withRetries } from "./serviceHelpers";
import { FetchClient } from "../infra/http/fetchClient";
import { Logger, NotFoundError, RemoteApiError } from "@travel-agent/shared";

interface WeatherServiceOptions {
  api_key?: string;
  timeoutMs?: number;
}

export class WeatherService {
  private readonly baseUrl: string;
  private readonly api_key: string;
  private readonly timeoutMs: number;

  constructor(
    { api_key, timeoutMs }: WeatherServiceOptions = {} as WeatherServiceOptions,
  ) {
    this.baseUrl = "https://api.openweathermap.org/data/3.0/onecall";
    this.api_key = api_key || "";
    this.timeoutMs = timeoutMs || 20000;
  }

  async get(
    { lat, lon }: { lat: number; lon: number } = {} as {
      lat: number;
      lon: number;
    },
  ) {
    const step = "WeatherService.get";

    if (!(lat && lon)) throw new Error("Invalid parameters");

    const url = new URL(this.baseUrl);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("appid", this.api_key);

    const headers = { accept: "application/json" };

    try {
      const weatherData = await withRetries(async () => {
        const reqHandler = new FetchClient({ headers, apiUrl: url.toString() });
        const json = await reqHandler.handle(this.timeoutMs);

        if (!json) {
          throw new RemoteApiError("Fetching weather data failed");
        }

        return json;
      });

      const { daily } = weatherData;
      if (!(Array.isArray(daily) && daily.length > 0)) {
        throw new NotFoundError("No weather data found");
      }

      return weatherData;
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
