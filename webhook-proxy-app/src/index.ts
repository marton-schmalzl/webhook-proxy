import express from 'express';
import { setupApp, startQueue } from './app';
import loadConfig from './config';
import logger from './utils/logger';

const config = loadConfig();
const app = express();

const startServer = async () => {
  setupApp(app);
  startQueue();

  const port: number = config.port || 3000;
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
};

startServer();
