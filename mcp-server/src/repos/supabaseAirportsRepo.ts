import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "@travel-agent/shared";

interface SupabaseAirportsRepoOptions {
  url: string;
  apiKey: string;
}

interface Airport {
  id: number;
  iata: string;
  type: string;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  distance_m: number;
}

export class SupabaseAirportsRepo {
  supabase: SupabaseClient;

  constructor({ url, apiKey }: SupabaseAirportsRepoOptions) {
    this.supabase = createClient(url, apiKey);
  }

  async getNearbyAirports({ lat, lon }: { lat: number; lon: number }) {
    if (lat == null || lon == null) throw new Error("lat/lon required");

    const logger = new Logger();
    const { data, error } = await this.supabase.rpc("get_nearby_airports", {
      lat,
      lon,
    });

    if (error) {
      logger.logInfo(
        "SupabaseAirportsRepo.getNearbyAirports",
        `Failed to retrieve airports near to lat: ${lat}, lon: ${lon}`,
        { ...error },
      );
      return [];
    }

    console.log(data);

    const iataCodes: string[] = data.map((item: Airport): string => item.iata);
    logger.logInfo(
      "SupabaseAirportsRepo.getNearbyAirports",
      `Retrieved ${iataCodes.length} airports near to lat: ${lat}, lon: ${lon}`,
      { iataCodes_len: iataCodes.length },
    );

    return iataCodes;
  }
}
