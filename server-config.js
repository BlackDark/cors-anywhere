const envParser = require('./envParser');

class ServerConfigurator {
  static getConfiguration() {
    const originBlacklist = envParser.parseArray("CORSANYWHERE_BLACKLIST", []);
    const originWhitelist = envParser.parseArray("CORSANYWHERE_WHITELIST", []);

    const wildCardOrigin = envParser.parseBoolean("CORSANYWHERE_WILDCARDORIGIN", true);
    const allowCredentials = envParser.parseBoolean("CORSANYWHERE_ALLOWCREDENTIALS", false);
    const httpsOptionXfwd = envParser.parseBoolean("CORSANYWHERE_HTTPSOPTIONS_XFWD", false);
    const handleRedirects = envParser.parseBoolean("CORSANYWHERE_HANDLE_REDIRECTS", false);

    const allowedMethods = envParser.parseArray("CORSANYWHERE_ALLOWEDMETHODS", []);
    const requireHeader = envParser.parseArray("CORSANYWHERE_REQUIREHEADER", []);
    const removeHeaders = envParser.parseArray("CORSANYWHERE_REMOVEREQUESTHEADERS", []);
    const removeReponseHeaders = envParser.parseArray("CORSANYWHERE_REMOVERESPONSEHEADERS", []);
    const redirectSameOrigin = envParser.parseBoolean("CORSANYWHERE_REDIRECTSAMEORIGIN", true);
    const maxRedirects = envParser.parseNumber("CORSANYWHERE_MAXREDIRECTS", 5);
    const disableTLSVerification = envParser.parseNumber("NODE_TLS_REJECT_UNAUTHORIZED", 1) === 0;

    const setRequestHeaders = envParser.parseObject("CORSANYWHERE_SETREQUESTHEADER", {});
    const setResponseHeaders = envParser.parseObject("CORSANYWHERE_SETRESPONSEHEADER", {});

    if (allowCredentials) {
      setResponseHeaders['Access-Control-Allow-Credentials'] = true;
    }

    const corsMaxAge = envParser.parseNumber("CORSANYWHERE_CORSMAXAGE", null);

    // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
    const checkRateLimit = process.env.CORSANYWHERE_RATELIMIT ? require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT) : null;

    return {
      allowedMethods: allowedMethods,
      // getProxyForUrl: getProxyForUrl, // TODO Check code if possible to modify
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
        xfwd: httpsOptionXfwd,
        secure: !disableTLSVerification,
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

module.exports = ServerConfigurator;
