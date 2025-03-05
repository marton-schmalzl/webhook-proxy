import express, { Request, Response } from 'express';
const amqp = require('amqplib');
import { Channel } from 'amqplib';

import loadConfig from './config';
import { setupQueue, consume } from './queue';
import processWebhook from './webhook';
import { ProxyMessage } from './types/internal_message';

const config = loadConfig();

let queueChannel: Channel | null = null;

export const setupApp = (app: express.Express) => {
  app.use(express.json());

  app.post('/:endpoint', async (req: Request, res: Response): Promise<void> => {
    const endpointKey: string = req.params.endpoint;
    const endpoint = config.endpoints[endpointKey];

    if (!endpoint) {
      res.status(404).send('Endpoint not found');
      return;
    }

    try {
      if (endpoint.requiresResponse) {
        const responseData = await processWebhook(endpointKey, req.body, req.params, req.headers);
        res.status(200).json(responseData);
      } else {
        if (!queueChannel) {
          console.error('Queue channel not initialized');
          res.status(500).send('Queue channel not initialized');
          return;
        }
        const msg: ProxyMessage = {endpointKey, body: req.body, params: req.params, headers: req.headers};
        queueChannel.sendToQueue('webhook_queue', Buffer.from(JSON.stringify(msg)));
        res.status(202).send('Accepted for processing');
      }
    } catch (error: unknown) {
      console.error(`Error processing ${endpointKey}:`, error);
      res.status(500).send('Internal Server Error');
    }
  });
};

export const startQueue = async () => {
  queueChannel = await setupQueue();
  consume(queueChannel);
};
