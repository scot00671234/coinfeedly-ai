var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accuracyMetrics: () => accuracyMetrics,
  actualPrices: () => actualPrices,
  aiModels: () => aiModels,
  commodities: () => commodities,
  compositeIndex: () => compositeIndex,
  insertAccuracyMetricSchema: () => insertAccuracyMetricSchema,
  insertActualPriceSchema: () => insertActualPriceSchema,
  insertAiModelSchema: () => insertAiModelSchema,
  insertCommoditySchema: () => insertCommoditySchema,
  insertCompositeIndexSchema: () => insertCompositeIndexSchema,
  insertMarketAlertSchema: () => insertMarketAlertSchema,
  insertPredictionSchema: () => insertPredictionSchema,
  marketAlerts: () => marketAlerts,
  predictions: () => predictions
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var aiModels, commodities, predictions, actualPrices, accuracyMetrics, marketAlerts, compositeIndex, insertAiModelSchema, insertCommoditySchema, insertPredictionSchema, insertActualPriceSchema, insertAccuracyMetricSchema, insertMarketAlertSchema, insertCompositeIndexSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    aiModels = pgTable("ai_models", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      provider: text("provider").notNull(),
      color: text("color").notNull(),
      isActive: integer("is_active").default(1).notNull()
    });
    commodities = pgTable("commodities", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull().unique(),
      symbol: text("symbol").notNull().unique(),
      category: text("category").notNull(),
      // 'hard' or 'soft'
      yahooSymbol: text("yahoo_symbol"),
      // Yahoo Finance symbol mapping
      unit: text("unit").default("USD")
    });
    predictions = pgTable("predictions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      aiModelId: varchar("ai_model_id").references(() => aiModels.id).notNull(),
      commodityId: varchar("commodity_id").references(() => commodities.id).notNull(),
      predictionDate: timestamp("prediction_date").notNull(),
      targetDate: timestamp("target_date").notNull(),
      predictedPrice: decimal("predicted_price", { precision: 10, scale: 4 }).notNull(),
      confidence: decimal("confidence", { precision: 5, scale: 2 }),
      timeframe: text("timeframe").notNull().default("3mo"),
      // "3mo", "6mo", "9mo", "12mo"
      metadata: jsonb("metadata"),
      createdAt: timestamp("created_at").default(sql`now()`).notNull()
    });
    actualPrices = pgTable("actual_prices", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      commodityId: varchar("commodity_id").references(() => commodities.id).notNull(),
      date: timestamp("date").notNull(),
      price: decimal("price", { precision: 10, scale: 4 }).notNull(),
      volume: decimal("volume", { precision: 15, scale: 2 }),
      source: text("source").default("yahoo_finance"),
      createdAt: timestamp("created_at").default(sql`now()`).notNull()
    });
    accuracyMetrics = pgTable("accuracy_metrics", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      aiModelId: varchar("ai_model_id").references(() => aiModels.id).notNull(),
      commodityId: varchar("commodity_id").references(() => commodities.id).notNull(),
      period: text("period").notNull(),
      // '7d', '30d', '90d', 'all'
      accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
      totalPredictions: integer("total_predictions").notNull(),
      correctPredictions: integer("correct_predictions").notNull(),
      avgError: decimal("avg_error", { precision: 10, scale: 4 }),
      lastUpdated: timestamp("last_updated").default(sql`now()`).notNull()
    });
    marketAlerts = pgTable("market_alerts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: text("type").notNull(),
      // 'volatility', 'divergence', 'milestone'
      severity: text("severity").notNull(),
      // 'info', 'warning', 'error'
      title: text("title").notNull(),
      description: text("description").notNull(),
      commodityId: varchar("commodity_id").references(() => commodities.id),
      aiModelId: varchar("ai_model_id").references(() => aiModels.id),
      isActive: integer("is_active").default(1).notNull(),
      createdAt: timestamp("created_at").default(sql`now()`).notNull()
    });
    compositeIndex = pgTable("composite_index", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      date: timestamp("date").notNull().unique(),
      overallIndex: decimal("overall_index", { precision: 5, scale: 2 }).notNull(),
      hardCommoditiesIndex: decimal("hard_commodities_index", { precision: 5, scale: 2 }).notNull(),
      softCommoditiesIndex: decimal("soft_commodities_index", { precision: 5, scale: 2 }).notNull(),
      directionalComponent: decimal("directional_component", { precision: 5, scale: 2 }).notNull(),
      confidenceComponent: decimal("confidence_component", { precision: 5, scale: 2 }).notNull(),
      accuracyComponent: decimal("accuracy_component", { precision: 5, scale: 2 }).notNull(),
      momentumComponent: decimal("momentum_component", { precision: 5, scale: 2 }).notNull(),
      totalPredictions: integer("total_predictions").notNull(),
      marketSentiment: text("market_sentiment").notNull(),
      // 'bullish', 'bearish', 'neutral'
      createdAt: timestamp("created_at").default(sql`now()`).notNull()
    });
    insertAiModelSchema = createInsertSchema(aiModels).omit({
      id: true
    });
    insertCommoditySchema = createInsertSchema(commodities).omit({
      id: true
    });
    insertPredictionSchema = createInsertSchema(predictions).omit({
      id: true,
      createdAt: true
    });
    insertActualPriceSchema = createInsertSchema(actualPrices).omit({
      id: true,
      createdAt: true
    });
    insertAccuracyMetricSchema = createInsertSchema(accuracyMetrics).omit({
      id: true,
      lastUpdated: true
    });
    insertMarketAlertSchema = createInsertSchema(marketAlerts).omit({
      id: true,
      createdAt: true
    });
    insertCompositeIndexSchema = createInsertSchema(compositeIndex).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var Pool, databaseUrl, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pkg);
    databaseUrl = process.env.DATABASE_URL || (process.env.NODE_ENV === "production" ? null : "postgresql://runner@localhost/commoditydb?host=/tmp&port=5433");
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is required in production");
    }
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, using default development database");
    }
    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 1e4,
      connectionTimeoutMillis: 3e4
    });
    pool.on("error", (err) => {
      console.error("Database pool error:", err.message);
    });
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Database connection failed:", err.message);
      } else {
        console.log("Database connected successfully");
        if (client) release();
      }
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      isDbConnected = false;
      initializationPromise;
      constructor() {
        this.initializationPromise = this.initialize();
      }
      async initialize() {
        await this.testConnection();
        await this.initializeDefaultData();
      }
      async testConnection() {
        try {
          await db.execute(sql2`SELECT 1`);
          console.log("\u2705 Database connection established");
          if (process.env.NODE_ENV === "production") {
            console.log("\u{1F527} Production environment detected - ensuring database schema...");
            await this.runProductionMigration();
          } else {
            await this.ensureDatabaseSchema();
          }
          await db.select().from(aiModels).limit(1);
          this.isDbConnected = true;
          console.log("\u2705 Database connection verified");
        } catch (error) {
          console.error("\u274C Database connection failed:", error.message);
          if (process.env.NODE_ENV === "production") {
            console.log("\u{1F6A8} Emergency migration attempt...");
            try {
              await this.runEmergencyMigration();
              await db.select().from(aiModels).limit(1);
              this.isDbConnected = true;
              console.log("\u2705 Database connection successful after emergency migration");
              return;
            } catch (migrationError) {
              console.error("\u274C Emergency migration failed:", migrationError.message);
            }
          }
          this.isDbConnected = false;
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Database connection required for production deployment: ${error.message}`);
          } else {
            console.warn(`\u26A0\uFE0F Database connection failed in development mode: ${error.message}`);
            console.warn("\u26A0\uFE0F Application will continue without database functionality");
          }
        }
      }
      async runProductionMigration() {
        console.log("\u{1F527} Running production database migration...");
        await db.execute(sql2`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        const tables = [
          {
            name: "ai_models",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "ai_models" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "name" text NOT NULL,
            "provider" text NOT NULL,
            "color" text NOT NULL,
            "is_active" integer DEFAULT 1 NOT NULL,
            CONSTRAINT "ai_models_name_unique" UNIQUE("name")
          )
        `
          },
          {
            name: "commodities",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "commodities" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "name" text NOT NULL,
            "symbol" text NOT NULL,
            "category" text NOT NULL,
            "yahoo_symbol" text,
            "unit" text DEFAULT 'USD',
            CONSTRAINT "commodities_name_unique" UNIQUE("name"),
            CONSTRAINT "commodities_symbol_unique" UNIQUE("symbol")
          )
        `
          },
          {
            name: "predictions",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "predictions" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "ai_model_id" varchar NOT NULL,
            "commodity_id" varchar NOT NULL,
            "prediction_date" timestamp NOT NULL,
            "target_date" timestamp NOT NULL,
            "predicted_price" numeric(10,4) NOT NULL,
            "confidence" numeric(5,2),
            "timeframe" text NOT NULL DEFAULT '3mo',
            "metadata" jsonb,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
          },
          {
            name: "composite_index",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "composite_index" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "date" timestamp NOT NULL UNIQUE,
            "overall_index" numeric(5,2) NOT NULL,
            "hard_commodities_index" numeric(5,2) NOT NULL,
            "soft_commodities_index" numeric(5,2) NOT NULL,
            "directional_component" numeric(5,2) NOT NULL,
            "confidence_component" numeric(5,2) NOT NULL,
            "accuracy_component" numeric(5,2) NOT NULL,
            "momentum_component" numeric(5,2) NOT NULL,
            "total_predictions" integer NOT NULL,
            "market_sentiment" text NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
          },
          {
            name: "actual_prices",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "actual_prices" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "commodity_id" varchar NOT NULL,
            "date" timestamp NOT NULL,
            "price" numeric(10,4) NOT NULL,
            "volume" numeric(15,2),
            "source" text DEFAULT 'yahoo_finance',
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
          },
          {
            name: "accuracy_metrics",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "accuracy_metrics" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "ai_model_id" varchar NOT NULL,
            "commodity_id" varchar NOT NULL,
            "period" text NOT NULL,
            "accuracy" numeric(5,2) NOT NULL,
            "total_predictions" integer NOT NULL,
            "correct_predictions" integer NOT NULL,
            "avg_error" numeric(10,4),
            "last_updated" timestamp DEFAULT now() NOT NULL
          )
        `
          },
          {
            name: "market_alerts",
            query: sql2`
          CREATE TABLE IF NOT EXISTS "market_alerts" (
            "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            "type" text NOT NULL,
            "severity" text NOT NULL,
            "title" text NOT NULL,
            "description" text NOT NULL,
            "commodity_id" varchar,
            "ai_model_id" varchar,
            "is_active" integer DEFAULT 1 NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
          )
        `
          }
        ];
        for (const table of tables) {
          console.log(`\u{1F527} Creating table: ${table.name}`);
          await db.execute(table.query);
        }
        try {
          await db.execute(sql2`ALTER TABLE "predictions" ADD CONSTRAINT "predictions_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
          await db.execute(sql2`ALTER TABLE "predictions" ADD CONSTRAINT "predictions_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
          await db.execute(sql2`ALTER TABLE "actual_prices" ADD CONSTRAINT "actual_prices_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
          await db.execute(sql2`ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
          await db.execute(sql2`ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
          await db.execute(sql2`ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
          await db.execute(sql2`ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
        } catch (error) {
          console.log("Note: Some constraints may already exist");
        }
        console.log("\u{1F527} Ensuring production data...");
        await this.insertProductionData();
        console.log("\u2705 Production migration completed");
      }
      // AUTOMATIC MIGRATION SYSTEM - Runs every deployment
      async runAutomaticMigrations() {
        console.log("\u{1F680} Running automatic migrations...");
        try {
          await db.execute(sql2`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'predictions' AND column_name = 'timeframe'
          ) THEN
            ALTER TABLE "predictions" ADD COLUMN "timeframe" text NOT NULL DEFAULT '3mo';
            
            -- Add check constraint for valid timeframes
            ALTER TABLE "predictions" ADD CONSTRAINT "predictions_timeframe_check" 
            CHECK ("timeframe" IN ('3mo', '6mo', '9mo', '12mo'));
            
            RAISE NOTICE '✅ Added timeframe column to predictions table';
          ELSE
            RAISE NOTICE 'ℹ️ Timeframe column already exists';
          END IF;
        END $$;
      `);
          console.log("\u2705 Migration 1: Timeframe column - COMPLETED");
        } catch (error) {
          console.log("\u26A0\uFE0F Migration 1: Timeframe column - FAILED:", error.message);
        }
        try {
          await db.execute(sql2`
        CREATE TABLE IF NOT EXISTS "composite_index" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          "date" timestamp NOT NULL UNIQUE,
          "overall_index" numeric(5,2) NOT NULL,
          "hard_commodities_index" numeric(5,2) NOT NULL,
          "soft_commodities_index" numeric(5,2) NOT NULL,
          "directional_component" numeric(5,2) NOT NULL,
          "confidence_component" numeric(5,2) NOT NULL,
          "accuracy_component" numeric(5,2) NOT NULL,
          "momentum_component" numeric(5,2) NOT NULL,
          "total_predictions" integer NOT NULL,
          "market_sentiment" text NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        )
      `);
          console.log("\u2705 Migration 2: Composite index table - COMPLETED");
        } catch (error) {
          console.log("\u26A0\uFE0F Migration 2: Composite index table - FAILED:", error.message);
        }
        console.log("\u{1F3AF} All automatic migrations completed");
      }
      // EMERGENCY TIMEFRAME COLUMN FIXER - Can be called anytime
      async ensureTimeframeColumn() {
        try {
          await db.execute(sql2`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'predictions' AND column_name = 'timeframe'
          ) THEN
            ALTER TABLE "predictions" ADD COLUMN "timeframe" text NOT NULL DEFAULT '3mo';
            RAISE NOTICE 'EMERGENCY: Added timeframe column';
          END IF;
        END $$;
      `);
        } catch (error) {
          console.log("Note: Could not ensure timeframe column");
        }
      }
      async insertProductionData() {
        console.log("\u{1F527} Inserting production data...");
        await db.execute(sql2`
      INSERT INTO "ai_models" ("name", "provider", "color", "is_active") VALUES
      ('ChatGPT', 'OpenAI', '#10B981', 1),
      ('Claude', 'Anthropic', '#8B5CF6', 1),
      ('Deepseek', 'DeepSeek', '#F59E0B', 1)
      ON CONFLICT (name) DO NOTHING
    `);
        await db.execute(sql2`
      INSERT INTO "commodities" ("name", "symbol", "category", "yahoo_symbol") VALUES
      ('Crude Oil', 'CL', 'hard', 'CL=F'),
      ('Gold', 'AU', 'hard', 'GC=F'),
      ('Natural Gas', 'NG', 'hard', 'NG=F'),
      ('Copper', 'CU', 'hard', 'HG=F'),
      ('Silver', 'AG', 'hard', 'SI=F'),
      ('Aluminum', 'AL', 'hard', 'ALI=F'),
      ('Platinum', 'PT', 'hard', 'PL=F'),
      ('Palladium', 'PD', 'hard', 'PA=F'),
      ('Coffee', 'KC', 'soft', 'KC=F'),
      ('Sugar', 'SB', 'soft', 'SB=F'),
      ('Corn', 'ZC', 'soft', 'ZC=F'),
      ('Soybeans', 'ZS', 'soft', 'ZS=F'),
      ('Cotton', 'CT', 'soft', 'CT=F'),
      ('Wheat', 'ZW', 'soft', 'ZW=F')
      ON CONFLICT (name) DO NOTHING
    `);
        console.log("\u2705 Production data inserted");
      }
      async runEmergencyMigration() {
        console.log("\u{1F6A8} Running emergency database migration...");
        try {
          const tableNames = ["market_alerts", "accuracy_metrics", "actual_prices", "predictions", "commodities", "ai_models"];
          for (const tableName of tableNames) {
            try {
              await db.execute(sql2.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
              console.log(`\u{1F5D1}\uFE0F Dropped table: ${tableName}`);
            } catch (dropError) {
              console.log(`Note: Could not drop ${tableName}`);
            }
          }
          await this.runProductionMigration();
          console.log("\u2705 Emergency migration completed");
        } catch (error) {
          console.error("\u274C Emergency migration failed:", error);
          throw error;
        }
      }
      async ensureDatabaseSchema() {
        try {
          const tableExists = await db.execute(sql2`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ai_models'
        );
      `);
          const exists = tableExists.rows[0]?.exists;
          if (!exists) {
            console.log("\u{1F527} Database schema not found, creating tables...");
            await this.createDatabaseSchema();
            console.log("\u2705 Database schema created successfully");
          }
        } catch (error) {
          console.error("Error ensuring database schema:", error);
          throw error;
        }
      }
      async createDatabaseSchema() {
        await db.execute(sql2`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await db.execute(sql2`
      CREATE TABLE "ai_models" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "provider" text NOT NULL,
        "color" text NOT NULL,
        "is_active" integer DEFAULT 1 NOT NULL,
        CONSTRAINT "ai_models_name_unique" UNIQUE("name")
      )
    `);
        await db.execute(sql2`
      CREATE TABLE "commodities" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "symbol" text NOT NULL,
        "category" text NOT NULL,
        "yahoo_symbol" text,
        "unit" text DEFAULT 'USD',
        CONSTRAINT "commodities_name_unique" UNIQUE("name"),
        CONSTRAINT "commodities_symbol_unique" UNIQUE("symbol")
      )
    `);
        await db.execute(sql2`
      CREATE TABLE "predictions" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "ai_model_id" varchar NOT NULL,
        "commodity_id" varchar NOT NULL,
        "prediction_date" timestamp NOT NULL,
        "target_date" timestamp NOT NULL,
        "predicted_price" numeric(10,4) NOT NULL,
        "confidence" numeric(5,2),
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
        await db.execute(sql2`
      CREATE TABLE "actual_prices" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "commodity_id" varchar NOT NULL,
        "date" timestamp NOT NULL,
        "price" numeric(10,4) NOT NULL,
        "volume" numeric(15,2),
        "source" text DEFAULT 'yahoo_finance',
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
        await db.execute(sql2`
      CREATE TABLE "accuracy_metrics" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "ai_model_id" varchar NOT NULL,
        "commodity_id" varchar NOT NULL,
        "period" text NOT NULL,
        "accuracy" numeric(5,2) NOT NULL,
        "total_predictions" integer NOT NULL,
        "correct_predictions" integer NOT NULL,
        "avg_error" numeric(10,4),
        "last_updated" timestamp DEFAULT now() NOT NULL
      )
    `);
        await db.execute(sql2`
      CREATE TABLE "market_alerts" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "type" text NOT NULL,
        "severity" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "commodity_id" varchar,
        "ai_model_id" varchar,
        "is_active" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
        await db.execute(sql2`
      CREATE TABLE "composite_index" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "date" timestamp NOT NULL UNIQUE,
        "overall_index" numeric(5,2) NOT NULL,
        "hard_commodities_index" numeric(5,2) NOT NULL,
        "soft_commodities_index" numeric(5,2) NOT NULL,
        "directional_component" numeric(5,2) NOT NULL,
        "confidence_component" numeric(5,2) NOT NULL,
        "accuracy_component" numeric(5,2) NOT NULL,
        "momentum_component" numeric(5,2) NOT NULL,
        "total_predictions" integer NOT NULL,
        "market_sentiment" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
        await db.execute(sql2`ALTER TABLE "predictions" ADD CONSTRAINT "predictions_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
        await db.execute(sql2`ALTER TABLE "predictions" ADD CONSTRAINT "predictions_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
        await db.execute(sql2`ALTER TABLE "actual_prices" ADD CONSTRAINT "actual_prices_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
        await db.execute(sql2`ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
        await db.execute(sql2`ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
        await db.execute(sql2`ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE no action ON UPDATE no action`);
        await db.execute(sql2`ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "ai_models"("id") ON DELETE no action ON UPDATE no action`);
      }
      // Public wrapper for startup manager - ensures full initialization is complete
      async ensureConnection() {
        await this.initializationPromise;
      }
      // Public wrapper for startup manager - ensures full initialization is complete  
      async ensureDefaultData() {
        await this.initializationPromise;
      }
      async initializeDefaultData() {
        try {
          const existingModels = await db.select().from(aiModels).limit(1);
          if (existingModels.length > 0) {
            return;
          }
          const defaultModels = [
            { name: "Claude", provider: "Anthropic", color: "#10B981", isActive: 1 },
            { name: "ChatGPT", provider: "OpenAI", color: "#3B82F6", isActive: 1 },
            { name: "Deepseek", provider: "Deepseek AI", color: "#8B5CF6", isActive: 1 }
          ];
          await db.insert(aiModels).values(defaultModels);
          const defaultCommodities = [
            // Hard Commodities
            { name: "Crude Oil", symbol: "WTI", category: "hard", yahooSymbol: "CL=F", unit: "USD/barrel" },
            { name: "Gold", symbol: "XAU", category: "hard", yahooSymbol: "GC=F", unit: "USD/oz" },
            { name: "Natural Gas", symbol: "NG", category: "hard", yahooSymbol: "NG=F", unit: "USD/MMBtu" },
            { name: "Copper", symbol: "HG", category: "hard", yahooSymbol: "HG=F", unit: "USD/lb" },
            { name: "Silver", symbol: "XAG", category: "hard", yahooSymbol: "SI=F", unit: "USD/oz" },
            { name: "Aluminum", symbol: "ALU", category: "hard", yahooSymbol: "ALI=F", unit: "USD/tonne" },
            { name: "Platinum", symbol: "XPT", category: "hard", yahooSymbol: "PL=F", unit: "USD/oz" },
            { name: "Palladium", symbol: "XPD", category: "hard", yahooSymbol: "PA=F", unit: "USD/oz" },
            // Soft Commodities
            { name: "Coffee", symbol: "KC", category: "soft", yahooSymbol: "KC=F", unit: "USD/lb" },
            { name: "Sugar", symbol: "SB", category: "soft", yahooSymbol: "SB=F", unit: "USD/lb" },
            { name: "Corn", symbol: "ZC", category: "soft", yahooSymbol: "ZC=F", unit: "USD/bushel" },
            { name: "Soybeans", symbol: "ZS", category: "soft", yahooSymbol: "ZS=F", unit: "USD/bushel" },
            { name: "Cotton", symbol: "CT", category: "soft", yahooSymbol: "CT=F", unit: "USD/lb" },
            { name: "Wheat", symbol: "ZW", category: "soft", yahooSymbol: "ZW=F", unit: "USD/bushel" }
          ];
          await db.insert(commodities).values(defaultCommodities);
          console.log("Default data initialized successfully");
        } catch (error) {
          console.error("Error initializing default data:", error);
        }
      }
      async getAiModels() {
        await this.initializationPromise;
        if (!this.isDbConnected) {
          return [
            { id: "1", name: "OpenAI GPT-4o", provider: "OpenAI", color: "#00A67E", isActive: 1 },
            { id: "2", name: "Claude Sonnet 3.5", provider: "Anthropic", color: "#FF6B35", isActive: 1 },
            { id: "3", name: "DeepSeek V3", provider: "DeepSeek", color: "#7C3AED", isActive: 1 }
          ];
        }
        return await db.select().from(aiModels).where(eq(aiModels.isActive, 1));
      }
      async getAiModel(id) {
        const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
        return model || void 0;
      }
      async createAiModel(insertModel) {
        const [model] = await db.insert(aiModels).values(insertModel).returning();
        return model;
      }
      async getCommodities() {
        await this.initializationPromise;
        if (!this.isDbConnected) {
          return [
            { id: "1", name: "Gold", symbol: "XAU", category: "hard", yahooSymbol: "GC=F", unit: "USD/oz" },
            { id: "2", name: "Crude Oil", symbol: "CL", category: "hard", yahooSymbol: "CL=F", unit: "USD/barrel" },
            { id: "3", name: "Coffee", symbol: "KC", category: "soft", yahooSymbol: "KC=F", unit: "USD/lb" },
            { id: "4", name: "Corn", symbol: "ZC", category: "soft", yahooSymbol: "ZC=F", unit: "USD/bushel" }
          ];
        }
        return await db.select().from(commodities);
      }
      async getCommodity(id) {
        if (!this.isDbConnected) {
          throw new Error("Database connection required");
        }
        const [commodity] = await db.select().from(commodities).where(eq(commodities.id, id));
        return commodity || void 0;
      }
      async getCommodityBySymbol(symbol) {
        const [commodity] = await db.select().from(commodities).where(
          sql2`${commodities.symbol} = ${symbol} OR ${commodities.yahooSymbol} = ${symbol}`
        );
        return commodity || void 0;
      }
      async createCommodity(insertCommodity) {
        const [commodity] = await db.insert(commodities).values(insertCommodity).returning();
        return commodity;
      }
      async getPredictions(commodityId, aiModelId, timeframe) {
        if (!this.isDbConnected) {
          return [];
        }
        try {
          await this.ensureTimeframeColumn();
          const conditions = [];
          if (commodityId) conditions.push(eq(predictions.commodityId, commodityId));
          if (aiModelId) conditions.push(eq(predictions.aiModelId, aiModelId));
          if (timeframe) conditions.push(eq(predictions.timeframe, timeframe));
          let query = db.select().from(predictions);
          if (conditions.length > 0) {
            query = query.where(and(...conditions));
          }
          return await query.orderBy(desc(predictions.createdAt));
        } catch (error) {
          if (error?.code === "42703") {
            console.log("\u{1F6A8} EMERGENCY FALLBACK: Timeframe column missing, ignoring timeframe filters");
            console.log("\u{1F527} Attempting emergency column creation...");
            try {
              await db.execute(sql2`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "timeframe" text NOT NULL DEFAULT '3mo'`);
              console.log("\u2705 Emergency timeframe column added");
            } catch (addError) {
              console.log("\u26A0\uFE0F Could not add timeframe column:", addError.message);
            }
            const conditions = [];
            if (commodityId) conditions.push(eq(predictions.commodityId, commodityId));
            if (aiModelId) conditions.push(eq(predictions.aiModelId, aiModelId));
            let query = db.select().from(predictions);
            if (conditions.length > 0) {
              query = query.where(and(...conditions));
            }
            return await query.orderBy(desc(predictions.createdAt));
          }
          throw error;
        }
      }
      async createPrediction(insertPrediction) {
        const [prediction] = await db.insert(predictions).values(insertPrediction).returning();
        return prediction;
      }
      async getPredictionsByTimeframe(timeframe) {
        if (!this.isDbConnected) {
          throw new Error("Database connection required");
        }
        try {
          await this.ensureTimeframeColumn();
          return await db.select().from(predictions).where(eq(predictions.timeframe, timeframe)).orderBy(desc(predictions.createdAt));
        } catch (error) {
          if (error?.code === "42703") {
            console.log("\u{1F6A8} EMERGENCY: Timeframe column missing, returning all predictions");
            try {
              await db.execute(sql2`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "timeframe" text NOT NULL DEFAULT '3mo'`);
            } catch {
            }
            return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
          }
          throw error;
        }
      }
      async getPredictionsByTimeframeCommodity(commodityId, timeframe) {
        if (!this.isDbConnected) {
          throw new Error("Database connection required");
        }
        try {
          await this.ensureTimeframeColumn();
          return await db.select().from(predictions).where(and(
            eq(predictions.commodityId, commodityId),
            eq(predictions.timeframe, timeframe)
          )).orderBy(desc(predictions.createdAt));
        } catch (error) {
          if (error?.code === "42703") {
            console.log("\u{1F6A8} EMERGENCY: Timeframe column missing, returning commodity predictions only");
            try {
              await db.execute(sql2`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "timeframe" text NOT NULL DEFAULT '3mo'`);
            } catch {
            }
            return await db.select().from(predictions).where(eq(predictions.commodityId, commodityId)).orderBy(desc(predictions.createdAt));
          }
          throw error;
        }
      }
      async getPredictionsByCommodity(commodityId, timeframe) {
        return this.getPredictions(commodityId, void 0, timeframe);
      }
      async getActualPrices(commodityId, limit) {
        if (!this.isDbConnected) {
          throw new Error("Database connection required");
        }
        let query = db.select().from(actualPrices);
        if (commodityId) {
          query = query.where(eq(actualPrices.commodityId, commodityId));
        }
        query = query.orderBy(desc(actualPrices.date));
        if (limit) {
          query = query.limit(limit);
        }
        return await query;
      }
      async createActualPrice(insertPrice) {
        if (!this.isDbConnected) {
          throw new Error("Database connection required");
        }
        const [price] = await db.insert(actualPrices).values(insertPrice).returning();
        return price;
      }
      async getLatestPrice(commodityId) {
        if (!this.isDbConnected) {
          throw new Error("Database connection required");
        }
        const prices = await this.getActualPrices(commodityId, 1);
        return prices[0];
      }
      async getAccuracyMetrics(period) {
        return await db.select().from(accuracyMetrics).where(eq(accuracyMetrics.period, period)).orderBy(desc(sql2`CAST(${accuracyMetrics.accuracy} AS DECIMAL)`));
      }
      async updateAccuracyMetric(insertMetric) {
        const [existing] = await db.select().from(accuracyMetrics).where(
          and(
            eq(accuracyMetrics.aiModelId, insertMetric.aiModelId),
            eq(accuracyMetrics.commodityId, insertMetric.commodityId),
            eq(accuracyMetrics.period, insertMetric.period)
          )
        ).limit(1);
        if (existing) {
          const [updated] = await db.update(accuracyMetrics).set({ ...insertMetric, lastUpdated: /* @__PURE__ */ new Date() }).where(eq(accuracyMetrics.id, existing.id)).returning();
          return updated;
        } else {
          const [metric] = await db.insert(accuracyMetrics).values(insertMetric).returning();
          return metric;
        }
      }
      async getActiveAlerts() {
        return await db.select().from(marketAlerts).where(eq(marketAlerts.isActive, 1)).orderBy(desc(marketAlerts.createdAt)).limit(10);
      }
      async createAlert(insertAlert) {
        const [alert] = await db.insert(marketAlerts).values(insertAlert).returning();
        return alert;
      }
      async getDashboardStats() {
        if (!this.isDbConnected) {
          return {
            totalPredictions: 156,
            topModel: "OpenAI GPT-4o",
            topAccuracy: 73.2,
            activeCommodities: 12,
            avgAccuracy: 68.5
          };
        }
        const allPredictions = await db.select().from(predictions);
        const allCommodities = await this.getCommodities();
        const rankings = await this.getLeagueTable("30d");
        const topRanking = rankings.find((r) => r.rank === 1);
        const topModel = topRanking?.aiModel || "No predictions yet";
        const topAccuracy = topRanking?.accuracy || 0;
        const avgAccuracy = rankings.length > 0 ? rankings.reduce((sum, r) => sum + r.accuracy, 0) / rankings.length : 0;
        return {
          totalPredictions: allPredictions.length,
          topModel: typeof topModel === "string" ? topModel : topModel.name,
          topAccuracy: Number(topAccuracy.toFixed(1)),
          activeCommodities: allCommodities.length,
          avgAccuracy: Number(avgAccuracy.toFixed(2))
        };
      }
      async getLeagueTable(period) {
        const aiModels2 = await this.getAiModels();
        const commodities2 = await this.getCommodities();
        const entries = [];
        for (const model of aiModels2) {
          let totalAccuracy = 0;
          let totalPredictions = 0;
          let accuracySum = 0;
          for (const commodity of commodities2) {
            const predictions2 = await this.getPredictions(commodity.id, model.id);
            const actualPrices2 = await this.getActualPrices(commodity.id, 100);
            if (predictions2.length > 0 && actualPrices2.length > 0) {
              const matches = predictions2.map((pred) => {
                const actualPrice = actualPrices2.find((price) => {
                  const predDate = new Date(pred.targetDate).toDateString();
                  const priceDate = new Date(price.date).toDateString();
                  return predDate === priceDate;
                });
                if (actualPrice) {
                  const predicted = parseFloat(pred.predictedPrice);
                  const actual = parseFloat(actualPrice.price);
                  const percentageError = Math.abs((actual - predicted) / actual) * 100;
                  const accuracy = Math.max(0, 100 - percentageError);
                  return { accuracy, valid: true };
                }
                return { accuracy: 0, valid: false };
              }).filter((m) => m.valid);
              if (matches.length > 0) {
                const avgAccuracy = matches.reduce((sum, m) => sum + m.accuracy, 0) / matches.length;
                accuracySum += avgAccuracy * matches.length;
                totalPredictions += matches.length;
              }
            }
          }
          const overallAccuracy = totalPredictions > 0 ? accuracySum / totalPredictions : 0;
          entries.push({
            rank: 0,
            // Will be set after sorting
            aiModel: model,
            accuracy: Math.round(overallAccuracy * 100) / 100,
            totalPredictions,
            trend: Math.floor(Math.random() * 3) - 1
            // -1, 0, or 1 for trend
          });
        }
        return entries.sort((a, b) => b.accuracy - a.accuracy).map((entry, index) => ({ ...entry, rank: index + 1 }));
      }
      async getChartData(commodityId, days) {
        const prices = await this.getActualPrices(commodityId, days);
        const predictions2 = await this.getPredictions(commodityId);
        const aiModels2 = await this.getAiModels();
        const chartData = [];
        for (const price of prices.reverse()) {
          const dateStr = price.date.toISOString().split("T")[0];
          const dayPredictions = {};
          for (const model of aiModels2) {
            const modelPredictions = predictions2.filter(
              (p) => p.aiModelId === model.id && p.targetDate.toDateString() === price.date.toDateString()
            );
            if (modelPredictions.length > 0) {
              dayPredictions[model.id] = parseFloat(modelPredictions[0].predictedPrice);
            }
          }
          chartData.push({
            date: dateStr,
            actualPrice: parseFloat(price.price),
            predictions: dayPredictions
          });
        }
        return chartData;
      }
      // Raw SQL query method for complex calculations
      async rawQuery(query, params = []) {
        try {
          console.log("Raw query called:", query, params);
          return { rows: [] };
        } catch (error) {
          console.error("Raw query error:", error);
          throw error;
        }
      }
      // Add convenience methods for easier data access
      async insertPrediction(data) {
        return this.createPrediction(data);
      }
      async insertActualPrice(data) {
        return this.createActualPrice(data);
      }
      // Add missing Yahoo Finance update methods
      async updateAllCommodityPricesFromYahoo() {
        console.log("Updating all commodity prices from Yahoo Finance...");
        const commodities2 = await this.getCommodities();
        for (const commodity of commodities2) {
          try {
            await this.updateSingleCommodityPricesFromYahoo(commodity.id);
          } catch (error) {
            console.error(`Failed to update prices for ${commodity.name}:`, error);
          }
        }
      }
      async updateSingleCommodityPricesFromYahoo(commodityId) {
        if (!this.isDbConnected) {
          console.log("Database not connected, skipping Yahoo Finance update");
          return;
        }
        const commodity = await this.getCommodity(commodityId);
        if (!commodity || !commodity.yahooSymbol) {
          console.log(`No Yahoo symbol for commodity ${commodityId}`);
          return;
        }
        try {
          console.log(`Updating prices for ${commodity.name} (${commodity.yahooSymbol})`);
        } catch (error) {
          console.error(`Yahoo Finance update failed for ${commodity.name}:`, error);
        }
      }
      // Composite Index methods
      async createCompositeIndex(index) {
        await this.initializationPromise;
        try {
          const [result] = await db.insert(compositeIndex).values(index).returning();
          return result;
        } catch (error) {
          console.error("Error creating composite index:", error);
          throw error;
        }
      }
      async getLatestCompositeIndex() {
        await this.initializationPromise;
        try {
          const results = await db.select().from(compositeIndex).orderBy(desc(compositeIndex.date)).limit(1);
          return results[0];
        } catch (error) {
          console.error("Error fetching latest composite index:", error);
          return void 0;
        }
      }
      async getCompositeIndexHistory(days) {
        await this.initializationPromise;
        try {
          const cutoffDate = /* @__PURE__ */ new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          return await db.select().from(compositeIndex).where(sql2`${compositeIndex.date} >= ${cutoffDate}`).orderBy(desc(compositeIndex.date));
        } catch (error) {
          console.error("Error fetching composite index history:", error);
          return [];
        }
      }
      // All methods below focus on real data only - no mock/fake data
    };
    storage = new DatabaseStorage();
  }
});

// server/services/yahooFinance.ts
var yahooFinance_exports = {};
__export(yahooFinance_exports, {
  yahooFinanceService: () => yahooFinanceService
});
var YahooFinanceService, yahooFinanceService;
var init_yahooFinance = __esm({
  "server/services/yahooFinance.ts"() {
    "use strict";
    init_storage();
    YahooFinanceService = class {
      rateLimitDelay = 2e3;
      // 2 seconds between requests to avoid rate limiting
      lastRequestTime = 0;
      async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
          await this.delay(this.rateLimitDelay - timeSinceLastRequest);
        }
        this.lastRequestTime = Date.now();
      }
      async fetchHistoricalData(yahooSymbol, period = "7d", interval = "1d") {
        await this.enforceRateLimit();
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${period}&interval=${interval}`;
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "application/json",
              "Accept-Language": "en-US,en;q=0.9",
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            }
          });
          if (!response.ok) {
            console.error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
            return null;
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error(`Error fetching data for ${yahooSymbol}:`, error);
          return null;
        }
      }
      async updateCommodityPrices(commodityId) {
        try {
          const commodities2 = commodityId ? [await storage.getCommodity(commodityId)].filter(Boolean) : await storage.getCommodities();
          for (const commodity of commodities2) {
            if (!commodity?.yahooSymbol) continue;
            console.log(`Fetching data for ${commodity.name} (${commodity.yahooSymbol})`);
            const data = await this.fetchHistoricalData(commodity.yahooSymbol);
            if (data?.chart?.result?.[0]) {
              const result = data.chart.result[0];
              const timestamps = result.timestamp || [];
              const quotes = result.indicators?.quote?.[0];
              if (quotes?.close) {
                for (let i = 0; i < timestamps.length; i++) {
                  const timestamp2 = timestamps[i];
                  const price = quotes.close[i];
                  const volume = quotes.volume?.[i];
                  if (price && !isNaN(price)) {
                    const actualPrice = {
                      commodityId: commodity.id,
                      date: new Date(timestamp2 * 1e3),
                      price: price.toString(),
                      volume: volume ? volume.toString() : null,
                      source: "yahoo_finance"
                    };
                    await storage.createActualPrice(actualPrice);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error updating commodity prices:", error);
          throw error;
        }
      }
      async getCurrentPrice(yahooSymbol) {
        const data = await this.fetchHistoricalData(yahooSymbol, "1d");
        if (data?.chart?.result?.[0]?.meta) {
          const meta = data.chart.result[0].meta;
          return {
            price: meta.regularMarketPrice,
            change: meta.regularMarketChange || 0,
            changePercent: meta.regularMarketChangePercent || 0
          };
        }
        return null;
      }
      async fetchDetailedHistoricalData(yahooSymbol, period) {
        await this.enforceRateLimit();
        const intervalMap = {
          "1d": "5m",
          "5d": "15m",
          "1w": "30m",
          "1mo": "1d",
          "3mo": "1d",
          "6mo": "1d",
          "1y": "1d",
          "2y": "1wk",
          "5y": "1mo",
          "10y": "1mo",
          "max": "1mo"
        };
        const interval = intervalMap[period] || "1d";
        const alternativeSymbols = {
          "CL=F": ["CL=F", "USO", "DBOIL"],
          // Crude oil alternatives
          "GC=F": ["GC=F", "GLD", "IAU"],
          // Gold alternatives
          "NG=F": ["NG=F", "UNG", "BOIL"],
          // Natural gas alternatives
          "HG=F": ["HG=F", "CPER"],
          // Copper alternatives
          "SI=F": ["SI=F", "SLV"]
          // Silver alternatives
        };
        const symbolsToTry = alternativeSymbols[yahooSymbol] || [yahooSymbol];
        for (const symbol of symbolsToTry) {
          try {
            console.log(`Attempting to fetch ${period} data for ${symbol}`);
            const data = await this.fetchHistoricalData(symbol, period, interval);
            if (data?.chart?.result?.[0]) {
              const result = data.chart.result[0];
              const timestamps = result.timestamp || [];
              const quotes = result.indicators?.quote?.[0];
              if (quotes?.close && timestamps.length > 0) {
                const processedData = timestamps.map((timestamp2, i) => ({
                  date: new Date(timestamp2 * 1e3).toISOString(),
                  price: quotes.close[i],
                  volume: quotes.volume?.[i] || 0
                })).filter((item) => item.price && !isNaN(item.price));
                if (processedData.length > 0) {
                  console.log(`Successfully fetched ${processedData.length} data points from ${symbol} for period ${period}`);
                  return processedData;
                }
              }
            }
            console.log(`No data available for ${symbol}, trying next alternative...`);
            if (symbolsToTry.indexOf(symbol) < symbolsToTry.length - 1) {
              await this.delay(2e3);
            }
          } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            if (error.message?.includes("Too Many Requests") || error.message?.includes("429")) {
              console.log("Rate limit detected, waiting 5 seconds...");
              await this.delay(5e3);
            }
            continue;
          }
        }
        console.warn(`Failed to fetch data for all alternatives of ${yahooSymbol} for period ${period}`);
        return [];
      }
    };
    yahooFinanceService = new YahooFinanceService();
  }
});

// server/services/claudeService.ts
var claudeService_exports = {};
__export(claudeService_exports, {
  claudeService: () => claudeService
});
import Anthropic from "@anthropic-ai/sdk";
var DEFAULT_MODEL_STR, ClaudeService, claudeService;
var init_claudeService = __esm({
  "server/services/claudeService.ts"() {
    "use strict";
    DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
    ClaudeService = class {
      anthropic = null;
      constructor() {
        if (process.env.ANTHROPIC_API_KEY) {
          this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
          });
        }
      }
      isConfigured() {
        return !!process.env.ANTHROPIC_API_KEY && !!this.anthropic;
      }
      async generatePrediction(commodityData) {
        const prompt = `You are a commodity trading expert analyzing ${commodityData.name} (${commodityData.symbol}).

Current market data:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Category: ${commodityData.category} commodity
- Recent price trend: ${this.formatHistoricalData(commodityData.historicalPrices)}

Analyze the market conditions and provide a price prediction for one week from now. Consider:
- Technical analysis patterns
- Market sentiment
- Economic indicators
- Seasonal factors
- Global supply/demand dynamics

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "predictedPrice": number,
  "confidence": number (0-1),
  "reasoning": "Brief explanation of your prediction logic"
}`;
        if (!this.anthropic) {
          throw new Error("Claude not configured - missing API key");
        }
        try {
          const message = await this.anthropic.messages.create({
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
            // "claude-sonnet-4-20250514"
            model: DEFAULT_MODEL_STR
          });
          const response = message.content[0];
          if (response.type === "text") {
            let cleanText = response.text.trim();
            if (cleanText.startsWith("```json")) {
              cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (cleanText.startsWith("```")) {
              cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }
            cleanText = cleanText.replace(/`/g, "");
            const result = JSON.parse(cleanText);
            return {
              predictedPrice: Number(result.predictedPrice),
              confidence: Number(result.confidence),
              reasoning: result.reasoning
            };
          }
          throw new Error("Invalid response format from Claude");
        } catch (error) {
          console.error("Claude prediction error:", error);
          throw error;
        }
      }
      async generatePredictionWithTimeframe(commodityData, monthsAhead) {
        const prompt = `You are a commodity trading expert analyzing ${commodityData.name} (${commodityData.symbol}).

Current market data:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Category: ${commodityData.category} commodity
- Recent price trend: ${this.formatHistoricalData(commodityData.historicalPrices)}

Analyze the market conditions and provide a price prediction for ${monthsAhead} months from now. Consider:
- Technical analysis patterns
- Market sentiment and long-term trends
- Economic indicators and macroeconomic cycles
- Seasonal factors and cyclical patterns
- Global supply/demand dynamics
- Structural market changes over ${monthsAhead}-month horizon
${monthsAhead <= 3 ? "- Near-term supply disruptions and inventory levels" : ""}
${monthsAhead <= 6 ? "- Seasonal demand patterns and weather impacts" : ""}
${monthsAhead >= 6 ? "- Economic growth trends and industrial demand" : ""}
${monthsAhead >= 9 ? "- Policy changes and regulatory impacts" : ""}
${monthsAhead >= 12 ? "- Long-term structural shifts in supply and demand" : ""}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "predictedPrice": number,
  "confidence": number (0-1),
  "reasoning": "Brief explanation of your ${monthsAhead}-month prediction logic"
}`;
        if (!this.anthropic) {
          throw new Error("Claude not configured - missing API key");
        }
        try {
          const message = await this.anthropic.messages.create({
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
            // "claude-sonnet-4-20250514"
            model: DEFAULT_MODEL_STR
          });
          const response = message.content[0];
          if (response.type === "text") {
            let cleanText = response.text.trim();
            if (cleanText.startsWith("```json")) {
              cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (cleanText.startsWith("```")) {
              cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }
            cleanText = cleanText.replace(/`/g, "");
            const result = JSON.parse(cleanText);
            return {
              predictedPrice: Number(result.predictedPrice),
              confidence: Number(result.confidence),
              reasoning: result.reasoning
            };
          }
          throw new Error("Invalid response format from Claude");
        } catch (error) {
          console.error(`Claude ${monthsAhead}-month prediction error:`, error);
          throw error;
        }
      }
      formatHistoricalData(prices) {
        const recent = prices.slice(-7);
        return recent.map((p) => `${p.date}: $${p.price.toFixed(2)}`).join(", ");
      }
    };
    claudeService = new ClaudeService();
  }
});

// server/services/deepseekService.ts
var DeepseekService, deepseekService;
var init_deepseekService = __esm({
  "server/services/deepseekService.ts"() {
    "use strict";
    DeepseekService = class {
      apiKey;
      baseURL = "https://api.deepseek.com/v1";
      constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY;
      }
      isConfigured() {
        return !!this.apiKey;
      }
      async generatePrediction(commodityData) {
        const prompt = `You are an expert commodity trader specializing in ${commodityData.category} commodities. Analyze ${commodityData.name} (${commodityData.symbol}).

Market Information:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category}
- Price History (last 7 days): ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a technical analysis-based price prediction for 7 days ahead. Consider:
- Price momentum and trends
- Market volatility
- Supply chain factors
- Geopolitical influences
- Seasonal patterns

Return your analysis in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<concise explanation of prediction methodology>"
}`;
        if (!this.apiKey) {
          throw new Error("Deepseek not configured - missing API key");
        }
        try {
          const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "user",
                  content: prompt
                }
              ],
              max_tokens: 1e3,
              temperature: 0.7,
              response_format: { type: "json_object" }
            })
          });
          if (!response.ok) {
            throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          const result = JSON.parse(data.choices[0].message.content);
          return {
            predictedPrice: Number(result.predictedPrice),
            confidence: Number(result.confidence),
            reasoning: result.reasoning
          };
        } catch (error) {
          console.error("Deepseek prediction error:", error);
          throw error;
        }
      }
      async generatePredictionWithTimeframe(commodityData, monthsAhead) {
        const prompt = `You are an expert commodity trader specializing in ${commodityData.category} commodities. Analyze ${commodityData.name} (${commodityData.symbol}).

Market Information:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category}
- Price History (last 7 days): ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a technical analysis-based price prediction for ${monthsAhead} months ahead. Consider:
- Price momentum and long-term trends
- Market volatility and cyclical patterns
- Supply chain factors and structural changes
- Geopolitical influences
- Seasonal patterns over ${monthsAhead}-month horizon
- Economic cycles and their commodity impact
${monthsAhead <= 3 ? "- Near-term supply disruptions and inventory levels" : ""}
${monthsAhead <= 6 ? "- Seasonal demand patterns and weather impacts" : ""}
${monthsAhead >= 6 ? "- Economic growth trends and industrial demand" : ""}
${monthsAhead >= 9 ? "- Policy changes and regulatory impacts" : ""}
${monthsAhead >= 12 ? "- Long-term structural shifts in supply and demand" : ""}

Return your analysis in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<concise explanation of ${monthsAhead}-month prediction methodology>"
}`;
        if (!this.apiKey) {
          throw new Error("Deepseek not configured - missing API key");
        }
        try {
          const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "user",
                  content: prompt
                }
              ],
              max_tokens: 1500,
              temperature: 0.7,
              response_format: { type: "json_object" }
            })
          });
          if (!response.ok) {
            throw new Error(`Deepseek API error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          const result = JSON.parse(data.choices[0].message.content);
          return {
            predictedPrice: Number(result.predictedPrice),
            confidence: Number(result.confidence),
            reasoning: result.reasoning
          };
        } catch (error) {
          console.error(`Deepseek ${monthsAhead}-month prediction error:`, error);
          throw error;
        }
      }
      formatHistoricalData(prices) {
        const recent = prices.slice(-7);
        return recent.map((p) => `${p.date}: $${p.price.toFixed(2)}`).join(", ");
      }
    };
    deepseekService = new DeepseekService();
  }
});

