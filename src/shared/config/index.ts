/**
 * Export centralisé de toutes les configurations
 */

export { apiKeysConfig } from './api-keys.config';
export { envConfig } from './env.config';
export { ROUTES, getPropertyDetailRoute, getContractDetailRoute, getScheduleVisitRoute, getCreateContractRoute, getApplicationFormRoute } from './routes.config';
export { APP_CONFIG } from './app.config';

export default {
  apiKeys: apiKeysConfig,
  env: envConfig,
  routes: ROUTES,
  app: APP_CONFIG,
};
