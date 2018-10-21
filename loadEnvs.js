const path = require('path');

require('dotenv').config({
  //debug: parseEnvBool('DEBUG', false) || false,
  path: path.resolve(process.cwd(), process.env.ENV_FILE || '.env'),
});

function parseEnvBool(envName, defaultValue) {
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