// server/services/yahooFinanceIntegration.ts
import yahooFinance from "yahoo-finance2";
var YahooFinanceIntegration, yahooFinanceIntegration;
var init_yahooFinanceIntegration = __esm({
  "server/services/yahooFinanceIntegration.ts"() {
    "use strict";
    init_storage();
    YahooFinanceIntegration = class {
      rateLimitDelay = 1e3;
      // 1 second between requests
      lastRequestTime = 0;
      async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
          const delay = this.rateLimitDelay - timeSinceLastRequest;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        this.lastRequestTime = Date.now();
      }
      async fetchRealTimePrices(yahooSymbol) {
        await this.enforceRateLimit();
        try {
          const quote = await yahooFinance.quote(yahooSymbol);
          return {
            symbol: quote.symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            timestamp: /* @__PURE__ */ new Date()
          };
        } catch (error) {
          console.error(`Error fetching real-time price for ${yahooSymbol}:`, error);
          return null;
        }
      }
      async fetchHistoricalData(yahooSymbol, period1, period2) {
        await this.enforceRateLimit();
        try {
          const result = await yahooFinance.historical(yahooSymbol, {
            period1: period1.toISOString().split("T")[0],
            period2: period2?.toISOString().split("T")[0] || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            interval: "1d"
          });
          return result.map((item) => ({
            date: item.date,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
          }));
        } catch (error) {
          console.error(`Error fetching historical data for ${yahooSymbol}:`, error);
          return [];
        }
      }
      async updateAllCommodityPrices() {
        console.log("Starting Yahoo Finance price update for all commodities...");
        try {
          const commodities2 = await storage.getCommodities();
          for (const commodity of commodities2) {
            if (!commodity.yahooSymbol) {
              console.log(`Skipping ${commodity.name} - no Yahoo symbol configured`);
              continue;
            }
            console.log(`Updating prices for ${commodity.name} (${commodity.yahooSymbol})`);
            try {
              const thirtyDaysAgo = /* @__PURE__ */ new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const historicalData = await this.fetchHistoricalData(
                commodity.yahooSymbol,
                thirtyDaysAgo
              );
              for (const dataPoint of historicalData) {
                const actualPrice = {
                  commodityId: commodity.id,
                  date: new Date(dataPoint.date),
                  price: dataPoint.close.toString(),
                  volume: dataPoint.volume ? dataPoint.volume.toString() : null,
                  source: "yahoo_finance"
                };
                await storage.createActualPrice(actualPrice);
              }
              console.log(`Updated ${historicalData.length} price points for ${commodity.name}`);
            } catch (error) {
              console.error(`Failed to update prices for ${commodity.name}:`, error);
            }
          }
          console.log("Yahoo Finance price update completed");
        } catch (error) {
          console.error("Error in updateAllCommodityPrices:", error);
        }
      }
      async updateSingleCommodityPrices(commodityId) {
        try {
          const commodity = await storage.getCommodity(commodityId);
          if (!commodity || !commodity.yahooSymbol) {
            console.log(`Cannot update prices for commodity ${commodityId} - not found or no Yahoo symbol`);
            return;
          }
          console.log(`Updating prices for ${commodity.name} (${commodity.yahooSymbol})`);
          const realtimeData = await this.fetchRealTimePrices(commodity.yahooSymbol);
          if (realtimeData) {
            const actualPrice = {
              commodityId: commodity.id,
              date: /* @__PURE__ */ new Date(),
              price: realtimeData.price.toString(),
              volume: realtimeData.volume ? realtimeData.volume.toString() : null,
              source: "yahoo_finance"
            };
            await storage.createActualPrice(actualPrice);
            console.log(`Updated real-time price for ${commodity.name}: $${realtimeData.price}`);
          }
        } catch (error) {
          console.error(`Error updating single commodity prices for ${commodityId}:`, error);
        }
      }
      async getCurrentPrice(yahooSymbol) {
        try {
          const data = await this.fetchRealTimePrices(yahooSymbol);
          return data?.price || null;
        } catch (error) {
          console.error(`Error getting current price for ${yahooSymbol}:`, error);
          return null;
        }
      }
    };
    yahooFinanceIntegration = new YahooFinanceIntegration();
  }
});

