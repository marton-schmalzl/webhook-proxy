import * as amqp from 'amqplib';
import { Channel } from 'amqplib';
import { Request } from 'express';

const setupQueue = async (): Promise<Channel> => {
  const maxRetries: number = 10;
  let retryCount: number = 0;

  while (retryCount < maxRetries) {
    const config = loadConfig();
    const amqpConfig = config.amqp;
    const amqpUrl = amqpConfig.url;

    const queueName = amqpConfig.queueName;

    try {
      const connection = await amqp.connect(amqpUrl);
      const channel: Channel = await connection.createChannel();
      await channel.assertQueue(queueName, { durable: false });
      logger.info('Connected to RabbitMQ');
      return channel;
    } catch (error: any) {
      logger.error(`Failed to connect to RabbitMQ (attempt ${retryCount + 1}):`, error.message);
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
    }
  }

  logger.error('Failed to connect to RabbitMQ after multiple retries.');
  process.exit(1);
};

import loadConfig from './utils/loadConfig';
import processWebhook from './webhook';
import { ProxyMessage } from './types/internal_message';
import logger from './utils/logger';

const consume = async (channel: Channel) => {
  const config = loadConfig();
  const queueName = config.amqp.queueName;

  try {
    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const messageContent = msg.content.toString();
          logger.info(`Received message: ${messageContent}`);
          const req: ProxyMessage = JSON.parse(messageContent);

          if (!req.endpointKey) {
            throw new Error('endpointKey is required in message');
          }

          await processWebhook(req.endpointKey, req.body, req.params, req.headers);
          channel.ack(msg); // Acknowledge message after successful processing
        } catch (error: any) {
          logger.warn(`Error processing message: ${error.message}`);

          // Retry mechanism
          const retryCount = (msg.properties && msg.properties.headers && msg.properties.headers['retryCount']) || 0;
          const maxRetries = config.retryMaxRetries;
          if (retryCount < maxRetries) {
            const delay = config.retryDelay * (retryCount + 1); // Exponential backoff
            logger.info(`Retrying message in ${delay}ms (retry count: ${retryCount + 1})`);

            setTimeout(() => {
              channel.nack(msg, false, false); // Reject message and don't requeue immediately
              channel.sendToQueue(queueName, msg.content, {
                headers: { 'retryCount': retryCount + 1 }
              });
            }, delay);
          } else {
            logger.error(`Message failed after ${maxRetries} retries. Discarding.`);
            channel.ack(msg); // Acknowledge message to remove it from the queue
          }
        }
      }
    }, { noAck: false });
    logger.info(`Listening for messages on queue: ${queueName}`);
  } catch (error: any) {
    logger.error(`Error consuming messages: ${error.message}`);
  }
};

export { setupQueue, consume };
