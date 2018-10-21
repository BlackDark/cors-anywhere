const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.CORSANYWHERE_LOGLEVEL,
  transports: [
    new winston.transports.Console(),
  ]
});

class EnvParser {
  static parseBoolean(envName, defaultValue) {
    const envValue = process.env[envName];

    if (!envValue) {
      return defaultValue;
    }

    const lowerCaseEnv = envValue.toLowerCase();

    if (['true', 'false'].indexOf(lowerCaseEnv) === -1) {
      logger.warn(`Invalid boolean value for env variable: ${envName}. Use default fallback`);
      return defaultValue;
    }

    return lowerCaseEnv === 'true';
  }

  static parseNumber(envName, defaultValue) {
    const envValue = process.env[envName];

    if (!envValue) {
      return defaultValue;
    }

    return +envValue;

  }

  static parseArray(envName, defaultValue) {
    return EnvParser.parseObject(envName, defaultValue);
  }

  static parseObject(envName, defaultValue) {
    const envValue = process.env[envName];

    if (!envValue) {
      return defaultValue;
    }

    return JSON.parse(envValue);

  }
}

module.exports = EnvParser;
