class EnvLoader {
  static loadEnv() {
    const path = require('path');

    require('dotenv').config({
      //debug: parseEnvBool('DEBUG', false) || false,
      path: path.resolve(process.cwd(), process.env.ENV_FILE || '.env'),
    });
  }

  static loadEnvRelativeFilepath(filePath) {
    const path = require('path');

    require('dotenv').config({
      //debug: parseEnvBool('DEBUG', false) || false,
      path: path.resolve(process.cwd(), filePath),
    });
  }

  static loadEnvAbsoluteFilePath(absoluteFilePath) {
    require('dotenv').config({
      //debug: parseEnvBool('DEBUG', false) || false,
      path: absoluteFilePath,
    });
  }
}

module.exports = EnvLoader;
