import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  provider: text("provider").notNull(),
  color: text("color").notNull(),
  isActive: integer("is_active").default(1).notNull(),
});

export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  symbol: text("symbol").notNull().unique(),
  category: text("category").notNull(), // 'defi', 'layer1', 'meme', 'payment', etc.
  coinGeckoId: text("coingecko_id"), // CoinGecko ID for API calls
  unit: text("unit").default("USD"),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiModelId: varchar("ai_model_id").references(() => aiModels.id).notNull(),
  cryptocurrencyId: varchar("cryptocurrency_id").references(() => cryptocurrencies.id).notNull(),
  predictionDate: timestamp("prediction_date").notNull(),
  targetDate: timestamp("target_date").notNull(),
  predictedPrice: decimal("predicted_price", { precision: 10, scale: 4 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  timeframe: text("timeframe").notNull().default("3mo"), // "3mo", "6mo", "9mo", "12mo"
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const actualPrices = pgTable("actual_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cryptocurrencyId: varchar("cryptocurrency_id").references(() => cryptocurrencies.id).notNull(),
  date: timestamp("date").notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }),
  source: text("source").default("coingecko"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const accuracyMetrics = pgTable("accuracy_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aiModelId: varchar("ai_model_id").references(() => aiModels.id).notNull(),
  cryptocurrencyId: varchar("cryptocurrency_id").references(() => cryptocurrencies.id).notNull(),
  period: text("period").notNull(), // '7d', '30d', '90d', 'all'
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  totalPredictions: integer("total_predictions").notNull(),
  correctPredictions: integer("correct_predictions").notNull(),
  avgError: decimal("avg_error", { precision: 10, scale: 4 }),
  lastUpdated: timestamp("last_updated").default(sql`now()`).notNull(),
});

export const marketAlerts = pgTable("market_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'volatility', 'divergence', 'milestone'
  severity: text("severity").notNull(), // 'info', 'warning', 'error'
  title: text("title").notNull(),
  description: text("description").notNull(),
  cryptocurrencyId: varchar("cryptocurrency_id").references(() => cryptocurrencies.id),
  aiModelId: varchar("ai_model_id").references(() => aiModels.id),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const compositeIndex = pgTable("composite_index", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().unique(),
  overallIndex: decimal("overall_index", { precision: 5, scale: 2 }).notNull(),
  layer1Index: decimal("layer1_index", { precision: 5, scale: 2 }).notNull(),
  defiIndex: decimal("defi_index", { precision: 5, scale: 2 }).notNull(),
  directionalComponent: decimal("directional_component", { precision: 5, scale: 2 }).notNull(),
  confidenceComponent: decimal("confidence_component", { precision: 5, scale: 2 }).notNull(),
  accuracyComponent: decimal("accuracy_component", { precision: 5, scale: 2 }).notNull(),
  momentumComponent: decimal("momentum_component", { precision: 5, scale: 2 }).notNull(),
  totalPredictions: integer("total_predictions").notNull(),
  marketSentiment: text("market_sentiment").notNull(), // 'bullish', 'bearish', 'neutral'
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"),
  url: text("url").notNull().unique(),
  imageUrl: text("image_url"),
  source: text("source").notNull(), // 'coingecko', 'cryptopanic', 'newsapi', 'cryptonews'
  sourceName: text("source_name").notNull(), // 'CoinDesk', 'CoinTelegraph', etc.
  author: text("author"),
  category: text("category").notNull(), // 'market', 'technology', 'regulation', 'defi', 'nft', 'gaming'
  tags: jsonb("tags"), // Array of relevant crypto tags ['bitcoin', 'ethereum', 'defi']
  sentiment: text("sentiment"), // 'positive', 'negative', 'neutral'
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }), // -1 to 1
  impactScore: decimal("impact_score", { precision: 5, scale: 2 }), // 1 to 10
  publishedAt: timestamp("published_at").notNull(),
  crawledAt: timestamp("crawled_at").default(sql`now()`).notNull(),
  isActive: integer("is_active").default(1).notNull(),
});

export const newsCategories = pgTable("news_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  color: text("color").notNull(), // Hex color for UI
  isActive: integer("is_active").default(1).notNull(),
});

export const newsSources = pgTable("news_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  baseUrl: text("base_url").notNull(),
  apiType: text("api_type").notNull(), // 'rss', 'api', 'scrape'
  reliability: integer("reliability").default(5).notNull(), // 1-10 scale
  updateFrequency: integer("update_frequency").default(60).notNull(), // minutes
  isActive: integer("is_active").default(1).notNull(),
  lastFetch: timestamp("last_fetch"),
});

// Insert Schemas
export const insertAiModelSchema = createInsertSchema(aiModels).omit({
  id: true,
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertActualPriceSchema = createInsertSchema(actualPrices).omit({
  id: true,
  createdAt: true,
});

export const insertAccuracyMetricSchema = createInsertSchema(accuracyMetrics).omit({
  id: true,
  lastUpdated: true,
});

export const insertMarketAlertSchema = createInsertSchema(marketAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertCompositeIndexSchema = createInsertSchema(compositeIndex).omit({
  id: true,
  createdAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  crawledAt: true,
});

export const insertNewsCategorySchema = createInsertSchema(newsCategories).omit({
  id: true,
});

export const insertNewsSourceSchema = createInsertSchema(newsSources).omit({
  id: true,
});

// Types
export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;

export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

export type ActualPrice = typeof actualPrices.$inferSelect;
export type InsertActualPrice = z.infer<typeof insertActualPriceSchema>;

export type AccuracyMetric = typeof accuracyMetrics.$inferSelect;
export type InsertAccuracyMetric = z.infer<typeof insertAccuracyMetricSchema>;

export type MarketAlert = typeof marketAlerts.$inferSelect;
export type InsertMarketAlert = z.infer<typeof insertMarketAlertSchema>;

export type CompositeIndex = typeof compositeIndex.$inferSelect;
export type InsertCompositeIndex = z.infer<typeof insertCompositeIndexSchema>;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;

export type NewsCategory = typeof newsCategories.$inferSelect;
export type InsertNewsCategory = z.infer<typeof insertNewsCategorySchema>;

export type NewsSource = typeof newsSources.$inferSelect;
export type InsertNewsSource = z.infer<typeof insertNewsSourceSchema>;

// Additional types for API responses
export type DashboardStats = {
  totalPredictions: number;
  topModel: string;
  topAccuracy: number;
  activeCryptocurrencies: number;
  avgAccuracy: number;
};

export type ChartDataPoint = {
  date: string;
  actualPrice: number;
  predictions: Record<string, number>;
};

export type TimePeriod = "1m" | "5m" | "15m" | "30m" | "1h" | "2h" | "5h" | "1d" | "5d" | "1w" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd" | "max";

export type LatestPrice = {
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: string;
};

export type LeagueTableEntry = {
  rank: number;
  aiModel: AiModel;
  accuracy: number;
  totalPredictions: number;
  trend: number;
};

export type NewsFilters = {
  sources?: string[];
  categories?: string[];
  sentiment?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  search?: string;
};

export type NewsSortOption = 'publishedAt' | 'impact' | 'sentiment' | 'source';
export type SortDirection = 'asc' | 'desc';

export type NewsApiResponse = {
  articles: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type NewsStats = {
  totalArticles: number;
  sourcesCount: number;
  categoriesCount: number;
  lastUpdate: string;
};


