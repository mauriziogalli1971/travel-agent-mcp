import { Config } from './infra/config/env';
import { Logger } from './infra/logging/logger';
import { OpenAIService } from './infra/ai/openaiService';
import { TripData } from './domain/types';
import { mapErrorToHttp } from './http/errorMapping';
import { isDev } from './utils/helpers'
import { z } from 'zod'
import { zodTextFormat } from 'openai/helpers/zod'
import { RemoteApiError } from './domain/errors'

const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Content-Type': 'application/json',
};

export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers });
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers });
		}

		const config = Config.fromEnv(env);
		const logger = new Logger();
		const url = new URL(request.url);

		try {
			logger.logInfo?.('MCP Server incoming request', request.url, { meta: { url }});

			const mcpFetcher =
				isDev(url)
					? null
					: env.MCP_SERVER;

			// Step 1: Initialize the MCP session
			// Define the URL to the MCP endpoint: use service binding if production, else local dev URL in .env file
			const initRequest = new Request(config.MCP_SERVER_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json, text/event-stream',
				},
				body: JSON.stringify({
					jsonrpc: '2.0',
					method: 'initialize',
					params: {
						protocolVersion: '2024-11-05',
						capabilities: {},
						clientInfo: {
							name: 'travel-agent-worker',
							version: '1.0.0',
						},
					},
					id: '1',
				}),
			});

			const initResponse = mcpFetcher ? await mcpFetcher.fetch(initRequest) : await fetch(initRequest);

			if (!initResponse.ok) {
				const errorText = await initResponse.text();
				return new Response(JSON.stringify({ error: 'Init failed', details: errorText }), {
					status: initResponse.status,
					headers
				});
			}

			// Step 2: Now call the MCP tool endpoint
			try {
				let json = await request.json();

				try {
					let tripData = TripData.create(json);

					logger.logInfo?.('request.start', { trip: json });

					const openai = new OpenAIService(config.OPENAI_API_KEY, { baseURL: config.CF_AI_GATEWAY }).get()
					const TripDataExtraction = z.object({
						weather: z.string(),
						flight: z.string(),
						hotel: z.string(),
					})

					logger.logInfo?.('request.start.openai', JSON.stringify(openai.config, null, 2))

					const response = await openai.client.responses.create({
						model: openai.config.model,
						tools: [
							{
								type: 'mcp',
								server_label: 'travel-agent-mcp',
								server_description: 'Travel agent MCP server.',
								server_url: config.MCP_SERVER_URL,
								require_approval: 'never',
							},
						],
						input: [
							{
								role: 'system',
								content: [
									{
										type: 'input_text',
										text:
											`You are a travel assistant with access to tools via MCP.
Return ONLY a JSON object that matches the provided output schema.

Rules:
- Derive answers only from tool observations.
- Each field must be a single sentence of max 50 words.
- Weather: provide a short forecast and include min and max Celsius temperatures, no dates. If no weather data: "I don't have any weather data available."
- Flight: best option. If no flights: "I don't have any flights available."
- Hotel: best option. If no hotels: "I don't have any hotels available."`
									},
								],
							},
							{
								role: 'user',
								content: [
									{ type: 'input_text', text: 'Trip data (JSON):' },
									{ type: 'input_text', text: JSON.stringify(tripData) },
									{
										type: 'input_text',
										text:
											`Tasks (use fields from the trip data):
1) Weather: forecast in trip.to between trip.start and trip.end
2) Flights: departing trip.start and return trip.end from airports nearest trip.from to airports nearest trip.to
3) Hotel: best hotel in trip.to for trip.travellers people, check-in trip.start, check-out trip.end, max cost trip.budget.`
									},
								],
							}
						],
						text: {
							format: zodTextFormat(TripDataExtraction, 'trip_data_extraction'),
						}
					})

					const parsed = TripDataExtraction.safeParse(JSON.parse(response.output_text));

					if (!parsed.success) {
						throw new RemoteApiError(`Model output failed schema validation: ${parsed.error.message}`);
					}

					const tripDataExtraction = parsed.data;
					tripData = { ...tripData, ...tripDataExtraction };

					logger.logInfo?.('request.success', { result: tripData });

					return new Response(JSON.stringify(tripData), { headers });
				} catch (error) {
					const { status, body } = mapErrorToHttp(error);
					return new Response(JSON.stringify(body), {
						status,
						headers,
					});
				}
			} catch {
				return new Response(JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Invalid JSON body' }), { status: 400, headers });
			}
		} catch (e) {
			logger.logError?.('debug.tools.error', { error: e.message, stack: e.stack });
			return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
		}
	},
};
