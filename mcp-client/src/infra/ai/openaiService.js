import { OpenAI } from 'openai';

export class OpenAIService {
	constructor(apiKey, config) {
		const defaults = {
			model: 'gpt-5',
			baseURL: 'https://api.openai.com/v1',
		}
		this.config = { ...defaults, ...config };

		this.openai = new OpenAI({
			apiKey,
			baseURL: this.config.baseURL,
		});
	}

	get() {
		return {
			client: this.openai,
			config: this.config,
		};
	}
}
