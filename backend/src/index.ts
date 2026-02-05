import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prisma } from './lib/prisma';
import { logger } from './lib/logger';
import { config, corsOptions, rateLimitOptions } from './lib/config';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { economicGroupsRoutes } from './routes/economic-groups.routes';
import { companiesRoutes } from './routes/companies.routes';
import { accountsRoutes } from './routes/accounts.routes';
import { accountingPeriodsRoutes } from './routes/accounting-periods.routes';
import { customersRoutes } from './routes/customers.routes';
import { suppliersRoutes } from './routes/suppliers.routes';
import { exchangeRatesRoutes } from './routes/exchange-rates.routes';
import { userCompaniesRoutes } from './routes/user-companies.routes';
import { chartsOfAccountsRoutes } from './routes/charts-of-accounts.routes';
import { currenciesRoutes } from './routes/currencies.routes';

/**
 * KontaFlow API Server
 *
 * Sistema de contabilidad con partida doble
 * Arquitectura por capas: Routes → Services → Repositories → Prisma
 */

const fastify = Fastify({
  logger: logger as any,
  requestIdHeader: 'x-request-id',
  trustProxy: true,
});

// ===================================
// PLUGINS
// ===================================
async function registerPlugins() {
  // CORS
  await fastify.register(cors, corsOptions);

  // Helmet - Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Deshabilitado para desarrollo
  });

  // Rate Limiting
  await fastify.register(rateLimit, rateLimitOptions);

  logger.info('✅ Plugins registered');
}

// ===================================
// MIDDLEWARE
// ===================================
async function registerMiddleware() {
  // Error handler global
  fastify.setErrorHandler(errorHandler);

  // 404 handler
  fastify.setNotFoundHandler(notFoundHandler);

  logger.info('✅ Middleware registered');
}

// ===================================
// ROUTES
// ===================================
async function registerRoutes() {
  // Health check
  fastify.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: config.NODE_ENV,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        environment: config.NODE_ENV,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'KontaFlow API',
      version: '1.0.0',
      status: 'running',
      environment: config.NODE_ENV,
      endpoints: {
        health: '/health',
        api: '/api',
        docs: '/docs (próximamente)',
      },
    };
  });

  // API Routes (no versioning for now, later will be /api/v1)
  await fastify.register(
    async (instance) => {
      // Economic Groups
      await instance.register(economicGroupsRoutes, { prefix: '/economic-groups' });

      // Companies
      await instance.register(companiesRoutes, { prefix: '/companies' });

      // Charts of Accounts
      await instance.register(chartsOfAccountsRoutes, { prefix: '/charts-of-accounts' });

      // Accounts
      await instance.register(accountsRoutes, { prefix: '/accounts' });

      // Accounting Periods
      await instance.register(accountingPeriodsRoutes, { prefix: '/accounting-periods' });

      // Customers
      await instance.register(customersRoutes, { prefix: '/customers' });

      // Suppliers
      await instance.register(suppliersRoutes, { prefix: '/suppliers' });

      // Currencies
      await instance.register(currenciesRoutes, { prefix: '/currencies' });

      // Exchange Rates
      await instance.register(exchangeRatesRoutes, { prefix: '/exchange-rates' });

      // User Companies
      await instance.register(userCompaniesRoutes, { prefix: '/user-companies' });

      // TODO: More features
      // await instance.register(entriesRoutes, { prefix: '/entries' });
    },
    { prefix: '/api' }
  );

  logger.info('✅ Routes registered');
}

// ===================================
// START SERVER
// ===================================
async function start() {
  try {
    await registerPlugins();
    await registerMiddleware();
    await registerRoutes();

    await fastify.listen({
      port: config.PORT,
      host: config.HOST,
    });

    logger.info('');
    logger.info('🚀 KontaFlow API Server Started');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`📍 Server: http://${config.HOST}:${config.PORT}`);
    logger.info(`🏥 Health: http://${config.HOST}:${config.PORT}/health`);
    logger.info(`🔧 Environment: ${config.NODE_ENV}`);
    logger.info(`🗄️  Database: Connected`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('');
    logger.info('📋 Available Endpoints:');
    logger.info('   Economic Groups:');
    logger.info('   GET    /api/economic-groups           - List groups');
    logger.info('   GET    /api/economic-groups/my-groups - My groups');
    logger.info('   GET    /api/economic-groups/:id       - Get group');
    logger.info('   POST   /api/economic-groups           - Create group');
    logger.info('   PUT    /api/economic-groups/:id       - Update group');
    logger.info('   DELETE /api/economic-groups/:id       - Delete group');
    logger.info('');
    logger.info('   Companies:');
    logger.info('   GET    /api/companies                       - List companies');
    logger.info('   GET    /api/companies/by-group/:groupId     - Companies by group');
    logger.info('   GET    /api/companies/:id                   - Get company');
    logger.info('   POST   /api/companies                       - Create company');
    logger.info('   PUT    /api/companies/:id                   - Update company');
    logger.info('   DELETE /api/companies/:id                   - Delete company');
    logger.info('');
    logger.info('   Accounts:');
    logger.info('   GET    /api/accounts                        - List accounts');
    logger.info('   GET    /api/accounts/tree/:chartId          - Get account tree');
    logger.info('   GET    /api/accounts/by-chart/:chartId      - Accounts by chart');
    logger.info('   GET    /api/accounts/:id                    - Get account');
    logger.info('   POST   /api/accounts                        - Create account');
    logger.info('   PUT    /api/accounts/:id                    - Update account');
    logger.info('   DELETE /api/accounts/:id                    - Delete account');
    logger.info('');
    logger.info('   Accounting Periods:');
    logger.info('   GET    /api/accounting-periods                       - List periods');
    logger.info('   GET    /api/accounting-periods/by-group/:groupId     - Periods by group');
    logger.info('   GET    /api/accounting-periods/:id                   - Get period');
    logger.info('   POST   /api/accounting-periods                       - Create period');
    logger.info('   PUT    /api/accounting-periods/:id                   - Update period');
    logger.info('   POST   /api/accounting-periods/:id/close             - Close period');
    logger.info('   POST   /api/accounting-periods/:id/reopen            - Reopen period');
    logger.info('   DELETE /api/accounting-periods/:id                   - Delete period');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('');
    logger.info('💡 Tip: Use header "x-user-id: 1" for authentication in development');
    logger.info('');
  } catch (err) {
    console.error('❌ Error starting server:', err);
    logger.error({ err }, '❌ Error starting server');
    process.exit(1);
  }
}

// ===================================
// GRACEFUL SHUTDOWN
// ===================================
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, closing server gracefully...`);

  try {
    await fastify.close();
    await prisma.$disconnect();
    logger.info('✅ Server closed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
start();
