import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {McpAgent} from "agents/mcp";
import {z} from "zod";
import {CoordinatesService} from "./services/coordinatesService";
import {Logger} from "./infra/logging/logger";
import {SupabaseAirportsRepo} from "./repos/supabaseAirportsRepo";
import {Config} from "./infra/config/env";
import {WeatherService} from "./services/weatherService";
import {FlightsService} from "./services/flightsService";
import {HotelsService} from "./services/hotelsService";

const logger = new Logger();

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Travel Agent MCP Server",
    version: "1.0.0",
  });

  async init() {
    const config = Config.fromEnv(this.env);
    this.server.tool(
      "getCoordinates",
      {
        place: z.string().describe("The place to get coordinates for"),
      },
      async ({ place }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await new CoordinatesService({ logger }).get(place),
            ),
          },
        ],
      }),
    );

    this.server.tool(
      "getNearbyAirports",
      {
        lat: z.number().describe("Latitude"),
        lon: z.number().describe("Longitude"),
      },
      async ({ lat, lon }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await new SupabaseAirportsRepo({
                url: config.SUPABASE_URL,
                apiKey: config.SUPABASE_API_KEY,
                logger,
              }).getNearbyAirports({
                lat,
                lon,
              }),
            ),
          },
        ],
      }),
    );

    this.server.tool(
      "getWeatherData",
      {
        lat: z.number().describe("Latitude"),
        lon: z.number().describe("Longitude"),
      },
      async ({ lat, lon }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await new WeatherService({
                api_key: config.OPENWEATHER_API_KEY,
                logger,
              }).get({ lat, lon }),
            ),
          },
        ],
      }),
    );

    this.server.tool(
      "getFlightsData",
      {
        fromIata: z
          .array(z.string())
          .describe("List of origin airport IATA codes"),
        toIata: z
          .array(z.string())
          .describe("List of destination airport IATA codes"),
        start: z.string().describe("Start date (YYYY-MM-DD)"),
        end: z.string().describe("End date (YYYY-MM-DD)"),
      },
      async ({ fromIata, toIata, start, end }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await new FlightsService({
                api_key: config.SERPAPI_API_KEY,
                logger,
              }).get({ fromIata, toIata, start, end }),
            ),
          },
        ],
      }),
    );

    this.server.tool(
      "getHotelsData",
      {
        to: z.string().describe("Destination city or place name"),
        travellers: z.number().describe("Guests (adults)"),
        start: z.string().describe("Start date (YYYY-MM-DD)"),
        end: z.string().describe("End date (YYYY-MM-DD)"),
      },
      async ({ to, travellers, start, end }) => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await new HotelsService({
                api_key: config.SERPAPI_API_KEY,
                logger,
              }).get({ to, travellers, start, end }),
            ),
          },
        ],
      }),
    );
  }
}
export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);
        logger.logInfo('mcp server incoming request', request.url, { meta: { url }});
        if (url.pathname.startsWith("/mcp")) {
                return MyMCP.serve("/mcp").fetch(request, env, ctx);
        }

        return new Response(`Not found (Manual Router). Path saw: ${url.pathname}`, { status: 404 });
    },
};
