-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MN', 'USD', 'BOTH', 'FUNCTIONAL');

-- CreateEnum
CREATE TYPE "AuxiliaryType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountNature" AS ENUM ('CURRENT', 'NON_CURRENT');

-- CreateEnum
CREATE TYPE "IFRSCategory" AS ENUM ('CASH_AND_EQUIVALENTS', 'ACCOUNTS_RECEIVABLE', 'INVENTORIES', 'PROPERTY_PLANT_EQUIPMENT', 'INTANGIBLE_ASSETS', 'FINANCIAL_ASSETS', 'DEFERRED_TAX_ASSETS', 'ACCOUNTS_PAYABLE', 'LOANS_AND_FINANCING', 'PROVISIONS', 'DEFERRED_TAX_LIABILITIES', 'SHARE_CAPITAL', 'RESERVES', 'RETAINED_EARNINGS', 'OPERATING_INCOME', 'COST_OF_SALES', 'ADMINISTRATIVE_EXPENSES', 'SELLING_EXPENSES', 'FINANCIAL_EXPENSES', 'FINANCIAL_INCOME', 'OTHER_INCOME', 'OTHER_EXPENSES');

-- CreateEnum
CREATE TYPE "ValuationMethod" AS ENUM ('HISTORICAL_COST', 'FAIR_VALUE', 'AMORTIZED_COST', 'NET_REALIZABLE_VALUE');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('FISCAL_YEAR', 'MONTH');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('JOURNAL', 'OPENING', 'ADJUSTMENT', 'CLOSING', 'EXCHANGE_ADJUSTMENT', 'DEPRECIATION');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ObligationType" AS ENUM ('PAYABLE', 'RECEIVABLE');

