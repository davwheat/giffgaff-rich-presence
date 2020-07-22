const fs = require('fs');
require.extensions['.graphql'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const getMemberQuery = require('../GraphQL/getMember.graphql');

const { default: fetch } = require('node-fetch');
const Endpoints = require('../Config/endpoints');

const Member = require('../Classes/Member');

async function GetMember(oauthToken) {
  const Request = [{ operationName: 'getMember', query: getMemberQuery, variables: {} }];

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

  return new Member(memberData.id, memberData.memberName, memberData.credit);
}

module.exports = GetMember;
