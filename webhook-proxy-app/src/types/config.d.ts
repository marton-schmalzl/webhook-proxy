export interface EndpointConfig {
  url: string;
  method: string;
  requiresResponse: boolean;
}

export interface Config {
  endpoints: {
    [key: string]: EndpointConfig;
  };
  retryMaxRetries: number;
  retryDelay: number;
  port?: number;
  amqp: AmqpConfig;
  logLevel: string;
}

export interface AmqpConfig {
  url: string;
  queueName: string;
}