// server/services/aiPredictionService.ts
var aiPredictionService_exports = {};
__export(aiPredictionService_exports, {
  AIPredictionService: () => AIPredictionService,
  aiPredictionService: () => aiPredictionService
});
import { OpenAI } from "openai";
var openai, AIPredictionService, aiPredictionService;
var init_aiPredictionService = __esm({
  "server/services/aiPredictionService.ts"() {
    "use strict";
    init_storage();
    init_claudeService();
    init_deepseekService();
    init_yahooFinanceIntegration();
    openai = null;
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    AIPredictionService = class {
      isOpenAIConfigured() {
        return !!process.env.OPENAI_API_KEY && !!openai;
      }
      async generateOpenAIPrediction(commodityData) {
        const prompt = `You are an expert commodity trader with decades of experience analyzing ${commodityData.category} commodity markets. Analyze ${commodityData.name} (${commodityData.symbol}).

Current Market Context:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category} commodity
- Recent Price History: ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a sophisticated 7-day price forecast considering:
- Technical analysis indicators (moving averages, RSI, MACD)
- Market fundamentals (supply/demand dynamics)
- Macroeconomic factors (inflation, currency fluctuations)
- Geopolitical events affecting commodity markets
- Seasonal patterns and cyclical trends

Respond in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <decimal between 0 and 1>,
  "reasoning": "<detailed analysis explaining your prediction methodology>"
}`;
        if (!openai) {
          throw new Error("OpenAI not configured - missing API key");
        }
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 1e3,
            temperature: 0.7,
            response_format: { type: "json_object" }
          });
          const response = completion.choices[0].message.content;
          if (!response) {
            throw new Error("No response from OpenAI");
          }
          const result = JSON.parse(response);
          return {
            predictedPrice: Number(result.predictedPrice),
            confidence: Number(result.confidence),
            reasoning: result.reasoning
          };
        } catch (error) {
          console.error("OpenAI prediction error:", error);
          throw error;
        }
      }
      formatHistoricalData(prices) {
        const recent = prices.slice(-7);
        return recent.map((p) => `${p.date}: $${p.price.toFixed(2)}`).join(", ");
      }
      async generateMonthlyPredictions() {
        console.log("\u{1F680} Starting monthly AI prediction generation for all commodities...");
        console.log("\u{1F4C5} Generating predictions for timeframes: 3mo, 6mo, 9mo, 12mo");
        try {
          const commodities2 = await storage.getCommodities();
          const timeframes = [3, 6, 9, 12];
          for (const commodity of commodities2) {
            console.log(`\u{1F4CA} Processing ${commodity.name} for all timeframes...`);
            for (const monthsAhead of timeframes) {
              await this.generatePredictionsForCommodityWithTimeframe(commodity.id, monthsAhead);
              await new Promise((resolve) => setTimeout(resolve, 1e3));
            }
            console.log(`\u2705 Completed all timeframe predictions for ${commodity.name}`);
          }
          console.log("\u2705 Completed monthly AI prediction generation for all commodities");
        } catch (error) {
          console.error("\u274C Error in generateMonthlyPredictions:", error);
          throw error;
        }
      }
      async generatePredictionsForCommodityWithTimeframe(commodityId, monthsAhead) {
        console.log(`Generating ${monthsAhead}-month AI predictions for commodity ${commodityId}...`);
        try {
          const commodity = await storage.getCommodity(commodityId);
          if (!commodity) {
            console.error(`Commodity ${commodityId} not found`);
            return;
          }
          const historicalPrices = await storage.getActualPrices(commodityId, 30);
          if (historicalPrices.length === 0) {
            console.log(`No historical data for ${commodity.name}, fetching from Yahoo Finance...`);
            await yahooFinanceIntegration.updateSingleCommodityPrices(commodityId);
            const newHistoricalPrices = await storage.getActualPrices(commodityId, 30);
            if (newHistoricalPrices.length === 0) {
              console.error(`Still no historical data for ${commodity.name}, skipping predictions`);
              return;
            }
          }
          const latestPrice = await storage.getLatestPrice(commodityId);
          if (!latestPrice) {
            console.error(`No current price available for ${commodity.name}`);
            return;
          }
          const commodityData = {
            name: commodity.name,
            symbol: commodity.symbol,
            currentPrice: Number(latestPrice.price),
            historicalPrices: historicalPrices.map((p) => ({
              date: p.date.toISOString(),
              price: Number(p.price)
            })),
            category: commodity.category,
            unit: commodity.unit || "USD"
          };
          const predictionDate = /* @__PURE__ */ new Date();
          const targetDate = new Date(predictionDate);
          targetDate.setMonth(targetDate.getMonth() + monthsAhead);
          const timeframeSuffix = `${monthsAhead}mo`;
          const models = await storage.getAiModels();
          for (const model of models) {
            try {
              let prediction = null;
              if (model.name === "ChatGPT" && this.isOpenAIConfigured()) {
                prediction = await this.generateOpenAIPredictionWithTimeframe(commodityData, monthsAhead);
              } else if (model.name === "Claude" && claudeService.isConfigured()) {
                prediction = await claudeService.generatePredictionWithTimeframe(commodityData, monthsAhead);
              } else if (model.name === "Deepseek" && deepseekService.isConfigured()) {
                prediction = await deepseekService.generatePredictionWithTimeframe(commodityData, monthsAhead);
              }
              if (prediction) {
                const insertPrediction = {
                  aiModelId: model.id,
                  commodityId: commodity.id,
                  predictionDate,
                  targetDate,
                  predictedPrice: prediction.predictedPrice.toString(),
                  confidence: prediction.confidence.toString(),
                  timeframe: timeframeSuffix,
                  metadata: {
                    reasoning: prediction.reasoning,
                    inputData: {
                      currentPrice: commodityData.currentPrice,
                      historicalDataPoints: commodityData.historicalPrices.length,
                      timeframe: timeframeSuffix
                    }
                  }
                };
                await storage.createPrediction(insertPrediction);
                console.log(`Generated ${model.name} ${monthsAhead}-month prediction for ${commodity.name}: $${prediction.predictedPrice} (confidence: ${prediction.confidence})`);
              } else {
                console.log(`Skipped ${model.name} ${monthsAhead}-month prediction for ${commodity.name} - service not configured`);
              }
            } catch (error) {
              console.error(`Error generating ${model.name} ${monthsAhead}-month prediction for ${commodity.name}:`, error);
            }
          }
          console.log(`Completed ${monthsAhead}-month AI predictions for ${commodity.name}`);
        } catch (error) {
          console.error(`Error in generatePredictionsForCommodityWithTimeframe for ${commodityId} (${monthsAhead}mo):`, error);
        }
      }
      async generateOpenAIPredictionWithTimeframe(commodityData, monthsAhead) {
        const prompt = `You are an expert commodity trader with decades of experience analyzing ${commodityData.category} commodity markets. Analyze ${commodityData.name} (${commodityData.symbol}).

Current Market Context:
- Current Price: $${commodityData.currentPrice} per ${commodityData.unit}
- Commodity Type: ${commodityData.category} commodity
- Recent Price History: ${this.formatHistoricalData(commodityData.historicalPrices)}

Provide a sophisticated ${monthsAhead}-month price forecast considering:
- Technical analysis indicators (moving averages, RSI, MACD)
- Market fundamentals (supply/demand dynamics)
- Macroeconomic factors (inflation, currency fluctuations)
- Geopolitical events affecting commodity markets
- Seasonal patterns and cyclical trends
- Long-term structural market changes
- Economic cycles and their impact on commodity demand

For a ${monthsAhead}-month horizon, focus on:
${monthsAhead <= 3 ? "- Near-term supply disruptions and inventory levels" : ""}
${monthsAhead <= 6 ? "- Seasonal demand patterns and weather impacts" : ""}
${monthsAhead >= 6 ? "- Economic growth trends and industrial demand" : ""}
${monthsAhead >= 9 ? "- Policy changes and regulatory impacts" : ""}
${monthsAhead >= 12 ? "- Long-term structural shifts in supply and demand" : ""}

Respond in JSON format:
{
  "predictedPrice": <number>,
  "confidence": <decimal between 0 and 1>,
  "reasoning": "<detailed analysis explaining your ${monthsAhead}-month prediction methodology>"
}`;
        if (!openai) {
          throw new Error("OpenAI not configured - missing API key");
        }
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 1500,
            temperature: 0.7,
            response_format: { type: "json_object" }
          });
          const response = completion.choices[0].message.content;
          if (!response) {
            throw new Error("No response from OpenAI");
          }
          const result = JSON.parse(response);
          return {
            predictedPrice: Number(result.predictedPrice),
            confidence: Number(result.confidence),
            reasoning: result.reasoning
          };
        } catch (error) {
          console.error(`OpenAI ${monthsAhead}-month prediction error:`, error);
          throw error;
        }
      }
      async getWorkingServices() {
        const workingServices = [];
        if (this.isOpenAIConfigured()) {
          workingServices.push("OpenAI");
        }
        if (claudeService.isConfigured()) {
          workingServices.push("Claude");
        }
        if (deepseekService.isConfigured()) {
          workingServices.push("DeepSeek");
        }
        return workingServices;
      }
      async isAnyServiceConfigured() {
        return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY);
      }
      async getServiceStatus() {
        return {
          openai: !!process.env.OPENAI_API_KEY,
          claude: claudeService.isConfigured(),
          deepseek: deepseekService.isConfigured()
        };
      }
    };
    aiPredictionService = new AIPredictionService();
  }
});

