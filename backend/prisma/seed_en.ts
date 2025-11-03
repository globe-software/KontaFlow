import { PrismaClient, AccountType, Role, PeriodType, AccountNature, IFRSCategory, EntryStatus, EntryType, AuxiliaryType, ObligationType, ObligationStatus, InstallmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===================================
  // 1. ECONOMIC GROUP
  // ===================================
  console.log('📦 Creating EconomicGroup...');
  const group = await prisma.economicGroup.create({
    data: {
      name: 'Pragmatic Software Group',
      mainCountry: 'UY',
      baseCurrency: 'UYU',
    },
  });

  // ===================================
  // 2. COMPANIES
  // ===================================
  console.log('🏢 Creating Companies...');
  const companyUY = await prisma.company.create({
    data: {
      economicGroupId: group.id,
      name: 'Pragmatic Software S.A.',
      tradeName: 'Pragmatic',
      rut: '217890120018',
      country: 'UY',
      functionalCurrency: 'UYU',
      startDate: new Date('2020-01-01'),
    },
  });

  const companyUS = await prisma.company.create({
    data: {
      economicGroupId: group.id,
      name: 'Pragmatic Labs LLC',
      tradeName: 'Pragmatic Labs',
      rut: 'US-123456789',
      country: 'US',
      functionalCurrency: 'USD',
      startDate: new Date('2022-06-01'),
    },
  });

  // ===================================
  // 3. CHART OF ACCOUNTS
  // ===================================
  console.log('📋 Creating ChartOfAccounts...');
  const chartOfAccounts = await prisma.chartOfAccounts.create({
    data: {
      economicGroupId: group.id,
      name: 'International Software Companies Chart of Accounts',
      description: 'Standard chart of accounts for software companies according to IFRS',
    },
  });

  // ===================================
  // 4. ACCOUNTS
  // ===================================
  console.log('💰 Creating Accounts...');

  // ASSETS
  const assets = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '1',
      name: 'ASSETS',
      type: AccountType.ASSET,
      level: 1,
      postable: false,
    },
  });

  // CURRENT ASSETS
  const currentAssets = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '11',
      name: 'CURRENT ASSETS',
      parentAccountId: assets.id,
      type: AccountType.ASSET,
      level: 2,
      postable: false,
      nature: AccountNature.CURRENT,
    },
  });

  // Cash and Equivalents
  const cashAndEquivalents = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111',
      name: 'Cash and Equivalents',
      parentAccountId: currentAssets.id,
      type: AccountType.ASSET,
      level: 3,
      postable: false,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  const pettyCash = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111.001',
      name: 'Petty Cash',
      parentAccountId: cashAndEquivalents.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  const bankBROUMN = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111.002',
      name: 'Bank BROU - Checking Account UYU',
      parentAccountId: cashAndEquivalents.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  const bankBROUUSD = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '111.003',
      name: 'Bank BROU - Checking Account USD',
      parentAccountId: cashAndEquivalents.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      currency: 'USD' as any,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.CASH_AND_EQUIVALENTS,
    },
  });

  // Accounts Receivable
  const accountsReceivable = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '112',
      name: 'Accounts Receivable',
      parentAccountId: currentAssets.id,
      type: AccountType.ASSET,
      level: 3,
      postable: false,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_RECEIVABLE,
    },
  });

  const localCustomers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '112.001',
      name: 'Local Customers',
      parentAccountId: accountsReceivable.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.CUSTOMER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_RECEIVABLE,
    },
  });

  const foreignCustomers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '112.002',
      name: 'Foreign Customers',
      parentAccountId: accountsReceivable.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.CUSTOMER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_RECEIVABLE,
    },
  });

  // VAT
  const vatTaxCredit = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '113.001',
      name: 'VAT Tax Credit',
      parentAccountId: currentAssets.id,
      type: AccountType.ASSET,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
    },
  });

  // LIABILITIES
  const liabilities = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '2',
      name: 'LIABILITIES',
      type: AccountType.LIABILITY,
      level: 1,
      postable: false,
    },
  });

  const currentLiabilities = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '21',
      name: 'CURRENT LIABILITIES',
      parentAccountId: liabilities.id,
      type: AccountType.LIABILITY,
      level: 2,
      postable: false,
      nature: AccountNature.CURRENT,
    },
  });

  const localSuppliers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '211.001',
      name: 'Local Suppliers',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.SUPPLIER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_PAYABLE,
    },
  });

  const foreignSuppliers = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '211.002',
      name: 'Foreign Suppliers',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      requiresAuxiliary: true,
      auxiliaryType: AuxiliaryType.SUPPLIER,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_PAYABLE,
    },
  });

  const vatTaxDebt = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '212.001',
      name: 'VAT Tax Debt',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
    },
  });

  const salariesPayable = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '213.001',
      name: 'Salaries Payable',
      parentAccountId: currentLiabilities.id,
      type: AccountType.LIABILITY,
      level: 4,
      postable: true,
      nature: AccountNature.CURRENT,
      ifrsCategory: IFRSCategory.ACCOUNTS_PAYABLE,
    },
  });

  // EQUITY
  const equity = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '3',
      name: 'EQUITY',
      type: AccountType.EQUITY,
      level: 1,
      postable: false,
    },
  });

  const shareCapital = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '31.001',
      name: 'Share Capital',
      parentAccountId: equity.id,
      type: AccountType.EQUITY,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.SHARE_CAPITAL,
    },
  });

  const retainedEarnings = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '33.002',
      name: 'Retained Earnings',
      parentAccountId: equity.id,
      type: AccountType.EQUITY,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.RETAINED_EARNINGS,
    },
  });

  // INCOME
  const income = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '4',
      name: 'INCOME',
      type: AccountType.INCOME,
      level: 1,
      postable: false,
    },
  });

  const serviceRevenue = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '41.001',
      name: 'Software Services Revenue',
      parentAccountId: income.id,
      type: AccountType.INCOME,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.OPERATING_INCOME,
    },
  });

  const licenseRevenue = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '41.002',
      name: 'License Revenue',
      parentAccountId: income.id,
      type: AccountType.INCOME,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.OPERATING_INCOME,
    },
  });

  // EXPENSES
  const expenses = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '5',
      name: 'EXPENSES',
      type: AccountType.EXPENSE,
      level: 1,
      postable: false,
    },
  });

  const cloudServicesCost = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '51.001',
      name: 'Cloud Services Cost (AWS/Azure)',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.COST_OF_SALES,
    },
  });

  const administrativeSalaries = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '52.001',
      name: 'Administrative Salaries',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.ADMINISTRATIVE_EXPENSES,
    },
  });

  const officeRent = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '52.003',
      name: 'Office Rent',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.ADMINISTRATIVE_EXPENSES,
    },
  });

  const digitalMarketing = await prisma.account.create({
    data: {
      chartOfAccountsId: chartOfAccounts.id,
      code: '53.002',
      name: 'Digital Marketing',
      parentAccountId: expenses.id,
      type: AccountType.EXPENSE,
      level: 3,
      postable: true,
      ifrsCategory: IFRSCategory.SELLING_EXPENSES,
    },
  });

  // ===================================
  // 5. ACCOUNTING CONFIGURATION
  // ===================================
  console.log('⚙️  Creating AccountingConfiguration...');
  await prisma.accountingConfiguration.create({
    data: {
      economicGroupId: group.id,
      allowEntriesInClosedPeriod: false,
      requireGlobalApproval: false,
      minimumApprovalAmount: 50000.00,
      allowUnbalancedEntries: false,
      amountDecimals: 2,
      exchangeRateDecimals: 4,
    },
  });

  // ===================================
  // 6. USERS
  // ===================================
  console.log('👥 Creating Users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@pragmatic.com.uy',
      name: 'System Administrator',
      authProviderId: 'clerk_admin_123',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@pragmatic.com.uy',
      name: 'María Rodríguez',
      authProviderId: 'clerk_accountant_456',
    },
  });

  const operator = await prisma.user.create({
    data: {
      email: 'operations@pragmatic.com.uy',
      name: 'Juan Pérez',
      authProviderId: 'clerk_operator_789',
    },
  });

  // Permissions
  await prisma.userGroup.create({
    data: {
      userId: admin.id,
      economicGroupId: group.id,
      role: Role.ADMIN,
    },
  });

  await prisma.userGroup.create({
    data: {
      userId: accountant.id,
      economicGroupId: group.id,
      role: Role.ACCOUNTANT,
    },
  });

  await prisma.userGroup.create({
    data: {
      userId: operator.id,
      economicGroupId: group.id,
      role: Role.OPERATOR,
    },
  });

  // ===================================
  // 7. CUSTOMERS
  // ===================================
  console.log('🤝 Creating Customers...');
  const customer1 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'Ministry of Economy and Finance',
      rut: '211266530012',
      email: 'procurement@mef.gub.uy',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'Bank of the Oriental Republic of Uruguay',
      rut: '217003530018',
      email: 'systems@brou.com.uy',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'TechCorp Solutions SA',
      rut: '218765430019',
      email: 'admin@techcorp.com.uy',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      economicGroupId: group.id,
      name: 'Global Innovations Inc',
      rut: 'US-987654321',
      email: 'procurement@globalinnovations.com',
    },
  });

  // ===================================
  // 8. SUPPLIERS
  // ===================================
  console.log('📦 Creating Suppliers...');
  const supplier1 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Amazon Web Services (AWS)',
      rut: 'US-AWS123456',
      email: 'billing@aws.amazon.com',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Microsoft Azure',
      rut: 'US-MSFT789012',
      email: 'billing@azure.microsoft.com',
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Antel Telecommunications',
      rut: '210360090018',
      email: 'business@antel.com.uy',
    },
  });

  const supplier4 = await prisma.supplier.create({
    data: {
      economicGroupId: group.id,
      name: 'Rodríguez & Associates Accounting Firm',
      rut: '219876540015',
      email: 'contact@accountants.com.uy',
    },
  });

  // ===================================
  // 9. EXCHANGE RATES
  // ===================================
  console.log('💱 Creating ExchangeRates...');
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 0.5; // ±0.25
    const rate = 40.50 + variation;

    await prisma.exchangeRate.create({
      data: {
        economicGroupId: group.id,
        date: date,
        sourceCurrency: 'USD',
        targetCurrency: 'UYU',
        rate: rate,
        source: 'BCU',
      },
    });
  }

  // ===================================
  // 10. ACCOUNTING PERIODS
  // ===================================
  console.log('📅 Creating AccountingPeriods...');

  // Fiscal year 2024 (closed)
  await prisma.accountingPeriod.create({
    data: {
      economicGroupId: group.id,
      type: PeriodType.FISCAL_YEAR,
      fiscalYear: 2024,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      closed: true,
      closedAt: new Date('2025-01-15'),
      closedBy: accountant.id,
    },
  });

  // Months 2024 (closed)
  for (let month = 1; month <= 12; month++) {
    const startDate = new Date(2024, month - 1, 1);
    const endDate = new Date(2024, month, 0);
    await prisma.accountingPeriod.create({
      data: {
        economicGroupId: group.id,
        type: PeriodType.MONTH,
        fiscalYear: 2024,
        month: month,
        startDate: startDate,
        endDate: endDate,
        closed: true,
        closedAt: new Date(2024, month, 5),
        closedBy: accountant.id,
      },
    });
  }

  // Fiscal year 2025 (open)
  await prisma.accountingPeriod.create({
    data: {
      economicGroupId: group.id,
      type: PeriodType.FISCAL_YEAR,
      fiscalYear: 2025,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      closed: false,
    },
  });

  // Months 2025 (open until October, November open)
  for (let month = 1; month <= 11; month++) {
    const startDate = new Date(2025, month - 1, 1);
    const endDate = new Date(2025, month, 0);
    await prisma.accountingPeriod.create({
      data: {
        economicGroupId: group.id,
        type: PeriodType.MONTH,
        fiscalYear: 2025,
        month: month,
        startDate: startDate,
        endDate: endDate,
        closed: month <= 10, // Closed until October
        closedAt: month <= 10 ? new Date(2025, month, 5) : null,
        closedBy: month <= 10 ? accountant.id : null,
      },
    });
  }

  // ===================================
  // 11. JOURNAL ENTRIES
  // ===================================
  console.log('📝 Creating JournalEntries...');

  // ENTRY 1: Opening - Share capital contribution
  const entry1 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 1,
      date: new Date('2025-01-02'),
      description: 'Opening - Share Capital Contribution',
      type: EntryType.OPENING,
      status: EntryStatus.CONFIRMED,
      createdBy: admin.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry1.id,
        accountId: bankBROUMN.id,
        debit: 1000000.00,
        credit: 0,
        currency: 'UYU',
        accountCode: bankBROUMN.code,
        accountName: bankBROUMN.name,
        accountType: AccountType.ASSET,
      },
      {
        entryId: entry1.id,
        accountId: shareCapital.id,
        debit: 0,
        credit: 1000000.00,
        currency: 'UYU',
        accountCode: shareCapital.code,
        accountName: shareCapital.name,
        accountType: AccountType.EQUITY,
      },
    ],
  });

  // ENTRY 2: Sales invoice to customer
  const entry2 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 2,
      date: new Date('2025-11-05'),
      description: 'Invoice 001-0123 - TechCorp Solutions SA - Development services',
      type: EntryType.JOURNAL,
      status: EntryStatus.CONFIRMED,
      createdBy: operator.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry2.id,
        accountId: localCustomers.id,
        debit: 122000.00, // 100000 + 22% VAT
        credit: 0,
        currency: 'UYU',
        auxiliaryType: AuxiliaryType.CUSTOMER,
        auxiliaryId: customer3.id,
        auxiliaryName: customer3.name,
        accountCode: localCustomers.code,
        accountName: localCustomers.name,
        accountType: AccountType.ASSET,
        note: 'Report module development - 40 hours',
      },
      {
        entryId: entry2.id,
        accountId: serviceRevenue.id,
        debit: 0,
        credit: 100000.00,
        currency: 'UYU',
        accountCode: serviceRevenue.code,
        accountName: serviceRevenue.name,
        accountType: AccountType.INCOME,
      },
      {
        entryId: entry2.id,
        accountId: vatTaxDebt.id,
        debit: 0,
        credit: 22000.00,
        currency: 'UYU',
        accountCode: vatTaxDebt.code,
        accountName: vatTaxDebt.name,
        accountType: AccountType.LIABILITY,
        note: '22% VAT on services',
      },
    ],
  });

  // ENTRY 3: Supplier payment (AWS)
  const entry3 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 3,
      date: new Date('2025-11-10'),
      description: 'AWS Payment - October 2025 Invoice',
      type: EntryType.JOURNAL,
      status: EntryStatus.CONFIRMED,
      createdBy: operator.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry3.id,
        accountId: cloudServicesCost.id,
        debit: 950.00,
        credit: 0,
        currency: 'USD',
        exchangeRate: 40.50,
        auxiliaryType: AuxiliaryType.SUPPLIER,
        auxiliaryId: supplier1.id,
        auxiliaryName: supplier1.name,
        accountCode: cloudServicesCost.code,
        accountName: cloudServicesCost.name,
        accountType: AccountType.EXPENSE,
        note: 'Cloud services October 2025',
      },
      {
        entryId: entry3.id,
        accountId: bankBROUUSD.id,
        debit: 0,
        credit: 950.00,
        currency: 'USD',
        exchangeRate: 40.50,
        accountCode: bankBROUUSD.code,
        accountName: bankBROUUSD.name,
        accountType: AccountType.ASSET,
      },
    ],
  });

  // ENTRY 4: Salary payment
  const entry4 = await prisma.journalEntry.create({
    data: {
      economicGroupId: group.id,
      companyId: companyUY.id,
      number: 4,
      date: new Date('2025-11-01'),
      description: 'October 2025 Salary Payment',
      type: EntryType.JOURNAL,
      status: EntryStatus.CONFIRMED,
      createdBy: accountant.id,
    },
  });

  await prisma.entryLine.createMany({
    data: [
      {
        entryId: entry4.id,
        accountId: administrativeSalaries.id,
        debit: 180000.00,
        credit: 0,
        currency: 'UYU',
        accountCode: administrativeSalaries.code,
        accountName: administrativeSalaries.name,
        accountType: AccountType.EXPENSE,
        note: 'Administrative team salaries October',
      },
      {
        entryId: entry4.id,
        accountId: bankBROUMN.id,
        debit: 0,
        credit: 180000.00,
        currency: 'UYU',
        accountCode: bankBROUMN.code,
        accountName: bankBROUMN.name,
        accountType: AccountType.ASSET,
      },
    ],
  });

  // ===================================
  // 12. OBLIGATIONS
  // ===================================
  console.log('📋 Creating Obligations...');

  // OBLIGATION 1: Microsoft licenses purchase in 6 installments
  const obligation1 = await prisma.obligation.create({
    data: {
      economicGroupId: group.id,
      type: ObligationType.PAYABLE,
      description: 'Microsoft 365 licenses purchase - 20 users - Annual plan',
      totalAmount: 2400.00,
      currency: 'USD',
      issueDate: new Date('2025-11-01'),
      auxiliaryType: AuxiliaryType.SUPPLIER,
      auxiliaryId: supplier2.id,
      status: ObligationStatus.ACTIVE,
    },
  });

  // Create 6 installments of 400 USD each
  for (let i = 1; i <= 6; i++) {
    const dueDate = new Date('2025-11-01');
    dueDate.setMonth(dueDate.getMonth() + i);

    await prisma.obligationInstallment.create({
      data: {
        obligationId: obligation1.id,
        installmentNumber: i,
        dueDate: dueDate,
        amount: 400.00,
        status: i === 1 ? InstallmentStatus.PAID : InstallmentStatus.PENDING,
        paidAmount: i === 1 ? 400.00 : 0,
      },
    });
  }

  // First installment payment
  await prisma.obligationPayment.create({
    data: {
      obligationId: obligation1.id,
      installmentId: (await prisma.obligationInstallment.findFirst({
        where: { obligationId: obligation1.id, installmentNumber: 1 }
      }))!.id,
      paymentDate: new Date('2025-11-15'),
      amount: 400.00,
      currency: 'USD',
      exchangeRate: 40.50,
      notes: 'First installment payment Microsoft 365',
    },
  });

  // OBLIGATION 2: Customer invoice at 30, 60, 90 days
  const obligation2 = await prisma.obligation.create({
    data: {
      economicGroupId: group.id,
      type: ObligationType.RECEIVABLE,
      description: 'Management system development project - BROU',
      totalAmount: 300000.00,
      currency: 'UYU',
      issueDate: new Date('2025-10-01'),
      auxiliaryType: AuxiliaryType.CUSTOMER,
      auxiliaryId: customer2.id,
      status: ObligationStatus.ACTIVE,
    },
  });

  // Create 3 installments
  const installment1Date = new Date('2025-10-31'); // 30 days
  const installment2Date = new Date('2025-11-30'); // 60 days
  const installment3Date = new Date('2025-12-30'); // 90 days

  await prisma.obligationInstallment.createMany({
    data: [
      {
        obligationId: obligation2.id,
        installmentNumber: 1,
        dueDate: installment1Date,
        amount: 100000.00,
        status: InstallmentStatus.PAID,
        paidAmount: 100000.00,
      },
      {
        obligationId: obligation2.id,
        installmentNumber: 2,
        dueDate: installment2Date,
        amount: 100000.00,
        status: InstallmentStatus.PENDING,
      },
      {
        obligationId: obligation2.id,
        installmentNumber: 3,
        dueDate: installment3Date,
        amount: 100000.00,
        status: InstallmentStatus.PENDING,
      },
    ],
  });

  // First installment payment
  await prisma.obligationPayment.create({
    data: {
      obligationId: obligation2.id,
      installmentId: (await prisma.obligationInstallment.findFirst({
        where: { obligationId: obligation2.id, installmentNumber: 1 }
      }))!.id,
      paymentDate: new Date('2025-11-05'),
      amount: 100000.00,
      currency: 'UYU',
      notes: 'First installment collection BROU project',
    },
  });

  // ===================================
  // 13. ENTRY TEMPLATES
  // ===================================
  console.log('📝 Creating Templates...');
  await prisma.entryTemplate.createMany({
    data: [
      {
        economicGroupId: group.id,
        name: 'Sales Invoice - Services',
        description: 'Template for recording service sales with VAT',
        type: EntryType.JOURNAL,
        requiresApproval: false,
      },
      {
        economicGroupId: group.id,
        name: 'Monthly Salary Payment',
        description: 'Template for monthly salary payment',
        type: EntryType.JOURNAL,
        requiresApproval: true,
      },
      {
        economicGroupId: group.id,
        name: 'Supplier Payment',
        description: 'Template for supplier payments',
        type: EntryType.JOURNAL,
        requiresApproval: false,
      },
      {
        economicGroupId: group.id,
        name: 'Exchange Rate Adjustment',
        description: 'Template for exchange difference adjustments',
        type: EntryType.EXCHANGE_ADJUSTMENT,
        requiresApproval: true,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Data created:');
  console.log(`   - 1 Economic Group`);
  console.log(`   - 2 Companies (UY and US)`);
  console.log(`   - 1 Chart of Accounts with ${await prisma.account.count()} accounts`);
  console.log(`   - 3 Users with permissions`);
  console.log(`   - 4 Customers`);
  console.log(`   - 4 Suppliers`);
  console.log(`   - 31 Exchange rates (last 31 days)`);
  console.log(`   - 26 Accounting periods (2024 and 2025)`);
  console.log(`   - 4 Journal entries with lines`);
  console.log(`   - 2 Obligations with installments and payments`);
  console.log(`   - 4 Entry templates`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
