import axios, { AxiosResponse } from 'axios';
import { EndpointConfig } from './types/config';
import loadConfig from './utils/loadConfig';
import { IncomingHttpHeaders } from 'http';
import { Params } from 'express-serve-static-core';
import logger from './utils/logger';

const config = loadConfig();

const processWebhook = async (endpointKey: string, payload: any, incomingParams: Params, incomingHeaders: IncomingHttpHeaders): Promise<any> => {
  const endpoint: EndpointConfig | undefined = config.endpoints[endpointKey];

  if (!endpoint) {
    logger.error(`Endpoint ${endpointKey} not found`);
    return;
  }

  try {
    const response: AxiosResponse<any> = await axios({
      method: endpoint.method,
      url: endpoint.url,
      data: payload,
      params: { ...incomingParams, }, // Forward request parameters
      headers: { ...incomingHeaders }, // Forward headers
    });
    logger.info(`Webhook ${endpointKey} processed successfully`);
    return response.data;
  } catch (error: any) {
    logger.warn(`Failed to process webhook ${endpointKey}:`, error.message);
    throw error;
  }
};

export default processWebhook;