-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('ACTIVE', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ACCOUNTANT', 'OPERATOR', 'READER');

-- CreateTable
CREATE TABLE "economic_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "main_country" VARCHAR(2) NOT NULL,
    "base_currency" VARCHAR(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "economic_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "trade_name" TEXT,
    "rut" TEXT NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "functional_currency" VARCHAR(3) NOT NULL,
    "start_date" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charts_of_accounts" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charts_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "chart_of_accounts_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_account_id" INTEGER,
    "type" "AccountType" NOT NULL,
    "level" INTEGER NOT NULL,
    "postable" BOOLEAN NOT NULL DEFAULT true,
    "requires_auxiliary" BOOLEAN NOT NULL DEFAULT false,
    "auxiliary_type" "AuxiliaryType",
    "currency" "Currency" NOT NULL DEFAULT 'FUNCTIONAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "nature" "AccountNature",
    "ifrs_category" "IFRSCategory",
    "valuation_method" "ValuationMethod",

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "source_currency" VARCHAR(3) NOT NULL,
    "target_currency" VARCHAR(3) NOT NULL,
    "rate" DECIMAL(10,4) NOT NULL,
    "source" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_periods" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "type" "PeriodType" NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "month" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "closed_at" TIMESTAMP(3),
    "closed_by" INTEGER,

    CONSTRAINT "accounting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_configuration" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "allow_entries_in_closed_period" BOOLEAN NOT NULL DEFAULT false,
    "require_global_approval" BOOLEAN NOT NULL DEFAULT false,
    "minimum_approval_amount" DECIMAL(18,2),
    "allow_unbalanced_entries" BOOLEAN NOT NULL DEFAULT false,
    "amount_decimals" INTEGER NOT NULL DEFAULT 2,
    "exchange_rate_decimals" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "accounting_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_templates" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "EntryType" NOT NULL,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "entry_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "system_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "type" "EntryType" NOT NULL DEFAULT 'JOURNAL',
    "status" "EntryStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_lines" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL,
    "credit" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(10,4),
    "auxiliary_type" "AuxiliaryType",
    "auxiliary_id" INTEGER,
    "auxiliary_name" VARCHAR(255),
    "cost_center" VARCHAR(100),
    "note" TEXT,
    "account_code" VARCHAR(50) NOT NULL,
    "account_name" VARCHAR(255) NOT NULL,
    "account_type" "AccountType" NOT NULL,

    CONSTRAINT "entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligations" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "type" "ObligationType" NOT NULL,
    "description" TEXT NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "issue_date" DATE NOT NULL,
    "auxiliary_type" "AuxiliaryType" NOT NULL,
    "auxiliary_id" INTEGER NOT NULL,
    "status" "ObligationStatus" NOT NULL DEFAULT 'ACTIVE',
    "source_entry_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligation_installments" (
    "id" SERIAL NOT NULL,
    "obligation_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "paid_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "obligation_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligation_payments" (
    "id" SERIAL NOT NULL,
    "obligation_id" INTEGER NOT NULL,
    "installment_id" INTEGER,
    "payment_date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(10,4),
    "entry_id" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obligation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "auth_provider_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "user_id" INTEGER NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("user_id","economic_group_id")
);

-- CreateTable
CREATE TABLE "user_companies" (
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "can_write" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_companies_pkey" PRIMARY KEY ("user_id","company_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "economic_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rut" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "companies_economic_group_id_idx" ON "companies"("economic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_economic_group_id_rut_key" ON "companies"("economic_group_id", "rut");

-- CreateIndex
CREATE UNIQUE INDEX "charts_of_accounts_economic_group_id_key" ON "charts_of_accounts"("economic_group_id");

-- CreateIndex
CREATE INDEX "accounts_chart_of_accounts_id_idx" ON "accounts"("chart_of_accounts_id");

-- CreateIndex
CREATE INDEX "accounts_type_idx" ON "accounts"("type");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_chart_of_accounts_id_code_key" ON "accounts"("chart_of_accounts_id", "code");

-- CreateIndex
CREATE INDEX "exchange_rates_economic_group_id_date_idx" ON "exchange_rates"("economic_group_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_economic_group_id_date_source_currency_targe_key" ON "exchange_rates"("economic_group_id", "date", "source_currency", "target_currency");

-- CreateIndex
CREATE INDEX "accounting_periods_economic_group_id_idx" ON "accounting_periods"("economic_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_economic_group_id_type_fiscal_year_month_key" ON "accounting_periods"("economic_group_id", "type", "fiscal_year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_configuration_economic_group_id_key" ON "accounting_configuration"("economic_group_id");

-- CreateIndex
CREATE INDEX "entry_templates_economic_group_id_idx" ON "entry_templates"("economic_group_id");

-- CreateIndex
CREATE INDEX "journal_entries_date_idx" ON "journal_entries"("date");

-- CreateIndex
CREATE INDEX "journal_entries_economic_group_id_idx" ON "journal_entries"("economic_group_id");

-- CreateIndex
CREATE INDEX "journal_entries_company_id_idx" ON "journal_entries"("company_id");

-- CreateIndex
CREATE INDEX "journal_entries_status_idx" ON "journal_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_company_id_number_key" ON "journal_entries"("company_id", "number");

-- CreateIndex
CREATE INDEX "entry_lines_entry_id_idx" ON "entry_lines"("entry_id");

-- CreateIndex
CREATE INDEX "entry_lines_account_id_idx" ON "entry_lines"("account_id");

-- CreateIndex
CREATE INDEX "obligations_economic_group_id_idx" ON "obligations"("economic_group_id");

-- CreateIndex
CREATE INDEX "obligations_auxiliary_type_auxiliary_id_idx" ON "obligations"("auxiliary_type", "auxiliary_id");

-- CreateIndex
CREATE INDEX "obligation_installments_obligation_id_idx" ON "obligation_installments"("obligation_id");

-- CreateIndex
CREATE INDEX "obligation_installments_due_date_idx" ON "obligation_installments"("due_date");

-- CreateIndex
CREATE INDEX "obligation_payments_obligation_id_idx" ON "obligation_payments"("obligation_id");

-- CreateIndex
CREATE INDEX "obligation_payments_installment_id_idx" ON "obligation_payments"("installment_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");

-- CreateIndex
CREATE INDEX "customers_economic_group_id_idx" ON "customers"("economic_group_id");

-- CreateIndex
CREATE INDEX "suppliers_economic_group_id_idx" ON "suppliers"("economic_group_id");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charts_of_accounts" ADD CONSTRAINT "charts_of_accounts_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_chart_of_accounts_id_fkey" FOREIGN KEY ("chart_of_accounts_id") REFERENCES "charts_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_parent_account_id_fkey" FOREIGN KEY ("parent_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_configuration" ADD CONSTRAINT "accounting_configuration_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_templates" ADD CONSTRAINT "entry_templates_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_lines" ADD CONSTRAINT "entry_lines_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_lines" ADD CONSTRAINT "entry_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligation_installments" ADD CONSTRAINT "obligation_installments_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "obligations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligation_payments" ADD CONSTRAINT "obligation_payments_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "obligations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligation_payments" ADD CONSTRAINT "obligation_payments_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "obligation_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_economic_group_id_fkey" FOREIGN KEY ("economic_group_id") REFERENCES "economic_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
