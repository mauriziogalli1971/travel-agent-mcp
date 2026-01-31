import { Config } from './infra/config/env';
import { Logger } from './infra/logging/logger';
import { OpenAIService } from './infra/ai/openaiService';
import { toolService } from './infra/ai/toolService';
import { planTrip } from './app/planTrip';
import { TripData } from './domain/types';
import { mapErrorToHttp } from './http/errorMapping';
import { parseSSEResponse } from './utils/helpers'

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

		const config = Config.fromEnv(env);
		const logger = new Logger();
		const url = new URL(request.url);

		if (url.pathname === '/debug/tools') {
			try {
				logger.logInfo?.('request.debug.tools');

				// Step 1: Initialize the MCP session
				const initRequest = new Request('http://localhost:8788/mcp', {
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

				const initResponse = await fetch(initRequest);

				if (!initResponse.ok) {
					const errorText = await initResponse.text();
					return new Response(JSON.stringify({ error: 'Init failed', details: errorText }), {
						status: initResponse.status,
						headers
					});
				}

				// Get the session ID from the response header
				const sessionId = initResponse.headers.get('mcp-session-id');

				// Step 2: Now call tools/list with the session
				const toolsRequest = new Request('http://localhost:8788/mcp', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json, text/event-stream',
						...(sessionId && { 'mcp-session-id': sessionId }),
					},
					body: JSON.stringify({
						jsonrpc: '2.0',
						method: 'tools/list',
						id: '2',
					}),
				});

				const mcpResponse = await fetch(toolsRequest);

				// Clone the response before reading the body
				const responseText = await mcpResponse.text();

				try {
					const tools = parseSSEResponse(responseText);

					if (tools && tools.length > 0) {
						logger.logInfo?.('mcp.tools.received', {
							count: tools.length,
							tools: tools.map(t => t.name)
						});
					}

					return new Response(JSON.stringify({ tools }), { headers });
				} catch (parseError) {
					logger.logError?.('mcp.parse.error', { error: parseError.message, body: responseText });
					return new Response(responseText, { headers });
				}
			} catch (e) {
				logger.logError?.('debug.tools.error', { error: e.message, stack: e.stack });
				return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
			}
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers });
		}

		let json;
		try {
			json = await request.json();
		} catch {
			return new Response(JSON.stringify({ code: 'VALIDATION_ERROR', message: 'Invalid JSON body' }), { status: 400, headers });
		}

		try {
			let tripData = TripData.create(json);

			const openai = new OpenAIService(config.OPENAI_API_KEY).get();
			const toolRunner = toolService(config);

			logger.logInfo?.('request.start', { trip: json });

			tripData = await planTrip({ openai, tripData, toolRunner, logger });

			logger.logInfo?.('request.success', { result: { weather: !!tripData.weather, flight: !!tripData.flight, hotel: !!tripData.hotel } });

			return new Response(JSON.stringify(tripData), { headers });
		} catch (error) {
			const { status, body } = mapErrorToHttp(error);
			return new Response(JSON.stringify(body), {
				status,
				headers,
			});
		}
	},
};
