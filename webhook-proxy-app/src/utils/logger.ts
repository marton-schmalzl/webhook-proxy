import winston from 'winston';
import loadConfig from './loadConfig';


const logger = winston.createLogger({
  level: loadConfig().logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
