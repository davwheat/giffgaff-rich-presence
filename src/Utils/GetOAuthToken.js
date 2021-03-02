const fetch = require('node-fetch');

const Config = require('../Config/config.json');
const Endpoints = require('../Config/endpoints');

const setCookie = require('set-cookie-parser');

const { URLSearchParams } = require('url');
const DebugLog = require('./DebugLog');

// Gets OAuth token using giffgaff app token as authorisation
//
// MUST be refreshed at least every 12 hours
async function GetOAuthToken() {
  const Body = new URLSearchParams();

  Body.append('scope', 'read');
  Body.append('grant_type', 'password');
  Body.append('username', Config.membername);
  Body.append('password', Config.password);

  DebugLog('Using specified oauth token ' + Config.oauthToken.substr(0, 16) + '...');
  DebugLog('Contacting OAuth endpoint: ' + Endpoints.oauth);

  const response = await fetch(Endpoints.oauth, {
    method: 'POST',
    body: Body,
    headers: {
      authorization: Config.oauthToken,
      accept: 'application/json',
    },
  });

  DebugLog('Response received');
  if (response.ok) DebugLog('Response OK');

  // console.log(await response.clone().text());

  DebugLog('Saving cookies...');
  const cookies = setCookie.parse(await response.headers.get('set-cookie'));

  const cs = cookies.reduce((cookieString, cookie) => {
    return cookieString + `${cookie.name}=${cookie.value};`;
  }, '');
  DebugLog('Done!');

  const responseJson = await response.json();
  return {
    token: responseJson.access_token,
    cookies: cs,
  };
}

module.exports = GetOAuthToken;