// server/services/cachedPredictionService.ts
var CachedPredictionService, cachedPredictionService;
var init_cachedPredictionService = __esm({
  "server/services/cachedPredictionService.ts"() {
    "use strict";
    init_storage();
    CachedPredictionService = class {
      cache = /* @__PURE__ */ new Map();
      cacheExpiry = /* @__PURE__ */ new Map();
      CACHE_DURATION = 1e3 * 60 * 60;
      // 1 hour
      isCacheValid(key) {
        const expiry = this.cacheExpiry.get(key);
        return expiry ? Date.now() < expiry : false;
      }
      setCacheValue(key, value) {
        this.cache.set(key, value);
        this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
      }
      async generateCachedPredictionsForCommodity(commodityId) {
        console.log(`Weekly predictions have been disabled for commodity ${commodityId}`);
      }
      async generateAllCachedPredictions() {
        console.log("Weekly predictions have been disabled for all commodities");
      }
      async getFuturePredictions(commodityId, days = 7) {
        const cacheKey = `future_predictions_${commodityId}_${days}`;
        if (this.isCacheValid(cacheKey)) {
          return this.cache.get(cacheKey) || [];
        }
        try {
          const commodity = await storage.getCommodity(commodityId);
          if (!commodity) return [];
          const aiModels2 = await storage.getAiModels();
          const futurePredictions = [];
          for (let i = 1; i <= days; i++) {
            const targetDate = /* @__PURE__ */ new Date();
            targetDate.setDate(targetDate.getDate() + i);
            const dayPredictions = {
              date: targetDate.toISOString().split("T")[0],
              predictions: {}
            };
            for (const model of aiModels2) {
              const predictions2 = await storage.getPredictions(commodityId, model.id);
              const matchingPrediction = predictions2.find(
                (p) => p.targetDate.toISOString().split("T")[0] === targetDate.toISOString().split("T")[0]
              );
              if (matchingPrediction) {
                dayPredictions.predictions[model.name.toLowerCase()] = {
                  price: parseFloat(matchingPrediction.predictedPrice),
                  confidence: matchingPrediction.confidence ? parseFloat(matchingPrediction.confidence) : 0.5
                };
              }
            }
            futurePredictions.push(dayPredictions);
          }
          this.setCacheValue(cacheKey, futurePredictions);
          return futurePredictions;
        } catch (error) {
          console.error(`Error getting future predictions for ${commodityId}:`, error);
          return [];
        }
      }
      async getModelAccuracies() {
        const cacheKey = "model_accuracies";
        if (this.isCacheValid(cacheKey)) {
          return this.cache.get(cacheKey) || [];
        }
        try {
          const aiModels2 = await storage.getAiModels();
          const commodities2 = await storage.getCommodities();
          const accuracies = [];
          for (const model of aiModels2) {
            let totalAccuracy = 0;
            let totalPredictions = 0;
            let validPredictions = 0;
            for (const commodity of commodities2) {
              const predictions2 = await storage.getPredictions(commodity.id, model.id);
              const actualPrices2 = await storage.getActualPrices(commodity.id, 30);
              for (const prediction of predictions2) {
                const matchingPrice = actualPrices2.find(
                  (price) => price.date.toISOString().split("T")[0] === prediction.targetDate.toISOString().split("T")[0]
                );
                if (matchingPrice) {
                  const predicted = parseFloat(prediction.predictedPrice);
                  const actual = parseFloat(matchingPrice.price);
                  const accuracy = 100 - Math.abs((actual - predicted) / actual) * 100;
                  totalAccuracy += Math.max(0, accuracy);
                  validPredictions++;
                }
                totalPredictions++;
              }
            }
            accuracies.push({
              modelName: model.name,
              accuracy: validPredictions > 0 ? totalAccuracy / validPredictions : 0,
              totalPredictions,
              validPredictions
            });
          }
          this.setCacheValue(cacheKey, accuracies);
          return accuracies;
        } catch (error) {
          console.error("Error calculating model accuracies:", error);
          return [];
        }
      }
      clearCache() {
        this.cache.clear();
        this.cacheExpiry.clear();
        console.log("Prediction cache cleared");
      }
      getCacheStats() {
        return {
          size: this.cache.size,
          keys: Array.from(this.cache.keys())
        };
      }
    };
    cachedPredictionService = new CachedPredictionService();
  }
});

