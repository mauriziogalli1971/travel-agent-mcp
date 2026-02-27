export interface ConfigOptions {
  SUPABASE_URL: string;
  SUPABASE_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  SERPAPI_API_KEY: string;
}

export class Config {
  SUPABASE_URL: string;
  SUPABASE_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  SERPAPI_API_KEY: string;

  constructor(env: Cloudflare.Env & ConfigOptions) {
    const {
      SUPABASE_URL,
      SUPABASE_API_KEY,
      OPENWEATHER_API_KEY,
      SERPAPI_API_KEY,
    } = env;

    this.SUPABASE_URL = SUPABASE_URL;
    this.SUPABASE_API_KEY = SUPABASE_API_KEY;
    this.OPENWEATHER_API_KEY = OPENWEATHER_API_KEY;
    this.SERPAPI_API_KEY = SERPAPI_API_KEY;
  }

  static fromEnv(env: Cloudflare.Env & ConfigOptions) {
    const {
      SUPABASE_URL,
      SUPABASE_API_KEY,
      OPENWEATHER_API_KEY,
      SERPAPI_API_KEY,
    } = env;

    if (!SUPABASE_URL) throw new Error("SUPABASE_URL is required");
    if (!SUPABASE_API_KEY) throw new Error("SUPABASE_API_KEY is required");
    if (!OPENWEATHER_API_KEY)
      throw new Error("OPENWEATHER_API_KEY is required");
    if (!SERPAPI_API_KEY) throw new Error("SERPAPI_API_KEY is required");

    return new Config(env);
  }
}
