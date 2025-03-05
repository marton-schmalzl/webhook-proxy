import config from 'config';
import { Config } from '../types/config';

const loadConfig = (): Config => {
  const appConfig = config.get<Config>('appConfig');

  return {
    ...appConfig,
  };
};

export default loadConfig;