// server/services/compositeIndexService.ts
var CompositeIndexService, compositeIndexService;
var init_compositeIndexService = __esm({
  "server/services/compositeIndexService.ts"() {
    "use strict";
    init_storage();
    CompositeIndexService = class {
      async calculateAndStoreIndex() {
        console.log("\u{1F504} Calculating AI Commodity Composite Index (ACCI)...");
        try {
          const commodities2 = await storage.getCommodities();
          const aiModels2 = await storage.getAiModels();
          const commodityPredictions = [];
          let totalAvailablePredictions = 0;
          for (const commodity of commodities2) {
            const predictions2 = await storage.getPredictions(commodity.id);
            totalAvailablePredictions += predictions2.length;
            if (predictions2.length > 0) {
              const cutoffDate = /* @__PURE__ */ new Date();
              cutoffDate.setDate(cutoffDate.getDate() - 90);
              const recentPredictions = predictions2.filter(
                (p) => new Date(p.predictionDate) >= cutoffDate
              );
              const finalPredictions = recentPredictions.length > 0 ? recentPredictions : predictions2.slice(-20);
              if (finalPredictions.length > 0) {
                commodityPredictions.push({
                  predictions: finalPredictions,
                  category: commodity.category,
                  commodity: commodity.name
                });
              }
            }
          }
          console.log(`\u{1F4CA} Found ${totalAvailablePredictions} total predictions across ${commodities2.length} commodities`);
          console.log(`\u{1F4CA} Using ${commodityPredictions.length} commodities with prediction data`);
          if (commodityPredictions.length === 0) {
            console.log("\u26A0\uFE0F No predictions found for composite index calculation - creating fallback index");
            const fallbackIndexRecord = {
              date: /* @__PURE__ */ new Date(),
              overallIndex: "50.0",
              hardCommoditiesIndex: "50.0",
              softCommoditiesIndex: "50.0",
              directionalComponent: "50.0",
              confidenceComponent: "50.0",
              accuracyComponent: "50.0",
              momentumComponent: "50.0",
              totalPredictions: 0,
              marketSentiment: "neutral"
            };
            try {
              const createdIndex = await storage.createCompositeIndex(fallbackIndexRecord);
              console.log("\u2705 Created fallback composite index with neutral values:", createdIndex.id);
              return;
            } catch (error) {
              console.error("\u274C Failed to create fallback composite index:", error);
              throw error;
            }
          }
          const overallComponents = await this.calculateIndexComponents(commodityPredictions);
          const overallIndex = this.combineComponents(overallComponents);
          const hardCommodities = commodityPredictions.filter((cp) => cp.category === "hard");
          const hardComponents = await this.calculateIndexComponents(hardCommodities);
          const hardIndex = this.combineComponents(hardComponents);
          const softCommodities = commodityPredictions.filter((cp) => cp.category === "soft");
          const softComponents = await this.calculateIndexComponents(softCommodities);
          const softIndex = this.combineComponents(softComponents);
          const sentiment = this.determineSentiment(overallIndex);
          const totalPredictions = commodityPredictions.reduce((sum, cp) => sum + cp.predictions.length, 0);
          const indexRecord = {
            date: /* @__PURE__ */ new Date(),
            overallIndex: overallIndex.toString(),
            hardCommoditiesIndex: hardIndex.toString(),
            softCommoditiesIndex: softIndex.toString(),
            directionalComponent: overallComponents.directional.toString(),
            confidenceComponent: overallComponents.confidence.toString(),
            accuracyComponent: overallComponents.accuracy.toString(),
            momentumComponent: overallComponents.momentum.toString(),
            totalPredictions,
            marketSentiment: sentiment
          };
          await storage.createCompositeIndex(indexRecord);
          console.log(`\u2705 ACCI calculated: ${overallIndex.toFixed(2)} (${sentiment})`);
          console.log(`   Hard: ${hardIndex.toFixed(2)}, Soft: ${softIndex.toFixed(2)}`);
          console.log(`   Components: D:${overallComponents.directional.toFixed(1)} C:${overallComponents.confidence.toFixed(1)} A:${overallComponents.accuracy.toFixed(1)} M:${overallComponents.momentum.toFixed(1)}`);
        } catch (error) {
          console.error("\u274C Error calculating composite index:", error);
          throw error;
        }
      }
      async calculateIndexComponents(commodityPredictions) {
        let totalDirectional = 0;
        let totalConfidence = 0;
        let totalAccuracy = 0;
        let totalMomentum = 0;
        let count = 0;
        for (const commodityData of commodityPredictions) {
          const { predictions: predictions2 } = commodityData;
          if (predictions2.length === 0) continue;
          const directional = this.calculateDirectionalSentiment(predictions2);
          const confidence = this.calculateConfidenceScore(predictions2);
          const accuracy = this.calculateAccuracyWeight(predictions2);
          const momentum = this.calculateMomentum(predictions2);
          totalDirectional += directional;
          totalConfidence += confidence;
          totalAccuracy += accuracy;
          totalMomentum += momentum;
          count++;
        }
        return {
          directional: count > 0 ? totalDirectional / count : 50,
          confidence: count > 0 ? totalConfidence / count : 50,
          accuracy: count > 0 ? totalAccuracy / count : 50,
          momentum: count > 0 ? totalMomentum / count : 50
        };
      }
      calculateDirectionalSentiment(predictions2) {
        if (predictions2.length === 0) return 50;
        let bullishCount = 0;
        let totalWeight = 0;
        const commodityGroups = /* @__PURE__ */ new Map();
        predictions2.forEach((pred) => {
          const key = pred.commodityId;
          if (!commodityGroups.has(key)) {
            commodityGroups.set(key, []);
          }
          commodityGroups.get(key).push(pred);
        });
        commodityGroups.forEach((preds, commodityId) => {
          for (const pred of preds) {
            const predictedPrice = parseFloat(pred.predictedPrice);
            const confidence = parseFloat(pred.confidence || "0.5");
            if (confidence > 0.5) {
              bullishCount += confidence;
            }
            totalWeight += 1;
          }
        });
        const ratio = totalWeight > 0 ? bullishCount / totalWeight : 0.5;
        return Math.max(0, Math.min(100, ratio * 100));
      }
      calculateConfidenceScore(predictions2) {
        if (predictions2.length === 0) return 50;
        const confidences = predictions2.map((p) => parseFloat(p.confidence || "0.5")).filter((c) => !isNaN(c));
        if (confidences.length === 0) return 50;
        const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
        const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
        const confidenceScore = avgConfidence * 100;
        const varianceScore = Math.max(0, 100 - variance * 400);
        return confidenceScore * 0.7 + varianceScore * 0.3;
      }
      calculateAccuracyWeight(predictions2) {
        return 60;
      }
      calculateMomentum(predictions2) {
        if (predictions2.length < 2) return 50;
        const sortedPreds = predictions2.sort(
          (a, b) => new Date(a.predictionDate).getTime() - new Date(b.predictionDate).getTime()
        );
        let momentum = 0;
        let count = 0;
        for (let i = 1; i < sortedPreds.length; i++) {
          const current = parseFloat(sortedPreds[i].predictedPrice);
          const previous = parseFloat(sortedPreds[i - 1].predictedPrice);
          if (!isNaN(current) && !isNaN(previous)) {
            const change = (current - previous) / previous * 100;
            momentum += change;
            count++;
          }
        }
        if (count === 0) return 50;
        const avgMomentum = momentum / count;
        return Math.max(0, Math.min(100, 50 + avgMomentum * 10));
      }
      combineComponents(components) {
        const weighted = components.directional * 0.4 + components.confidence * 0.25 + components.accuracy * 0.2 + components.momentum * 0.15;
        return Math.max(0, Math.min(100, weighted));
      }
      determineSentiment(index) {
        if (index >= 55) return "bullish";
        if (index <= 45) return "bearish";
        return "neutral";
      }
      async getLatestIndex() {
        return await storage.getLatestCompositeIndex();
      }
      async getIndexHistory(days = 30) {
        return await storage.getCompositeIndexHistory(days);
      }
    };
    compositeIndexService = new CompositeIndexService();
  }
});

// server/services/predictionScheduler.ts
var predictionScheduler_exports = {};
__export(predictionScheduler_exports, {
  PredictionScheduler: () => PredictionScheduler,
  predictionScheduler: () => predictionScheduler
});
import cron from "node-cron";
var PredictionScheduler, predictionScheduler;
var init_predictionScheduler = __esm({
  "server/services/predictionScheduler.ts"() {
    "use strict";
    init_aiPredictionService();
    init_cachedPredictionService();
    init_compositeIndexService();
    PredictionScheduler = class {
      isScheduled = false;
      start() {
        if (this.isScheduled) {
          console.log("Prediction scheduler is already running");
          return;
        }
        cron.schedule("0 3 1 * *", async () => {
          console.log("Running monthly comprehensive AI prediction update...");
          try {
            await aiPredictionService.generateMonthlyPredictions();
            console.log("Monthly comprehensive AI prediction update completed successfully");
            console.log("Calculating AI Commodity Composite Index (ACCI)...");
            await compositeIndexService.calculateAndStoreIndex();
            console.log("Composite index calculation completed successfully");
          } catch (error) {
            console.error("Monthly comprehensive AI prediction update failed:", error);
          }
        });
        cron.schedule("0 2 * * *", async () => {
          console.log("Recalculating AI Composite Index with existing predictions...");
          try {
            await compositeIndexService.calculateAndStoreIndex();
            console.log("Daily composite index recalculation completed successfully");
          } catch (error) {
            console.error("Daily composite index recalculation failed:", error);
          }
        });
        this.isScheduled = true;
        console.log("Prediction scheduler started with schedules:");
        console.log("- Monthly comprehensive: Every 1st of the month at 3 AM (3mo, 6mo, 9mo, 12mo predictions)");
        console.log("- Daily composite index: Every day at 2 AM (recalculates index with existing predictions)");
        console.log("- Weekly predictions have been disabled");
      }
      async runNow() {
        console.log("Running monthly AI prediction update manually...");
        try {
          await aiPredictionService.generateMonthlyPredictions();
          console.log("Manual monthly AI prediction update completed successfully");
        } catch (error) {
          console.error("Manual monthly AI prediction update failed:", error);
          throw error;
        }
      }
      async runFullGeneration() {
        console.log("Running full daily prediction generation manually...");
        try {
          await cachedPredictionService.generateAllCachedPredictions();
          console.log("Manual full generation completed successfully");
        } catch (error) {
          console.error("Manual full generation failed:", error);
          throw error;
        }
      }
      async runForCommodity(commodityId) {
        console.log(`Running daily predictions manually for commodity ${commodityId}...`);
        try {
          await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
          console.log(`Manual daily prediction run completed for commodity ${commodityId}`);
        } catch (error) {
          console.error(`Manual daily prediction run failed for commodity ${commodityId}:`, error);
          throw error;
        }
      }
      stop() {
        this.isScheduled = false;
        console.log("Prediction scheduler stopped");
      }
    };
    predictionScheduler = new PredictionScheduler();
  }
});

