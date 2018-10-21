const path = require('path');

require('dotenv').config({
  debug: parseEnvBool('DEBUG', false) || false,
  path: path.resolve(process.cwd(), process.env.ENV_FILE || '.env'),
});

const syswidecas = require('syswide-cas');
syswidecas.addCAs(parseEnvArray(process.env.CORSANYWHERE_CUSTOMCAFOLDERS));
syswidecas.addCAs(parseEnvArray(process.env.CORSANYWHERE_CUSTOMCAFILESS));

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

const wildCardOrigin = process.env.CORSANYWHERE_WILDCARDORIGIN ? process.env.CORSANYWHERE_WILDCARDORIGIN.toLowerCase() === 'true' : true;
const allowCredentials = process.env.CORSANYWHERE_ALLOWCREDENTIALS ? process.env.CORSANYWHERE_ALLOWCREDENTIALS.toLowerCase() === 'true' : false;
const httpsOptionXfwd = process.env.CORSANYWHERE_HTTPSOPTIONS_XFWD ? process.env.CORSANYWHERE_HTTPSOPTIONS_XFWD.toLowerCase() === 'true' : false;
const handleRedirects = process.env.CORSANYWHERE_HANDLE_REDIRECTS ? process.env.CORSANYWHERE_HANDLE_REDIRECTS.toLowerCase() === 'true' : true;

const allowedMethods = process.env.CORSANYWHERE_ALLOWEDMETHODS ? parseEnvArray(process.env.CORSANYWHERE_ALLOWEDMETHODS) : [];
const requireHeader = process.env.CORSANYWHERE_REQUIREHEADER ? parseEnvArray(process.env.CORSANYWHERE_REQUIREHEADER) : [];
const removeHeaders = process.env.CORSANYWHERE_REMOVEREQUESTHEADERS ? parseEnvArray(process.env.CORSANYWHERE_REMOVEREQUESTHEADERS) : [];
const removeReponseHeaders = process.env.CORSANYWHERE_REMOVERESPONSEHEADERS ? parseEnvArray(process.env.CORSANYWHERE_REMOVERESPONSEHEADERS) : [];
const redirectSameOrigin = process.env.CORSANYWHERE_REDIRECTSAMEORIGIN ? process.env.CORSANYWHERE_REDIRECTSAMEORIGIN.toLowerCase() === 'true' : true;
const maxRedirects = process.env.CORSANYWHERE_MAXREDIRECTS ? +process.env.CORSANYWHERE_MAXREDIRECTS : 5;
const disableTLSVerification = process.env.NODE_TLS_REJECT_UNAUTHORIZED ? +process.env.NODE_TLS_REJECT_UNAUTHORIZED === 0 : false;

const setRequestHeaders = process.env.CORSANYWHERE_SETREQUESTHEADER ? parseEnvObject(process.env.CORSANYWHERE_SETREQUESTHEADER) : {};
const setResponseHeaders = process.env.CORSANYWHERE_SETRESPONSEHEADER ? parseEnvObject(process.env.CORSANYWHERE_SETRESPONSEHEADER) : {};

if (allowCredentials) {
  setResponseHeaders['Access-Control-Allow-Credentials'] = true;
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
const checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

const cors_proxy = require('./lib/cors-anywhere');

const serverConfig = {
  allowedMethods: allowedMethods,
  // getProxyForUrl: getProxyForUrl, // Check code if possible to modify
  handleRedirects: handleRedirects,
  maxRedirects: maxRedirects,
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  requireHeader: requireHeader,
  checkRateLimit: checkRateLimit,
  removeHeaders: removeHeaders,
  removeReponseHeaders: removeReponseHeaders,
  redirectSameOrigin: redirectSameOrigin,
  httpProxyOptions: {
    xfwd: httpsOptionXfwd, // Append X-Forwarded-* headers // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    secure: !disableTLSVerification,
  },
  setHeaders: setRequestHeaders,
  setResponseHeaders: setResponseHeaders,
  wildcardOrigin: wildCardOrigin,
};

console.log('Env: ', process.env);
console.log('Server configuration: ', serverConfig);

cors_proxy.createServer(serverConfig).listen(port, host, function () {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});

function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// TODO maybe processing all envs as JSON?
function parseEnvArray(env) {
  if (!env) {
    return [];
  }
  return JSON.parse(env);
}

function parseEnvObject(env) {
  if (!env) {
    return {};
  }
  return JSON.parse(env);
}
