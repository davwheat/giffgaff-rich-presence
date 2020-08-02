const fetch = require('node-fetch');

const Config = require('../Config/config.json');
const Endpoints = require('../Config/endpoints');

const setCookie = require('set-cookie-parser');

const { URLSearchParams } = require('url');

// Gets OAuth token using giffgaff app token as authorisation
//
// MUST be refreshed at least every 12 hours
async function GetOAuthToken() {
  const Body = new URLSearchParams();

  Body.append('scope', 'read');
  Body.append('grant_type', 'password');
  Body.append('username', Config.membername);
  Body.append('password', Config.password);

  if (Config.debug) console.log('[D] Using specified oauth token ' + Config.oauthToken.substr(0, 16) + '...');
  if (Config.debug) console.log('[D] Contacting OAuth endpoint: ' + Endpoints.oauth);

  const response = await fetch(Endpoints.oauth, {
    method: 'POST',
    body: Body,
    headers: {
      authorization: Config.oauthToken,
      accept: 'application/json',
    },
  });

  if (Config.debug) console.log('[D] Response received');
  if (response.ok && Config.debug) console.log('[D] Response OK');

  // console.log(await response.clone().text());

  if (Config.debug) console.log('[D] Saving cookies...');
  const cookies = setCookie.parse(await response.headers.get('set-cookie'));

  const cs = cookies.reduce((cookieString, cookie) => {
    return cookieString + `${cookie.name}=${cookie.value};`;
  }, '');
  if (Config.debug) console.log('[D] Done!');

  const responseJson = await response.json();
  return {
    token: responseJson.access_token,
    cookies: cs,
  };
}

module.exports = GetOAuthToken;
