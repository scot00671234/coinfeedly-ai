export const AI_MODELS = {
  CLAUDE: { name: "Claude", color: "#10B981", provider: "Anthropic" },
  CHATGPT: { name: "ChatGPT", color: "#3B82F6", provider: "OpenAI" },
  DEEPSEEK: { name: "Deepseek", color: "#8B5CF6", provider: "Deepseek AI" }
};

export const COMMODITY_CATEGORIES = {
  HARD: "hard",
  SOFT: "soft"
} as const;

export const TIME_PERIODS = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days", 
  "90d": "Last 90 Days",
  "all": "All Time"
} as const;

export const ALERT_TYPES = {
  VOLATILITY: "volatility",
  DIVERGENCE: "divergence", 
  MILESTONE: "milestone"
} as const;

export const ALERT_SEVERITIES = {
  INFO: "info",
  WARNING: "warning", 
  ERROR: "error"
} as const;
