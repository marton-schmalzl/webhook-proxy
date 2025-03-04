import axios, { AxiosResponse } from 'axios';
import { EndpointConfig } from './types/config';
import loadConfig from './config';

const config = loadConfig();

const processWebhook = async (endpointKey: string, payload: any): Promise<any> => {
  const endpoint: EndpointConfig | undefined = config.endpoints[endpointKey];

  if (!endpoint) {
    console.error(`Endpoint ${endpointKey} not found`);
    return;
  }

  try {
    const response: AxiosResponse<any> = await axios({
      method: endpoint.method,
      url: endpoint.url,
      data: payload,
    });
    console.log(`Webhook ${endpointKey} processed successfully`);
    return response.data;
  } catch (error: any) {
    console.warn(`Failed to process webhook ${endpointKey}:`, error.message);
    throw error;
  }
};

export default processWebhook;