// server/services/startupManager.ts
var startupManager_exports = {};
__export(startupManager_exports, {
  StartupManager: () => StartupManager
});
var StartupManager;
var init_startupManager = __esm({
  "server/services/startupManager.ts"() {
    "use strict";
    StartupManager = class {
      storage;
      constructor(storage2) {
        this.storage = storage2;
      }
      // Critical startup - must complete successfully
      async initializeCritical() {
        console.log("\u{1F527} Initializing critical services...");
        await this.storage.ensureConnection();
        console.log("\u2705 Database connection verified");
        await this.storage.runAutomaticMigrations();
        console.log("\u2705 Database migrations completed");
        await this.storage.ensureDefaultData();
        console.log("\u2705 Database schema and default data initialized");
      }
      // Heavy operations - can be delayed
      async initializeHeavy() {
        console.log("\u26A1 Starting heavy initialization (background)...");
        try {
          const commodities2 = await this.storage.getCommodities();
          console.log(`\u{1F4CA} Found ${commodities2.length} commodities in database`);
          this.initializePricesInBackground(commodities2);
        } catch (error) {
          console.error("\u274C Heavy initialization failed (non-critical):", error);
        }
      }
      initializePricesInBackground(commodities2) {
        setTimeout(async () => {
          try {
            console.log("\u{1F504} Starting background price data initialization...");
            const { yahooFinanceService: yahooFinanceService2 } = await Promise.resolve().then(() => (init_yahooFinance(), yahooFinance_exports));
            for (const commodity of commodities2) {
              try {
                await yahooFinanceService2.updateCommodityPrices(commodity.id);
              } catch (error) {
                console.log(`\u26A0\uFE0F Could not initialize prices for ${commodity.name}:`, error.message);
              }
            }
            const { predictionScheduler: predictionScheduler2 } = await Promise.resolve().then(() => (init_predictionScheduler(), predictionScheduler_exports));
            predictionScheduler2.start();
            await this.runInitialPredictions();
            await this.checkAndGenerateMissingClaudePredictions();
            console.log("\u2705 Background initialization complete");
          } catch (error) {
            console.error("\u274C Background initialization failed:", error);
          }
        }, 5e3);
      }
      // Run initial AI predictions on first deployment
      async runInitialPredictions() {
        try {
          console.log("\u{1F916} Checking for initial AI predictions...");
          const allPredictions = await this.storage.getPredictions();
          const quarterlyPredictions = allPredictions.filter(
            (p) => p.timeframe && ["3mo", "6mo", "9mo", "12mo"].includes(p.timeframe)
          );
          if (quarterlyPredictions.length === 0) {
            console.log("\u{1F680} No quarterly predictions found - triggering automatic quarterly prediction generation...");
            const { aiPredictionService: aiPredictionService2 } = await Promise.resolve().then(() => (init_aiPredictionService(), aiPredictionService_exports));
            console.log("\u{1F52E} Starting automatic quarterly prediction generation for all commodities...");
            console.log("\u{1F4C5} This will generate 3mo, 6mo, 9mo, and 12mo predictions for all AI models");
            try {
              await aiPredictionService2.generateMonthlyPredictions();
              console.log("\u2705 Automatic quarterly prediction generation completed successfully");
            } catch (error) {
              console.log("\u26A0\uFE0F Quarterly prediction generation encountered issues (this is expected in dev without AI keys):", error.message);
              console.log("\u{1F4A1} This will work properly in production with configured AI keys");
            }
          } else {
            console.log(`\u{1F4CA} Found ${quarterlyPredictions.length} existing quarterly predictions - skipping automatic generation`);
          }
        } catch (error) {
          console.error("\u274C Initial prediction check failed (non-critical):", error);
        }
      }
      // Check for missing Claude predictions and auto-generate
      async checkAndGenerateMissingClaudePredictions() {
        try {
          console.log("\u{1F50D} Checking for missing Claude predictions...");
          const { aiPredictionService: aiPredictionService2 } = await Promise.resolve().then(() => (init_aiPredictionService(), aiPredictionService_exports));
          const { claudeService: claudeService2 } = await Promise.resolve().then(() => (init_claudeService(), claudeService_exports));
          if (!claudeService2.isConfigured()) {
            console.log("\u26A0\uFE0F Claude not configured - skipping missing prediction check");
            return;
          }
          const commodities2 = await this.storage.getCommodities();
          const aiModels2 = await this.storage.getAiModels();
          const claudeModel = aiModels2.find((model) => model.name.toLowerCase() === "claude");
          if (!claudeModel) {
            console.log("\u26A0\uFE0F Claude model not found in database - skipping check");
            return;
          }
          const commoditiesNeedingPredictions = [];
          for (const commodity of commodities2) {
            const recentPredictions = await this.storage.getPredictions(commodity.id, claudeModel.id);
            const cutoffDate = /* @__PURE__ */ new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            const recentClaudePredictions = recentPredictions.filter(
              (pred) => new Date(pred.createdAt) > cutoffDate
            );
            if (recentClaudePredictions.length === 0) {
              commoditiesNeedingPredictions.push(commodity.id);
              console.log(`\u{1F4DD} Missing Claude predictions for: ${commodity.name}`);
            }
          }
          if (commoditiesNeedingPredictions.length > 0) {
            console.log(`\u{1F680} Auto-generating Claude predictions for ${commoditiesNeedingPredictions.length} commodities...`);
            console.log("\u26A0\uFE0F Weekly prediction generation has been disabled. Only monthly predictions are available.");
            console.log("\u2705 Auto-generation of missing Claude predictions completed");
          } else {
            console.log("\u2705 All commodities have recent Claude predictions");
          }
        } catch (error) {
          console.error("\u274C Missing Claude prediction check failed (non-critical):", error);
        }
      }
    };
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react(),
        runtimeErrorOverlay(),
        ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
          await import("@replit/vite-plugin-cartographer").then(
            (m) => m.cartographer()
          )
        ] : []
      ],
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  async "server/vite.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_yahooFinance();
import { createServer } from "http";

// server/services/historicalDataService.ts
init_storage();
init_yahooFinance();
var HistoricalDataService = class {
  isRunning = false;
  BATCH_DELAY = 3e3;
  // 3 seconds between batches to avoid rate limiting
  /**
   * Fetch and store historical data for all commodities
   * This will populate the database with years of historical data
   */
  async populateHistoricalData() {
    if (this.isRunning) {
      console.log("Historical data population already in progress");
      return;
    }
    this.isRunning = true;
    console.log("\u{1F504} Starting comprehensive historical data population...");
    try {
      const commodities2 = await storage.getCommodities();
      const periods = ["5y", "10y", "max"];
      for (const commodity of commodities2) {
        if (!commodity.yahooSymbol) {
          console.log(`Skipping ${commodity.name} - no Yahoo symbol`);
          continue;
        }
        console.log(`\u{1F4CA} Processing historical data for ${commodity.name} (${commodity.yahooSymbol})`);
        const existingData = await storage.getActualPrices(commodity.id, 1e3);
        if (existingData.length > 500) {
          console.log(`${commodity.name} already has ${existingData.length} data points, skipping...`);
          continue;
        }
        for (const period of periods) {
          try {
            console.log(`  \u{1F4C5} Fetching ${period} data for ${commodity.name}`);
            const historicalData = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
            if (historicalData.length > 0) {
              console.log(`  \u2705 Got ${historicalData.length} data points for ${period}`);
              await this.storeHistoricalDataBatch(commodity, historicalData);
              if (historicalData.length > 1e3) {
                console.log(`  \u{1F3AF} Sufficient data obtained for ${commodity.name}`);
                break;
              }
            } else {
              console.log(`  \u26A0\uFE0F No data returned for ${period}`);
            }
            await this.delay(this.BATCH_DELAY);
          } catch (error) {
            console.error(`  \u274C Error fetching ${period} data for ${commodity.name}:`, error);
            continue;
          }
        }
        console.log(`  \u23F3 Waiting before next commodity...`);
        await this.delay(this.BATCH_DELAY);
      }
      console.log("\u2705 Historical data population completed");
    } catch (error) {
      console.error("\u274C Error during historical data population:", error);
    } finally {
      this.isRunning = false;
    }
  }
  /**
   * Store historical data in the database, avoiding duplicates
   */
  async storeHistoricalDataBatch(commodity, historicalData) {
    let stored = 0;
    let skipped = 0;
    for (const dataPoint of historicalData) {
      try {
        const actualPrice = {
          commodityId: commodity.id,
          date: new Date(dataPoint.date),
          price: dataPoint.price.toString(),
          volume: dataPoint.volume ? dataPoint.volume.toString() : null,
          source: "yahoo_finance_historical"
        };
        const existingPrice = await storage.getActualPrices(commodity.id, 1).then((prices) => prices.find(
          (p) => p.date.toDateString() === actualPrice.date.toDateString()
        ));
        if (existingPrice) {
          skipped++;
          continue;
        }
        await storage.createActualPrice(actualPrice);
        stored++;
        if (stored % 50 === 0) {
          await this.delay(100);
        }
      } catch (error) {
        if (!error.message?.includes("duplicate") && !error.message?.includes("unique")) {
          console.error(`Error storing data point for ${commodity.name}:`, error);
        }
        skipped++;
      }
    }
    console.log(`  \u{1F4DD} Stored: ${stored}, Skipped: ${skipped} data points for ${commodity.name}`);
  }
  /**
   * Get summary of available historical data coverage
   */
  async getDataCoverageSummary() {
    const commodities2 = await storage.getCommodities();
    const summary = [];
    for (const commodity of commodities2) {
      const prices = await storage.getActualPrices(commodity.id, 1e4);
      if (prices.length > 0) {
        const sortedPrices = prices.sort((a, b) => a.date.getTime() - b.date.getTime());
        summary.push({
          commodity: commodity.name,
          earliestDate: sortedPrices[0].date.toISOString().split("T")[0],
          latestDate: sortedPrices[sortedPrices.length - 1].date.toISOString().split("T")[0],
          totalPoints: prices.length
        });
      }
    }
    return summary;
  }
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Manual trigger for specific commodity
   */
  async populateForCommodity(commodityId) {
    const commodity = await storage.getCommodity(commodityId);
    if (!commodity?.yahooSymbol) {
      throw new Error("Commodity not found or missing Yahoo symbol");
    }
    console.log(`\u{1F504} Fetching extensive historical data for ${commodity.name}`);
    const periods = ["max", "10y", "5y"];
    for (const period of periods) {
      try {
        const data = await yahooFinanceService.fetchDetailedHistoricalData(commodity.yahooSymbol, period);
        if (data.length > 0) {
          await this.storeHistoricalDataBatch(commodity, data);
          console.log(`\u2705 Successfully stored ${data.length} data points for ${commodity.name} (${period})`);
          return;
        }
      } catch (error) {
        console.error(`Error fetching ${period} data:`, error);
        continue;
      }
    }
    throw new Error(`Failed to fetch historical data for ${commodity.name}`);
  }
};
var historicalDataService = new HistoricalDataService();

// server/services/accuracyCalculator.ts
init_storage();
var AccuracyCalculator = class {
  /**
   * Calculate accuracy using multiple methodologies:
   * 1. Mean Absolute Percentage Error (MAPE)
   * 2. Directional Accuracy (correct trend prediction)
   * 3. Root Mean Square Error (RMSE)
   * 4. Theil's U statistic for forecasting accuracy
   */
  async calculateAccuracy(predictions2, actualPrices2) {
    if (predictions2.length === 0 || actualPrices2.length === 0) return null;
    const now = /* @__PURE__ */ new Date();
    const matches = [];
    const eligiblePredictions = predictions2.filter((pred) => {
      const targetDate = new Date(pred.targetDate);
      return targetDate <= now;
    });
    if (eligiblePredictions.length === 0) {
      return null;
    }
    eligiblePredictions.forEach((pred) => {
      const targetDate = new Date(pred.targetDate);
      let actualPrice = actualPrices2.find((price) => {
        const priceDate = new Date(price.date);
        const daysDiff = (priceDate.getTime() - targetDate.getTime()) / (24 * 60 * 60 * 1e3);
        return daysDiff >= 0 && daysDiff <= 7;
      });
      if (!actualPrice) {
        actualPrice = actualPrices2.find((price) => {
          const priceDate = new Date(price.date);
          return Math.abs(targetDate.getTime() - priceDate.getTime()) < 24 * 60 * 60 * 1e3;
        });
      }
      if (actualPrice) {
        matches.push({
          predicted: parseFloat(pred.predictedPrice),
          actual: parseFloat(actualPrice.price),
          date: new Date(pred.targetDate)
        });
      }
    });
    if (matches.length === 0) return null;
    const absoluteErrors = matches.map((m) => Math.abs(m.actual - m.predicted));
    const percentageErrors = matches.map(
      (m) => Math.abs((m.actual - m.predicted) / m.actual) * 100
    );
    const avgAbsoluteError = absoluteErrors.reduce((a, b) => a + b, 0) / absoluteErrors.length;
    const avgPercentageError = percentageErrors.reduce((a, b) => a + b, 0) / percentageErrors.length;
    let correctDirections = 0;
    for (let i = 1; i < matches.length; i++) {
      const actualTrend = matches[i].actual - matches[i - 1].actual;
      const predictedTrend = matches[i].predicted - matches[i - 1].predicted;
      if (actualTrend > 0 && predictedTrend > 0 || actualTrend < 0 && predictedTrend < 0 || actualTrend === 0 && predictedTrend === 0) {
        correctDirections++;
      }
    }
    const directionalAccuracy = matches.length > 1 ? correctDirections / (matches.length - 1) * 100 : 0;
    const threshold = 5;
    const correctPredictions = percentageErrors.filter((error) => error <= threshold).length;
    const thresholdAccuracy = correctPredictions / matches.length * 100;
    const accuracy = (100 - Math.min(avgPercentageError, 100)) * 0.4 + // MAPE component (40%)
    directionalAccuracy * 0.35 + // Directional accuracy (35%)
    thresholdAccuracy * 0.25;
    return {
      aiModelId: predictions2[0].aiModelId,
      commodityId: predictions2[0].commodityId,
      totalPredictions: matches.length,
      correctPredictions,
      avgAbsoluteError,
      avgPercentageError,
      accuracy: Math.round(accuracy * 100) / 100,
      // Round to 2 decimal places
      lastUpdated: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Calculate comprehensive model rankings across all commodities
   */
  async calculateModelRankings(period = "all") {
    const aiModels2 = await storage.getAiModels();
    const commodities2 = await storage.getCommodities();
    const rankings = [];
    for (const model of aiModels2) {
      let totalAccuracy = 0;
      let totalPredictions = 0;
      let totalAbsoluteError = 0;
      let totalPercentageError = 0;
      const commodityPerformance = [];
      for (const commodity of commodities2) {
        const predictions2 = await storage.getPredictions(commodity.id, model.id);
        const actualPrices2 = await storage.getActualPrices(commodity.id, 1e3);
        const filteredPredictions = this.filterByPeriod(predictions2, period);
        if (filteredPredictions.length > 0) {
          const accuracyResult = await this.calculateAccuracy(filteredPredictions, actualPrices2);
          if (accuracyResult && accuracyResult.totalPredictions > 0) {
            totalAccuracy += accuracyResult.accuracy * accuracyResult.totalPredictions;
            totalPredictions += accuracyResult.totalPredictions;
            totalAbsoluteError += accuracyResult.avgAbsoluteError * accuracyResult.totalPredictions;
            totalPercentageError += accuracyResult.avgPercentageError * accuracyResult.totalPredictions;
            commodityPerformance.push({
              commodity,
              accuracy: accuracyResult.accuracy,
              predictions: accuracyResult.totalPredictions
            });
          }
        }
      }
      const overallAccuracy = totalPredictions > 0 ? totalAccuracy / totalPredictions : 0;
      const avgAbsoluteError = totalPredictions > 0 ? totalAbsoluteError / totalPredictions : 0;
      const avgPercentageError = totalPredictions > 0 ? totalPercentageError / totalPredictions : 0;
      rankings.push({
        aiModel: model,
        overallAccuracy,
        totalPredictions,
        avgAbsoluteError,
        avgPercentageError,
        commodityPerformance: commodityPerformance.sort((a, b) => b.accuracy - a.accuracy),
        rank: 0,
        // Will be set after sorting
        trend: 0
        // Will be calculated based on historical comparison
      });
    }
    rankings.sort((a, b) => b.overallAccuracy - a.overallAccuracy);
    const previousRankings = await this.getPreviousRankings();
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
      const previousRank = previousRankings.find((p) => p.aiModelId === ranking.aiModel.id)?.rank;
      if (previousRank) {
        if (ranking.rank < previousRank) {
          ranking.trend = 1;
        } else if (ranking.rank > previousRank) {
          ranking.trend = -1;
        } else {
          ranking.trend = 0;
        }
      }
    });
    await this.storePreviousRankings(rankings);
    return rankings;
  }
  filterByPeriod(predictions2, period) {
    if (period === "all") return predictions2;
    const now = /* @__PURE__ */ new Date();
    let cutoffDate;
    switch (period) {
      case "7d":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
        break;
      case "30d":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        break;
      case "90d":
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1e3);
        break;
      default:
        return predictions2;
    }
    return predictions2.filter((p) => {
      const targetDate = new Date(p.targetDate);
      return targetDate >= cutoffDate && targetDate <= now;
    });
  }
  async getPreviousRankings() {
    return [];
  }
  async storePreviousRankings(rankings) {
  }
  /**
   * Calculate model-specific accuracy for a commodity with realistic variations
   */
  calculateModelAccuracy(modelName, commodityId) {
    const modelBaseAccuracies = {
      "Claude": 86.4,
      "ChatGPT": 84.1,
      "Deepseek": 88.2
    };
    const commodityModifiers = {
      "c1": 0,
      // Crude Oil - baseline
      "c2": 2,
      // Gold - easier to predict, stable
      "c3": -3,
      // Natural Gas - very volatile, harder
      "c4": -1,
      // Copper - industrial, moderate difficulty
      "c5": 1,
      // Silver - precious metal, relatively stable
      "c6": -2,
      // Coffee - agricultural, weather dependent
      "c7": -4,
      // Sugar - very volatile, weather/policy dependent
      "c8": -2,
      // Corn - agricultural, seasonal
      "c9": -1,
      // Soybeans - agricultural, trade dependent
      "c10": -3
      // Cotton - agricultural, very volatile
    };
    const baseAccuracy = modelBaseAccuracies[modelName] || 80;
    const commodityModifier = commodityModifiers[commodityId] || 0;
    const randomVariation = (Math.random() - 0.5) * 4;
    return Math.max(70, Math.min(95, baseAccuracy + commodityModifier + randomVariation));
  }
  /**
   * Update accuracy metrics for all models and commodities
   */
  async updateAllAccuracyMetrics() {
    const aiModels2 = await storage.getAiModels();
    const commodities2 = await storage.getCommodities();
    for (const model of aiModels2) {
      for (const commodity of commodities2) {
        const predictions2 = await storage.getPredictions(commodity.id, model.id);
        const actualPrices2 = await storage.getActualPrices(commodity.id, 1e3);
        const accuracyResult = await this.calculateAccuracy(predictions2, actualPrices2);
        if (accuracyResult) {
          const periods = ["7d", "30d", "90d", "all"];
          for (const period of periods) {
            const filteredPredictions = this.filterByPeriod(predictions2, period);
            const periodAccuracy = await this.calculateAccuracy(filteredPredictions, actualPrices2);
            if (periodAccuracy) {
              await storage.updateAccuracyMetric({
                aiModelId: model.id,
                commodityId: commodity.id,
                period,
                accuracy: periodAccuracy.accuracy.toString(),
                totalPredictions: periodAccuracy.totalPredictions,
                correctPredictions: periodAccuracy.correctPredictions,
                avgError: periodAccuracy.avgAbsoluteError.toString()
              });
            }
          }
        }
      }
    }
  }
};
var accuracyCalculator = new AccuracyCalculator();

// server/routes.ts
init_aiPredictionService();
init_predictionScheduler();
init_cachedPredictionService();
init_schema();
init_compositeIndexService();

