const fs = require('fs');
require.extensions['.graphql'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const refreshCreditQuery = require('../GraphQL/refreshCredit.graphql');

const { default: fetch } = require('node-fetch');
const Endpoints = require('../Config/endpoints');

const Member = require('../Classes/Member');

async function RefreshCredit(oauthToken) {
  const Request = [{ operationName: 'refreshCreditData', query: refreshCreditQuery, variables: {} }];

  if (Config.debug) console.log('[D] Preparing GraphQL operation "' + Request[0].operationName + '"');
  if (Config.debug) console.log('[D] Contacting endpoint: ' + Endpoints.main);
  if (Config.debug) console.log('[D] Using member token...');

  const response = await fetch(Endpoints.main, {
    method: 'POST',
    body: JSON.stringify(Request),
    headers: {
      authorization: `Bearer ${oauthToken}`,
      'content-type': 'application/json',
      accept: '*/*',
    },
  });

  if ((await response.clone().text()).includes('Incapsula')) {
    console.log('INCAPSULA IS A CUNT!');
    return null;
  }

  const responseJson = await response.json();

  const memberData = responseJson[0].data.member;

  if (Config.debug) console.log('[D] Creating instance of Member class with returned data...');
  return new Member(memberData.id, memberData.memberName, memberData.credit);
}

module.exports = RefreshCredit;
