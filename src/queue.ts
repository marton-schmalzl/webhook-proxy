import * as amqp from 'amqplib';
import { Channel } from 'amqplib';

const setupQueue = async (): Promise<Channel> => {
  const maxRetries: number = 10;
  let retryCount: number = 0;

  while (retryCount < maxRetries) {
    try {
      const connection = await amqp.connect('amqp://localhost');
      const channel: Channel = await connection.createChannel();
      await channel.assertQueue('webhook_queue', { durable: false });
      console.log('Connected to RabbitMQ');
      return channel;
    } catch (error: any) {
      console.error(`Failed to connect to RabbitMQ (attempt ${retryCount + 1}):`, error.message);
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
    }
  }

  console.error('Failed to connect to RabbitMQ after multiple retries.');
  process.exit(1);
};

import loadConfig from './config';
import processWebhook from './webhook';

const consume = async (channel: Channel) => {
  const config = loadConfig();
  const queueName = 'webhook_queue';

  try {
    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const messageContent = msg.content.toString();
          console.log(`Received message: ${messageContent}`);

          const message = JSON.parse(messageContent);
          const { endpointKey, payload } = message;

          if (!endpointKey) {
            throw new Error('endpointKey is required in message');
          }

          await processWebhook(endpointKey, payload);
          channel.ack(msg); // Acknowledge message after successful processing
        } catch (error: any) {
          console.warn(`Error processing message: ${error.message}`);

          // Retry mechanism
          const retryCount = (msg.properties && msg.properties.headers && msg.properties.headers['retryCount']) || 0;
          const maxRetries = config.retryMaxRetries;
          if (retryCount < maxRetries) {
            const delay = config.retryDelay * (retryCount + 1); // Exponential backoff
            console.log(`Retrying message in ${delay}ms (retry count: ${retryCount + 1})`);

            setTimeout(() => {
              channel.nack(msg, false, false); // Reject message and don't requeue immediately
              channel.sendToQueue(queueName, msg.content, {
                headers: { 'retryCount': retryCount + 1 }
              });
            }, delay);
          } else {
            console.error(`Message failed after ${maxRetries} retries. Discarding.`);
            channel.ack(msg); // Acknowledge message to remove it from the queue
          }
        }
      }
    }, { noAck: false });
    console.log(`Listening for messages on queue: ${queueName}`);
  } catch (error: any) {
    console.error(`Error consuming messages: ${error.message}`);
  }
};

export { setupQueue, consume };
