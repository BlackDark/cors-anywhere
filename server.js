require('./envLoader').loadEnv();
const envParser = require('./envParser');

const syswidecas = require('syswide-cas');
syswidecas.addCAs(envParser.parseArray("CORSANYWHERE_CUSTOMCAFOLDERS", []));
syswidecas.addCAs(envParser.parseArray("CORSANYWHERE_CUSTOMCAFILESS", []));

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT || 8080;


// Server is configured with ENVs. See server-config.js
require('./lib/cors-anywhere').createServer().listen(port, host, function () {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
