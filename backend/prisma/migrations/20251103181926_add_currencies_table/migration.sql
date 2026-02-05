-- Create currencies table
CREATE TABLE "currencies" (
    "code" VARCHAR(3) NOT NULL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(10),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "is_default_functional" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Insert initial currencies (from documentation and validator)
INSERT INTO "currencies" ("code", "name", "symbol", "active", "decimals", "is_default_functional", "created_at", "updated_at") VALUES
('USD', 'US Dollar', '$', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('UYU', 'Uruguayan Peso', '$U', true, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ARS', 'Argentine Peso', '$', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BRL', 'Brazilian Real', 'R$', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CLP', 'Chilean Peso', '$', true, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('COP', 'Colombian Peso', '$', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PEN', 'Peruvian Sol', 'S/', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MXN', 'Mexican Peso', '$', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('EUR', 'Euro', '€', true, 2, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add new rate columns to exchange_rates table
ALTER TABLE "exchange_rates"
    ADD COLUMN "purchase_rate" DECIMAL(10,4),
    ADD COLUMN "sale_rate" DECIMAL(10,4),
    ADD COLUMN "average_rate" DECIMAL(10,4);

-- Migrate existing rate data to new columns (copy rate to all three)
UPDATE "exchange_rates"
SET
    "purchase_rate" = "rate",
    "sale_rate" = "rate",
    "average_rate" = "rate";

-- Make new columns NOT NULL after migration
ALTER TABLE "exchange_rates"
    ALTER COLUMN "purchase_rate" SET NOT NULL,
    ALTER COLUMN "sale_rate" SET NOT NULL,
    ALTER COLUMN "average_rate" SET NOT NULL;

-- Drop old rate column
ALTER TABLE "exchange_rates" DROP COLUMN "rate";

-- Add foreign key constraints
-- Note: These will fail if there are currency codes in use that don't exist in the currencies table
-- We've already inserted USD and UYU which are the ones currently in use
ALTER TABLE "economic_groups"
    ADD CONSTRAINT "economic_groups_base_currency_fkey"
    FOREIGN KEY ("base_currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "companies"
    ADD CONSTRAINT "companies_functional_currency_fkey"
    FOREIGN KEY ("functional_currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exchange_rates"
    ADD CONSTRAINT "exchange_rates_source_currency_fkey"
    FOREIGN KEY ("source_currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exchange_rates"
    ADD CONSTRAINT "exchange_rates_target_currency_fkey"
    FOREIGN KEY ("target_currency") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX "exchange_rates_source_currency_idx" ON "exchange_rates"("source_currency");
CREATE INDEX "exchange_rates_target_currency_idx" ON "exchange_rates"("target_currency");
