CREATE TABLE "accuracy_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_model_id" varchar NOT NULL,
	"commodity_id" varchar NOT NULL,
	"period" text NOT NULL,
	"accuracy" numeric(5, 2) NOT NULL,
	"total_predictions" integer NOT NULL,
	"correct_predictions" integer NOT NULL,
	"avg_error" numeric(10, 4),
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actual_prices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commodity_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"price" numeric(10, 4) NOT NULL,
	"volume" numeric(15, 2),
	"source" text DEFAULT 'yahoo_finance',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"color" text NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "ai_models_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "commodities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"category" text NOT NULL,
	"yahoo_symbol" text,
	"unit" text DEFAULT 'USD',
	CONSTRAINT "commodities_name_unique" UNIQUE("name"),
	CONSTRAINT "commodities_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "market_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"commodity_id" varchar,
	"ai_model_id" varchar,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_model_id" varchar NOT NULL,
	"commodity_id" varchar NOT NULL,
	"prediction_date" timestamp NOT NULL,
	"target_date" timestamp NOT NULL,
	"predicted_price" numeric(10, 4) NOT NULL,
	"confidence" numeric(5, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accuracy_metrics" ADD CONSTRAINT "accuracy_metrics_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actual_prices" ADD CONSTRAINT "actual_prices_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_alerts" ADD CONSTRAINT "market_alerts_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_ai_model_id_ai_models_id_fk" FOREIGN KEY ("ai_model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_commodity_id_commodities_id_fk" FOREIGN KEY ("commodity_id") REFERENCES "public"."commodities"("id") ON DELETE no action ON UPDATE no action;