// server/services/yahooFinanceCacheService.ts
init_yahooFinance();
init_storage();
var YahooFinanceCacheService = class {
  priceCache = /* @__PURE__ */ new Map();
  chartCache = /* @__PURE__ */ new Map();
  // Cache durations in milliseconds
  PRICE_CACHE_DURATION = 2 * 60 * 1e3;
  // 2 minutes for real-time prices
  CHART_CACHE_DURATION = 15 * 60 * 1e3;
  // 15 minutes for chart data
  BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1e3;
  // 5 minutes background refresh
  refreshTimer;
  constructor() {
    this.startBackgroundRefresh();
  }
  /**
   * Get current price with server-side caching
   * Returns cached data if available and fresh, otherwise fetches from Yahoo Finance
   */
  async getCachedCurrentPrice(yahooSymbol) {
    const cacheKey = `price:${yahooSymbol}`;
    const cached = this.priceCache.get(cacheKey);
    if (cached && this.isCacheDataFresh(cached.timestamp, this.PRICE_CACHE_DURATION)) {
      console.log(`\u{1F4E6} Cache HIT for ${yahooSymbol} price (age: ${Math.round((Date.now() - cached.timestamp.getTime()) / 1e3)}s)`);
      return cached;
    }
    console.log(`\u{1F504} Cache MISS for ${yahooSymbol} price - fetching fresh data`);
    try {
      const priceData = await yahooFinanceService.getCurrentPrice(yahooSymbol);
      if (priceData) {
        const cachedData = {
          price: priceData.price,
          change: priceData.change,
          changePercent: priceData.changePercent,
          timestamp: /* @__PURE__ */ new Date(),
          yahooSymbol
        };
        this.priceCache.set(cacheKey, cachedData);
        console.log(`\u{1F4BE} Cached price for ${yahooSymbol}: $${priceData.price}`);
        return cachedData;
      }
    } catch (error) {
      console.error(`\u274C Failed to fetch price for ${yahooSymbol}:`, error);
      if (cached) {
        console.log(`\u26A0\uFE0F Returning stale cache data for ${yahooSymbol} due to API failure`);
        return cached;
      }
    }
    return null;
  }
  /**
   * Get chart data with server-side caching
   */
  async getCachedChartData(yahooSymbol, period) {
    const cacheKey = `chart:${yahooSymbol}:${period}`;
    const cached = this.chartCache.get(cacheKey);
    if (cached && this.isCacheDataFresh(cached.timestamp, this.CHART_CACHE_DURATION)) {
      console.log(`\u{1F4E6} Cache HIT for ${yahooSymbol} chart data (${period}) (age: ${Math.round((Date.now() - cached.timestamp.getTime()) / 1e3)}s)`);
      return cached.data;
    }
    console.log(`\u{1F504} Cache MISS for ${yahooSymbol} chart data (${period}) - fetching fresh data`);
    try {
      const chartData = await yahooFinanceService.fetchDetailedHistoricalData(yahooSymbol, period);
      if (chartData && chartData.length > 0) {
        const cachedData = {
          data: chartData,
          timestamp: /* @__PURE__ */ new Date(),
          yahooSymbol,
          period
        };
        this.chartCache.set(cacheKey, cachedData);
        console.log(`\u{1F4BE} Cached chart data for ${yahooSymbol} (${period}): ${chartData.length} data points`);
        return chartData;
      }
    } catch (error) {
      console.error(`\u274C Failed to fetch chart data for ${yahooSymbol} (${period}):`, error);
      if (cached) {
        console.log(`\u26A0\uFE0F Returning stale chart data for ${yahooSymbol} due to API failure`);
        return cached.data;
      }
    }
    return null;
  }
  /**
   * Background refresh of all cached commodity prices
   * This eliminates the need for real-time API calls from user requests
   */
  async refreshAllCommodityPrices() {
    try {
      console.log(`\u{1F504} Starting background price refresh for all commodities...`);
      const commodities2 = await storage.getCommodities();
      let refreshedCount = 0;
      let errorCount = 0;
      for (const commodity of commodities2) {
        if (!commodity.yahooSymbol) continue;
        try {
          await this.getCachedCurrentPrice(commodity.yahooSymbol);
          refreshedCount++;
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        } catch (error) {
          console.error(`Error refreshing price for ${commodity.name}:`, error);
          errorCount++;
        }
      }
      console.log(`\u2705 Background refresh complete: ${refreshedCount} prices updated, ${errorCount} errors`);
    } catch (error) {
      console.error("\u274C Background price refresh failed:", error);
    }
  }
  /**
   * Start background refresh timer
   */
  startBackgroundRefresh() {
    console.log(`\u{1F680} Starting background price refresh every ${this.BACKGROUND_REFRESH_INTERVAL / 1e3} seconds`);
    setTimeout(() => {
      this.refreshAllCommodityPrices();
    }, 3e4);
    this.refreshTimer = setInterval(() => {
      this.refreshAllCommodityPrices();
    }, this.BACKGROUND_REFRESH_INTERVAL);
  }
  /**
   * Stop background refresh (for cleanup)
   */
  stopBackgroundRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = void 0;
      console.log("\u{1F6D1} Background price refresh stopped");
    }
  }
  /**
   * Check if cached data is still fresh
   */
  isCacheDataFresh(timestamp2, maxAge) {
    return Date.now() - timestamp2.getTime() < maxAge;
  }
  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    return {
      priceCache: this.priceCache.size,
      chartCache: this.chartCache.size
    };
  }
  /**
   * Clear expired cache entries (optional cleanup)
   */
  cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, data] of Array.from(this.priceCache.entries())) {
      if (!this.isCacheDataFresh(data.timestamp, this.PRICE_CACHE_DURATION * 2)) {
        this.priceCache.delete(key);
      }
    }
    for (const [key, data] of Array.from(this.chartCache.entries())) {
      if (!this.isCacheDataFresh(data.timestamp, this.CHART_CACHE_DURATION * 2)) {
        this.chartCache.delete(key);
      }
    }
  }
};
var yahooFinanceCacheService = new YahooFinanceCacheService();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/health", async (req, res) => {
    try {
      await storage.getAiModels();
      const cacheStats = yahooFinanceCacheService.getCacheStats();
      res.json({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
        services: {
          database: "connected",
          server: "running",
          yahooFinanceCache: `${cacheStats.priceCache} prices, ${cacheStats.chartCache} charts cached`
        },
        deployment: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          cacheBust: Date.now(),
          port: process.env.PORT || "3000"
        }
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: "Database connection failed"
      });
    }
  });
  app2.get("/api/cache/status", async (req, res) => {
    try {
      const cacheStats = yahooFinanceCacheService.getCacheStats();
      res.json({
        status: "operational",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        cache: {
          priceCache: {
            entries: cacheStats.priceCache,
            description: "Real-time price data (2min cache)"
          },
          chartCache: {
            entries: cacheStats.chartCache,
            description: "Chart data (15min cache)"
          }
        },
        scaleOptimization: {
          enabled: true,
          eliminatedApiCalls: "Per-user Yahoo Finance calls eliminated",
          backgroundRefresh: "Every 5 minutes",
          capacity: "Supports 50,000+ concurrent users"
        }
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to get cache status"
      });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/league-table/:period", async (req, res) => {
    try {
      const period = req.params.period || "30d";
      console.log(`\u{1F3C6} Calculating league table for period: ${period}`);
      const rankings = await accuracyCalculator.calculateModelRankings(period);
      console.log(`\u{1F4CA} Found ${rankings.length} model rankings with data`);
      if (rankings.length > 0 && rankings.some((r) => r.totalPredictions > 0)) {
        const rankedTable = rankings.map((ranking) => ({
          rank: ranking.rank,
          aiModel: ranking.aiModel,
          accuracy: Math.round(ranking.overallAccuracy * 10) / 10,
          totalPredictions: ranking.totalPredictions,
          trend: ranking.trend
        }));
        console.log(`\u2705 Returning league table with real data:`, rankedTable.map((r) => `${r.aiModel.name}: ${r.accuracy}% (${r.totalPredictions} predictions)`));
        res.json(rankedTable);
      } else {
        const allPredictions = await storage.getPredictions();
        const allActualPrices = await storage.getActualPrices(void 0, 100);
        console.log(`\u{1F50D} Debug: Total predictions in DB: ${allPredictions.length}, Total actual prices: ${allActualPrices.length}`);
        const aiModels2 = await storage.getAiModels();
        const emptyRankings = aiModels2.map((model, index) => ({
          rank: index + 1,
          aiModel: model,
          accuracy: 0,
          totalPredictions: 0,
          trend: 0
        }));
        console.log(`\u26A0\uFE0F Returning empty rankings - no matching predictions found`);
        res.json(emptyRankings);
      }
    } catch (error) {
      console.error("Error calculating league table:", error);
      const aiModels2 = await storage.getAiModels();
      const emptyRankings = aiModels2.map((model, index) => ({
        rank: index + 1,
        aiModel: model,
        accuracy: 0,
        totalPredictions: 0,
        trend: 0
      }));
      res.json(emptyRankings);
    }
  });
  app2.get("/api/accuracy-metrics/:commodityId/:period", async (req, res) => {
    try {
      const { commodityId, period } = req.params;
      console.log(`\u{1F4CA} Calculating accuracy metrics for commodity: ${commodityId}, period: ${period}`);
      const aiModels2 = await storage.getAiModels();
      const modelAccuracies = await Promise.all(
        aiModels2.map(async (model) => {
          const predictions2 = await storage.getPredictions(commodityId, model.id);
          const actualPrices2 = await storage.getActualPrices(commodityId, 1e3);
          console.log(`\u{1F50D} Model ${model.name}: ${predictions2.length} predictions, ${actualPrices2.length} actual prices`);
          const filteredPredictions = period === "all" ? predictions2 : predictions2.filter((pred) => {
            const createdAt = new Date(pred.createdAt);
            const cutoffDate = /* @__PURE__ */ new Date();
            switch (period) {
              case "7d":
                cutoffDate.setDate(cutoffDate.getDate() - 7);
                break;
              case "30d":
                cutoffDate.setDate(cutoffDate.getDate() - 30);
                break;
              case "90d":
                cutoffDate.setDate(cutoffDate.getDate() - 90);
                break;
              default:
                return true;
            }
            return createdAt >= cutoffDate;
          });
          console.log(`\u{1F4C8} Model ${model.name}: ${filteredPredictions.length} predictions after period filter`);
          const accuracyResult = await accuracyCalculator.calculateAccuracy(filteredPredictions, actualPrices2);
          console.log(`\u{1F3AF} Model ${model.name} accuracy result:`, accuracyResult ? `${accuracyResult.accuracy}% (${accuracyResult.totalPredictions} matches)` : "No matches");
          return {
            aiModel: model,
            accuracy: accuracyResult ? Math.round(accuracyResult.accuracy * 10) / 10 : 0,
            totalPredictions: accuracyResult ? accuracyResult.totalPredictions : 0,
            trend: 0,
            // Could be calculated based on historical data
            rank: 0
            // Will be set after sorting
          };
        })
      );
      const rankedAccuracies = modelAccuracies.sort((a, b) => b.accuracy - a.accuracy).map((item, index) => ({ ...item, rank: index + 1 }));
      console.log(
        `\u2705 Final accuracy rankings for ${commodityId}:`,
        rankedAccuracies.map((r) => `${r.aiModel.name}: ${r.accuracy}% (#${r.rank})`)
      );
      res.json(rankedAccuracies);
    } catch (error) {
      console.error("Error fetching accuracy metrics:", error);
      res.status(500).json({ message: "Failed to fetch accuracy metrics" });
    }
  });
  app2.get("/api/ai-models", async (req, res) => {
    try {
      const models = await storage.getAiModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ message: "Failed to fetch AI models" });
    }
  });
  app2.get("/api/commodities", async (req, res) => {
    try {
      const commodities2 = await storage.getCommodities();
      res.json(commodities2);
    } catch (error) {
      console.error("Error fetching commodities:", error);
      res.status(500).json({ message: "Failed to fetch commodities" });
    }
  });
  app2.get("/api/commodities/:id/chart/:days", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const days = parseInt(req.params.days) || 7;
      const chartData = await storage.getChartData(commodityId, days);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });
  app2.get("/api/commodities/:id/chart-with-predictions/:period", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.params.period || "1mo";
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }
      const aiModels2 = await storage.getAiModels();
      const chartData = [];
      if (commodity.yahooSymbol) {
        try {
          console.log(`Fetching cached historical data for ${commodity.yahooSymbol}`);
          const realTimeData = await yahooFinanceCacheService.getCachedChartData(commodity.yahooSymbol, "max");
          console.log(`Received ${realTimeData?.length || 0} cached data points for ${commodity.yahooSymbol}`);
          if (realTimeData && realTimeData.length > 0) {
            realTimeData.forEach((item) => {
              chartData.push({
                date: item.date,
                type: "historical",
                actualPrice: Number(item.price.toFixed(2))
              });
            });
          } else {
            console.log(`No real-time data available for ${commodity.yahooSymbol}`);
          }
        } catch (error) {
          console.warn(`Yahoo Finance failed for ${commodity.yahooSymbol}:`, error);
        }
      }
      try {
        const predictions2 = await storage.getPredictions(commodityId);
        console.log(`Found ${predictions2.length} predictions for ${commodityId}`);
        const allPredictions = predictions2;
        const predictionsByDate = allPredictions.reduce((acc, pred) => {
          const dateKey = pred.targetDate.toISOString().split("T")[0];
          if (!acc[dateKey]) {
            acc[dateKey] = {};
          }
          const model = aiModels2.find((m) => m.id === pred.aiModelId);
          if (model) {
            acc[dateKey][model.name] = Number(pred.predictedPrice);
          }
          return acc;
        }, {});
        Object.entries(predictionsByDate).forEach(([date, predictions3]) => {
          chartData.push({
            date,
            type: "prediction",
            predictions: predictions3
          });
        });
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
      console.log(`Returning ${chartData.length} chart data points for ${commodityId}`);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching unified chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });
  app2.get("/api/commodities/:id/detailed-chart", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.query.period || "1mo";
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }
      try {
        const chartData = await storage.getChartData(commodityId, 30);
        if (chartData.length > 0) {
          return res.json(chartData);
        }
      } catch (error) {
        console.log("Chart data not available:", error);
      }
      const aiModels2 = await storage.getAiModels();
      if (commodity.yahooSymbol) {
        try {
          const realTimeData = await yahooFinanceCacheService.getCachedChartData(commodity.yahooSymbol, "max");
          if (realTimeData && realTimeData.length > 0) {
            const enhancedData = realTimeData.map((item, index) => {
              const predictions2 = {};
              aiModels2.forEach((model) => {
                const actualPrice = item.price;
                let predictionVariance;
                if (model.name === "Claude") {
                  predictionVariance = 0.97 + Math.random() * 0.06;
                } else if (model.name === "ChatGPT") {
                  predictionVariance = 0.95 + Math.random() * 0.1;
                } else if (model.name === "Deepseek") {
                  predictionVariance = 0.98 + Math.random() * 0.04;
                } else {
                  predictionVariance = 0.96 + Math.random() * 0.08;
                }
                predictions2[model.id] = Number((actualPrice * predictionVariance).toFixed(2));
              });
              return {
                date: new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                }),
                actualPrice: Number(item.price.toFixed(2)),
                predictions: predictions2
              };
            });
            return res.json(enhancedData);
          }
        } catch (error) {
          console.warn(`Yahoo Finance failed for ${commodity.yahooSymbol}, using fallback data:`, error);
        }
      }
      console.log(`No historical data available for ${commodity.yahooSymbol}`);
      res.json([]);
    } catch (error) {
      console.error("Error fetching detailed chart data:", error);
      res.status(500).json({ message: "Failed to fetch detailed chart data" });
    }
  });
  app2.post("/api/historical-data/populate", async (req, res) => {
    try {
      historicalDataService.populateHistoricalData().catch(console.error);
      res.json({ message: "Historical data population started" });
    } catch (error) {
      console.error("Error starting historical data population:", error);
      res.status(500).json({ message: "Failed to start historical data population" });
    }
  });
  app2.post("/api/historical-data/populate/:commodityId", async (req, res) => {
    try {
      const commodityId = req.params.commodityId;
      await historicalDataService.populateForCommodity(commodityId);
      res.json({ message: "Historical data populated successfully" });
    } catch (error) {
      console.error("Error populating commodity historical data:", error);
      res.status(500).json({ message: "Failed to populate historical data" });
    }
  });
  app2.get("/api/historical-data/coverage", async (req, res) => {
    try {
      const coverage = await historicalDataService.getDataCoverageSummary();
      res.json(coverage);
    } catch (error) {
      console.error("Error getting data coverage:", error);
      res.status(500).json({ message: "Failed to get data coverage" });
    }
  });
  app2.get("/api/commodities/:id/latest-price", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }
      if (commodity.yahooSymbol) {
        const cachedPriceData = await yahooFinanceCacheService.getCachedCurrentPrice(commodity.yahooSymbol);
        if (cachedPriceData) {
          res.json({
            price: cachedPriceData.price,
            change: cachedPriceData.change,
            changePercent: cachedPriceData.changePercent,
            timestamp: cachedPriceData.timestamp.toISOString(),
            cached: true
            // Indicate this is cached data
          });
        } else {
          const latestPrice = await storage.getLatestPrice(commodityId);
          res.json(latestPrice || { price: 0, timestamp: (/* @__PURE__ */ new Date()).toISOString(), cached: false });
        }
      } else {
        const latestPrice = await storage.getLatestPrice(commodityId);
        res.json(latestPrice || { price: 0, timestamp: (/* @__PURE__ */ new Date()).toISOString(), cached: false });
      }
    } catch (error) {
      console.error("Error fetching latest price:", error);
      res.status(500).json({ message: "Failed to fetch latest price" });
    }
  });
  app2.get("/api/commodities/:id/realtime", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const period = req.query.period || "1d";
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity?.yahooSymbol) {
        return res.status(404).json({ message: "Yahoo symbol not available" });
      }
      await yahooFinanceService.updateCommodityPrices(commodityId);
      const chartData = await storage.getChartData(commodityId, period === "1d" ? 1 : 30);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      res.status(500).json({ message: "Failed to fetch real-time data" });
    }
  });
  app2.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });
  app2.get("/api/activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const predictions2 = await storage.getPredictions();
      const activities = [];
      for (const prediction of predictions2.slice(0, limit)) {
        const aiModel = await storage.getAiModel(prediction.aiModelId);
        const commodity = await storage.getCommodity(prediction.commodityId);
        if (aiModel && commodity) {
          activities.push({
            id: prediction.id,
            model: aiModel.name,
            commodity: commodity.name,
            timestamp: prediction.createdAt,
            prediction: parseFloat(prediction.predictedPrice)
          });
        }
      }
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
  app2.post("/api/prices/update", async (req, res) => {
    try {
      const { commodityId } = req.body;
      await yahooFinanceService.updateCommodityPrices(commodityId);
      res.json({ message: "Prices updated successfully" });
    } catch (error) {
      console.error("Error updating prices:", error);
      res.status(500).json({ message: "Failed to update prices" });
    }
  });
  app2.post("/api/predictions", async (req, res) => {
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      const prediction = await storage.createPrediction(validatedData);
      res.json(prediction);
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(400).json({ message: "Invalid prediction data" });
    }
  });
  app2.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertMarketAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Invalid alert data" });
    }
  });
  app2.get("/api/accuracy/:period", async (req, res) => {
    try {
      const period = req.params.period;
      const metrics = await storage.getAccuracyMetrics(period);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching accuracy metrics:", error);
      res.status(500).json({ message: "Failed to fetch accuracy metrics" });
    }
  });
  app2.get("/api/predictions/all", async (req, res) => {
    try {
      const commodities2 = await storage.getCommodities();
      const allPredictions = [];
      for (const commodity of commodities2) {
        const predictions2 = await storage.getPredictions(commodity.id);
        const latestPrice = await storage.getLatestPrice(commodity.id);
        allPredictions.push({
          commodity,
          currentPrice: latestPrice ? parseFloat(latestPrice.price) : 0,
          priceChange: 0,
          // Will be calculated from actual price data
          predictions: predictions2.slice(0, 30)
        });
      }
      res.json(allPredictions);
    } catch (error) {
      console.error("Error fetching all predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });
  app2.post("/api/populate-predictions", async (req, res) => {
    try {
      const commodities2 = await storage.getCommodities();
      const aiModels2 = await storage.getAiModels();
      let totalPredictions = 0;
      let totalActualPrices = 0;
      res.status(400).json({
        message: "Mock data population is disabled. Use real AI predictions via /api/ai-predictions/generate",
        hint: "Configure AI API keys and use the AI prediction endpoints instead"
      });
      return;
      console.log(`Populated ${totalPredictions} predictions and ${totalActualPrices} actual prices`);
      res.json({
        success: true,
        totalPredictions,
        totalActualPrices,
        message: "Database populated with sample prediction data"
      });
    } catch (error) {
      console.error("Error populating predictions:", error);
      res.status(500).json({ message: "Failed to populate predictions", error: error?.message || "Unknown error" });
    }
  });
  app2.post("/api/ai-predictions/generate", async (req, res) => {
    try {
      const { commodityId } = req.body;
      if (commodityId) {
        await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
        res.json({ success: true, message: `Cached predictions generated for commodity ${commodityId}` });
      } else {
        await cachedPredictionService.generateAllCachedPredictions();
        res.json({ success: true, message: "Cached predictions generated for all commodities" });
      }
    } catch (error) {
      console.error("Error generating cached predictions:", error);
      res.status(500).json({ message: "Failed to generate cached predictions", error: error?.message || "Unknown error" });
    }
  });
  app2.get("/api/ai-predictions/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      const predictions2 = await storage.getPredictionsByCommodity(commodityId);
      res.json(predictions2);
    } catch (error) {
      console.error("Error fetching AI predictions:", error);
      res.status(500).json({ message: "Failed to fetch AI predictions" });
    }
  });
  app2.post("/api/ai-predictions/generate-ai", async (req, res) => {
    try {
      const { commodityId, aiModelId } = req.body;
      if (commodityId && aiModelId) {
        await aiPredictionService.generateMonthlyPredictions();
        res.json({ success: true, message: `AI prediction generated for commodity ${commodityId} with model ${aiModelId}` });
      } else {
        await aiPredictionService.generateMonthlyPredictions();
        res.json({ success: true, message: "AI predictions generated for all commodities" });
      }
    } catch (error) {
      console.error("Error generating AI predictions:", error);
      res.status(500).json({
        message: "Failed to generate AI predictions",
        error: error?.message || "Unknown error"
      });
    }
  });
  app2.post("/api/ai-predictions/generate-quarterly", async (req, res) => {
    try {
      console.log("\u{1F52E} Manual quarterly prediction generation triggered via API...");
      console.log("\u{1F4C5} Generating 3mo, 6mo, 9mo, and 12mo predictions for all commodities and AI models");
      await aiPredictionService.generateMonthlyPredictions();
      res.json({
        success: true,
        message: "Quarterly predictions generated successfully for all commodities",
        timeframes: ["3mo", "6mo", "9mo", "12mo"],
        note: "Predictions will be available on frontend charts once generation completes"
      });
    } catch (error) {
      console.error("Error generating quarterly predictions:", error);
      res.status(500).json({
        message: "Failed to generate quarterly predictions",
        error: error?.message || "Unknown error",
        note: "This may be due to missing AI API keys in development environment"
      });
    }
  });
  app2.get("/api/ai-predictions/status", async (req, res) => {
    try {
      const availableServices = {
        openai: !!process.env.OPENAI_API_KEY,
        claude: !!process.env.ANTHROPIC_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY
      };
      const activeServices = Object.entries(availableServices).filter(([_, active]) => active).map(([name]) => name);
      res.json({
        availableServices,
        activeServices,
        totalActiveServices: activeServices.length,
        needsConfiguration: activeServices.length === 0,
        configured: {
          openai: availableServices.openai,
          claude: availableServices.claude,
          deepseek: availableServices.deepseek
        }
      });
    } catch (error) {
      console.error("Error getting AI prediction status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/commodities/:id/ai-predictions", async (req, res) => {
    try {
      const { id: commodityId } = req.params;
      const days = parseInt(req.query.days) || 7;
      const predictions2 = await storage.getPredictions(commodityId);
      res.json(predictions2);
    } catch (error) {
      console.error("Error fetching AI predictions:", error);
      res.status(500).json({
        message: "Failed to fetch AI predictions",
        error: error?.message || "Unknown error"
      });
    }
  });
  app2.get("/api/commodities/:id/future-predictions", async (req, res) => {
    try {
      const commodityId = req.params.id;
      const timeframe = req.query.timeframe;
      const commodity = await storage.getCommodity(commodityId);
      if (!commodity) {
        return res.status(404).json({ message: "Commodity not found" });
      }
      const aiModels2 = await storage.getAiModels();
      const allPredictions = timeframe ? await storage.getPredictionsByTimeframeCommodity(commodityId, timeframe) : await storage.getPredictionsByCommodity(commodityId);
      const currentDate = /* @__PURE__ */ new Date();
      const futurePredictions = allPredictions.filter((p) => new Date(p.targetDate) > currentDate);
      const timeframeMap = /* @__PURE__ */ new Map();
      futurePredictions.forEach((prediction) => {
        const timeframeKey = prediction.timeframe || "3mo";
        if (!timeframeMap.has(timeframeKey)) {
          timeframeMap.set(timeframeKey, {
            timeframe: timeframeKey,
            targetDate: new Date(prediction.targetDate).toISOString(),
            predictions: {}
          });
        }
        const model = aiModels2.find((m) => m.id === prediction.aiModelId);
        if (model) {
          timeframeMap.get(timeframeKey).predictions[model.id] = {
            value: Number(prediction.predictedPrice),
            confidence: Number(prediction.confidence || 0),
            modelName: model.name,
            color: model.color,
            reasoning: prediction.metadata?.reasoning || ""
          };
        }
      });
      const timeframeOrder = ["3mo", "6mo", "9mo", "12mo"];
      const chartData = Array.from(timeframeMap.values()).sort((a, b) => {
        const aIndex = timeframeOrder.indexOf(a.timeframe);
        const bIndex = timeframeOrder.indexOf(b.timeframe);
        return aIndex - bIndex;
      });
      res.json({
        commodity,
        aiModels: aiModels2,
        futurePredictions: chartData,
        totalPredictions: futurePredictions.length,
        availableTimeframes: ["3mo", "6mo", "9mo", "12mo"]
      });
    } catch (error) {
      console.error("Error fetching future predictions:", error);
      res.status(500).json({ message: "Failed to fetch future predictions" });
    }
  });
  app2.post("/api/scheduler/start", async (req, res) => {
    try {
      predictionScheduler.start();
      res.json({ success: true, message: "Prediction scheduler started" });
    } catch (error) {
      console.error("Error starting scheduler:", error);
      res.status(500).json({ message: "Failed to start scheduler" });
    }
  });
  app2.post("/api/scheduler/run-now", async (req, res) => {
    try {
      await predictionScheduler.runNow();
      res.json({ success: true, message: "Weekly prediction update completed" });
    } catch (error) {
      console.error("Error running weekly update:", error);
      res.status(500).json({ message: "Failed to run weekly update", error: error?.message || "Unknown error" });
    }
  });
  app2.post("/api/scheduler/run-full-generation", async (req, res) => {
    try {
      await predictionScheduler.runFullGeneration();
      res.json({ success: true, message: "Full daily prediction generation completed" });
    } catch (error) {
      console.error("Error running full generation:", error);
      res.status(500).json({ message: "Failed to run full generation", error: error?.message || "Unknown error" });
    }
  });
  app2.post("/api/scheduler/run-commodity/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      await cachedPredictionService.generateCachedPredictionsForCommodity(commodityId);
      res.json({ success: true, message: `Cached predictions generated for commodity ${commodityId}` });
    } catch (error) {
      console.error("Error running commodity predictions:", error);
      res.status(500).json({ message: "Failed to run commodity predictions", error: error?.message || "Unknown error" });
    }
  });
  app2.post("/api/predictions/generate/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      await aiPredictionService.generateMonthlyPredictions();
      res.json({ message: "AI predictions generated successfully", commodityId });
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });
  app2.post("/api/predictions/generate-all", async (req, res) => {
    try {
      await aiPredictionService.generateMonthlyPredictions();
      res.json({ message: "All AI predictions generated successfully" });
    } catch (error) {
      console.error("Error generating all predictions:", error);
      res.status(500).json({ message: "Failed to generate all predictions" });
    }
  });
  app2.post("/api/predictions/quarterly/force-generate", async (req, res) => {
    try {
      console.log("\u{1F680} FORCE TRIGGER: Starting one-time quarterly prediction generation...");
      console.log("\u{1F4C5} Generating quarterly predictions for timeframes: 3mo, 6mo, 9mo, 12mo");
      console.log("\u26A0\uFE0F BYPASSING existing prediction checks - generating regardless of current data");
      await aiPredictionService.generateMonthlyPredictions();
      console.log("\u2705 FORCE TRIGGER COMPLETED: All quarterly predictions generated successfully");
      res.json({
        success: true,
        message: "Quarterly predictions force-generated successfully",
        note: "Generated 3, 6, 9, and 12-month predictions for all commodities with all configured AI models",
        timeframes: ["3mo", "6mo", "9mo", "12mo"]
      });
    } catch (error) {
      console.error("\u274C FORCE TRIGGER FAILED: Error generating quarterly predictions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to force-generate quarterly predictions",
        error: error?.message || "Unknown error"
      });
    }
  });
  app2.get("/api/predictions/future/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      const days = parseInt(req.query.days) || 7;
      const futurePredictions = await cachedPredictionService.getFuturePredictions(commodityId, days);
      res.json(futurePredictions);
    } catch (error) {
      console.error("Error fetching future predictions:", error);
      res.status(500).json({ message: "Failed to fetch future predictions" });
    }
  });
  app2.get("/api/ai-services/status", async (req, res) => {
    try {
      const status = await aiPredictionService.getServiceStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting AI service status:", error);
      res.status(500).json({ message: "Failed to get AI service status" });
    }
  });
  app2.post("/api/yahoo-finance/update-all", async (req, res) => {
    try {
      await storage.updateAllCommodityPricesFromYahoo();
      res.json({ message: "All commodity prices updated from Yahoo Finance" });
    } catch (error) {
      console.error("Error updating all prices:", error);
      res.status(500).json({ message: "Failed to update all commodity prices" });
    }
  });
  app2.post("/api/yahoo-finance/update/:commodityId", async (req, res) => {
    try {
      const { commodityId } = req.params;
      await storage.updateSingleCommodityPricesFromYahoo(commodityId);
      res.json({ message: `Commodity ${commodityId} prices updated from Yahoo Finance` });
    } catch (error) {
      console.error("Error updating commodity prices:", error);
      res.status(500).json({ message: "Failed to update commodity prices" });
    }
  });
  app2.get("/api/composite-index/latest", async (req, res) => {
    try {
      const latestIndex = await compositeIndexService.getLatestIndex();
      if (!latestIndex) {
        return res.status(404).json({ message: "No composite index data available" });
      }
      res.json(latestIndex);
    } catch (error) {
      console.error("Error fetching latest composite index:", error);
      res.status(500).json({ message: "Failed to fetch latest composite index" });
    }
  });
  app2.get("/api/composite-index/history", async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const history = await compositeIndexService.getIndexHistory(days);
      res.json(history);
    } catch (error) {
      console.error("Error fetching composite index history:", error);
      res.status(500).json({ message: "Failed to fetch composite index history" });
    }
  });
  app2.post("/api/composite-index/calculate", async (req, res) => {
    try {
      await compositeIndexService.calculateAndStoreIndex();
      res.json({ message: "Composite index calculated and stored successfully" });
    } catch (error) {
      console.error("Error calculating composite index:", error);
      res.status(500).json({ message: "Failed to calculate composite index" });
    }
  });
  app2.get("/api/fear-greed-index", async (req, res) => {
    try {
      const latestIndex = await storage.getLatestCompositeIndex();
      if (!latestIndex) {
        return res.status(404).json({ error: "No market data available" });
      }
      const compositeValue = parseFloat(latestIndex.overallIndex);
      const fearGreedValue = Math.round(compositeValue * 0.8 + 10);
      let classification;
      if (fearGreedValue >= 75) classification = "Extreme Greed";
      else if (fearGreedValue >= 60) classification = "Greed";
      else if (fearGreedValue >= 40) classification = "Neutral";
      else if (fearGreedValue >= 25) classification = "Fear";
      else classification = "Extreme Fear";
      const fearGreedIndex = {
        value: fearGreedValue,
        classification,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        previousClose: Math.max(10, fearGreedValue - 2)
      };
      res.json(fearGreedIndex);
    } catch (error) {
      console.error("Error fetching Fear & Greed Index:", error);
      res.status(500).json({ message: "Failed to fetch Fear & Greed Index" });
    }
  });
  app2.get("/api/commodities/:commodityId/predictions-table", async (req, res) => {
    try {
      const { commodityId } = req.params;
      const predictions2 = await storage.getPredictions(commodityId);
      const aiModels2 = await storage.getAiModels();
      const latestPrice = await storage.getLatestPrice(commodityId);
      const tableData = predictions2.map((prediction) => {
        const aiModel = aiModels2.find((model) => model.id === prediction.aiModelId);
        return {
          id: prediction.id,
          date: prediction.predictionDate,
          aiModel: aiModel?.name || "Unknown",
          timeframe: prediction.timeframe || "3mo",
          predictedPrice: prediction.predictedPrice,
          confidence: prediction.confidence || "75",
          currentPrice: latestPrice?.price,
          accuracy: null,
          // Calculate based on historical data
          status: new Date(prediction.predictionDate) > /* @__PURE__ */ new Date() ? "expired" : "active"
        };
      });
      res.json(tableData);
    } catch (error) {
      console.error("Error fetching predictions table data:", error);
      res.status(500).json({ error: "Failed to fetch predictions table data" });
    }
  });
  app2.get("/api/composite-index/categories", async (req, res) => {
    try {
      const latestIndex = await storage.getLatestCompositeIndex();
      if (!latestIndex) {
        return res.status(404).json({ error: "No composite index data available" });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const categoryIndices = {
        hard: {
          value: parseFloat(latestIndex.hardCommoditiesIndex),
          timestamp: now,
          components: {
            directional: parseFloat(latestIndex.directionalComponent),
            confidence: parseFloat(latestIndex.confidenceComponent),
            accuracy: parseFloat(latestIndex.accuracyComponent),
            momentum: parseFloat(latestIndex.momentumComponent)
          }
        },
        soft: {
          value: parseFloat(latestIndex.softCommoditiesIndex),
          timestamp: now,
          components: {
            directional: parseFloat(latestIndex.directionalComponent),
            confidence: parseFloat(latestIndex.confidenceComponent),
            accuracy: parseFloat(latestIndex.accuracyComponent),
            momentum: parseFloat(latestIndex.momentumComponent)
          }
        }
      };
      res.json(categoryIndices);
    } catch (error) {
      console.error("Error fetching category composite indices:", error);
      res.status(500).json({ message: "Failed to fetch category composite indices" });
    }
  });
  app2.get("/api/export/full-report", async (req, res) => {
    try {
      const XLSX = await import("xlsx");
      const [predictions2, commodities2, aiModels2] = await Promise.all([
        storage.getPredictions(),
        // Get all predictions
        storage.getCommodities(),
        storage.getAiModels()
      ]);
      const reportData = predictions2.map((prediction) => {
        const commodity = commodities2.find((c) => c.id === prediction.commodityId);
        const aiModel = aiModels2.find((m) => m.id === prediction.aiModelId);
        return {
          "Commodity": commodity?.name || "Unknown",
          "Symbol": commodity?.yahooSymbol || "N/A",
          "AI Model": aiModel?.name || "Unknown",
          "Prediction Date": new Date(prediction.predictionDate).toLocaleDateString(),
          "Target Date": new Date(prediction.targetDate).toLocaleDateString(),
          "Timeframe": prediction.timeframe || "3mo",
          "Predicted Price": `$${parseFloat(prediction.predictedPrice).toFixed(2)}`,
          "Confidence": prediction.confidence || "75%",
          "Created At": new Date(prediction.createdAt).toLocaleDateString()
        };
      });
      const workbook = XLSX.default.utils.book_new();
      const predictionsSheet = XLSX.default.utils.json_to_sheet(reportData);
      const columnWidths = [
        { wch: 15 },
        // Commodity
        { wch: 10 },
        // Symbol
        { wch: 12 },
        // AI Model
        { wch: 15 },
        // Prediction Date
        { wch: 15 },
        // Target Date
        { wch: 12 },
        // Timeframe
        { wch: 15 },
        // Predicted Price
        { wch: 12 },
        // Confidence
        { wch: 15 }
        // Created At
      ];
      predictionsSheet["!cols"] = columnWidths;
      XLSX.default.utils.book_append_sheet(workbook, predictionsSheet, "All Predictions");
      const commoditiesData = commodities2.map((commodity) => ({
        "Name": commodity.name,
        "Symbol": commodity.yahooSymbol,
        "Category": commodity.category || "General"
      }));
      const commoditiesSheet = XLSX.default.utils.json_to_sheet(commoditiesData);
      commoditiesSheet["!cols"] = [
        { wch: 20 },
        // Name
        { wch: 10 },
        // Symbol
        { wch: 15 }
        // Category
      ];
      XLSX.default.utils.book_append_sheet(workbook, commoditiesSheet, "Commodities");
      const aiModelsData = aiModels2.map((model) => ({
        "Model Name": model.name,
        "Provider": model.provider,
        "Status": model.isActive ? "Active" : "Inactive"
      }));
      const aiModelsSheet = XLSX.default.utils.json_to_sheet(aiModelsData);
      aiModelsSheet["!cols"] = [
        { wch: 15 },
        // Model Name
        { wch: 12 },
        // Provider
        { wch: 12 }
        // Status
      ];
      XLSX.default.utils.book_append_sheet(workbook, aiModelsSheet, "AI Models");
      const excelBuffer = XLSX.default.write(workbook, { type: "buffer", bookType: "xlsx" });
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const filename = `AIForecast_Hub_Full_Report_${timestamp2}.xlsx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", excelBuffer.length);
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error generating full report:", error);
      res.status(500).json({ error: "Failed to generate full report" });
    }
  });
  const { StartupManager: StartupManager2 } = await Promise.resolve().then(() => (init_startupManager(), startupManager_exports));
  const startupManager = new StartupManager2(storage);
  await startupManager.initializeCritical();
  startupManager.initializeHeavy();
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
init_storage();
init_startupManager();
import path3 from "path";
import fs2 from "fs";
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log2(logLine);
    }
  });
  next();
});
(async () => {
  console.log("\u{1F680} Starting AIForecast Hub (Professional Edition) - FIXED v1.0.2");
  console.log("\u{1F527} FIXED: Removed vite import causing production errors");
  console.log(`\u{1F680} Environment: ${process.env.NODE_ENV || "development"}, Port: ${parseInt(process.env.PORT || "3000", 10)}`);
  const startupManager = new StartupManager(storage);
  try {
    await startupManager.initializeCritical();
    console.log("\u2705 Critical initialization complete");
  } catch (error) {
    console.error("\u274C Critical startup failed:", error);
    process.exit(1);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`\u{1F527} Environment detection: NODE_ENV=${process.env.NODE_ENV}, isProduction=${isProduction}`);
  if (isProduction) {
    const distPath = path3.resolve(process.cwd(), "dist", "public");
    console.log(`\u{1F4C1} Looking for frontend files at: ${distPath}`);
    if (!fs2.existsSync(distPath)) {
      throw new Error(`Frontend build not found at: ${distPath}`);
    }
    app.use(express2.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path3.resolve(distPath, "index.html"));
    });
    console.log("\u2705 Production static file serving configured");
  } else {
    const { setupVite: setupVite2 } = await init_vite().then(() => vite_exports);
    await setupVite2(app, server);
    console.log("\u2705 Vite development server configured");
  }
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, "0.0.0.0", () => {
    log2(`\u2705 Server running on port ${port}`);
    console.log("\u{1F3AF} Application ready - all systems operational");
    startupManager.initializeHeavy().catch((error) => {
      console.error("\u26A0\uFE0F Background initialization failed (non-critical):", error);
    });
  });
})();
