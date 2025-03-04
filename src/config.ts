import config from 'config';
import { Config } from './types/config';


const loadConfig = (): Config => {
  return config.get<Config>('appConfig');
};

export default loadConfig;
