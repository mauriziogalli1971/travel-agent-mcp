export interface ConfigOptions {
  OPENAI_API_KEY: string;
  MCP_SERVER_URL: string;
  CF_AI_GATEWAY: string;
}

export class Config {
  OPENAI_API_KEY: string;
  MCP_SERVER_URL: string;
  CF_AI_GATEWAY: string;

  constructor(env: Cloudflare.Env & ConfigOptions) {
    const { OPENAI_API_KEY, MCP_SERVER_URL, CF_AI_GATEWAY } = env;

    this.OPENAI_API_KEY = OPENAI_API_KEY;
    this.MCP_SERVER_URL = MCP_SERVER_URL;
    this.CF_AI_GATEWAY = CF_AI_GATEWAY;
  }

  static fromEnv(env: Cloudflare.Env & ConfigOptions) {
    const { OPENAI_API_KEY, MCP_SERVER_URL, CF_AI_GATEWAY } = env;

    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');
    if (!MCP_SERVER_URL) throw new Error('MCP_SERVER_URL is required');
    if (!CF_AI_GATEWAY) throw new Error('CF_AI_GATEWAY is required');

    return new Config(env);
  }
}
