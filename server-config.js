const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.CORSANYWHERE_LOGLEVEL,
  transports: [
    new winston.transports.Console(),
  ]
});


class ServerConfigurator {

  static getConfiguration() {
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

    const corsMaxAge = process.env.CORSANYWHERE_CORSMAXAGE ? +process.env.CORSANYWHERE_CORSMAXAGE : null;

    let checkRateLimit = null;

    if (process.env.CORSANYWHERE_RATELIMIT) {
      // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
      checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);
    }

    return {
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
        //selfHandleResponse : true,
      },
      // TODO this has to be validated see cors-anywhere#L441
      //httpsProxyOptions: {},
      setHeaders: setRequestHeaders,
      setResponseHeaders: setResponseHeaders,
      wildcardOrigin: wildCardOrigin,
      corsMaxAge: corsMaxAge,
    };
  }
}


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

module.exports = ServerConfigurator;