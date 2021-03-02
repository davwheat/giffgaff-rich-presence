const GetMember = require('./Utils/GetMember');
const GetOAuthToken = require('./Utils/GetOAuthToken');
const DebugLog = require('./Utils/DebugLog');

console.log('Loading JSON data...');
const Config = require('./Config/config.json');
const Assets = require('./Config/assets.json');

DebugLog('Done!');

console.log('Initialising rich presence');

// should probably put this in the config
const client = require('discord-rich-presence')('735145438293786704');

console.log('Connected to Discord');
DebugLog('Connected with client ID ' + '735145438293786704');

async function Start() {
  console.log('Getting OAuth token...');

  let cookieString, oauthToken;

  let data = await GetOAuthToken();

  cookieString = data.cookies;
  oauthToken = data.token;

  console.log('OAuth token generated successfully!');

  DebugLog('Token: ' + oauthToken.substr(0, 16) + '...');

  setInterval(async () => {
    // refresh token every 8 hrs
    data = await GetOAuthToken();

    oauthToken = data.token;
    cookieString = data.cookie;

    console.log('OAuth token refreshed.');
    DebugLog('Refreshed token: ' + oauthToken.substr(0, 16) + '...');
  }, 1000 * 60 * 60 * 8);

  DebugLog('Getting member info...');
  let Member = await GetMember(oauthToken);
  DebugLog('Done!');

  if (Member === null) {
    console.log('Try again later');
    DebugLog('Maybe you were ratelimited or Imperva/Incapsula kicked in? Try again in an hour or restart your router.');

    client.disconnect();
    return;
  }

  // Update goodybag info
  setInterval(async () => {
    DebugLog('Refreshing member info...');
    Member = await GetMember(oauthToken);
    DebugLog('Done!');
    DebugLog('Refreshing rich presence (after new data fetched)');
    RefreshPresence(Member);
  }, 1000 * 60 * Config.refreshInterval);

  // Reset presence every 2 mins to prevent timeouts
  // setInterval(() => {
  //   DebugLog('Refreshing rich presence (to prevent RPC disconnects)');
  //   RefreshPresence(Member);
  // }, 1000 * 60 * 2);

  console.log('Setting initial presence');
  RefreshPresence(Member);
}

console.log(`Signing in to giffgaff as ${Config.membername}`);
Start();

function RefreshPresence(Member) {
  // let pctDataUsed = Math.round(
  //   (Member.currentGoodybag.usedAllowances.data.GB + Member.currentGoodybag.usedAllowances.reserve.GB) /
  //     (Member.currentGoodybag.allowances.data.GB + Member.currentGoodybag.allowances.reserve.GB)
  // );

  const hasActiveGoodybag = !!Member.currentGoodybag;
  const hasQueuedGoodybag = !!Member.nextGoodybag;

  let totalData = null,
    totalUsedData = null,
    totalRemainingData = null,
    remainingMB = null,
    dataUsage = null;

  if (hasActiveGoodybag) {
    totalData = Member.currentGoodybag.allowances.data.GB + Member.currentGoodybag.allowances.reserve.GB;
    totalUsedData = Math.round((Member.currentGoodybag.usedAllowances.data.GB + Member.currentGoodybag.usedAllowances.reserve.GB) * 100) / 100;
    totalRemainingData =
      Math.round((Member.currentGoodybag.remainingAllowances.data.GB + Member.currentGoodybag.remainingAllowances.reserve.GB) * 100) / 100;

    remainingMB = totalRemainingData * 1024;

    dataUsage = remainingMB <= 1024 ? `${remainingMB} MB left of ${totalData} GB` : `${totalUsedData} GB used of ${totalData} GB`;
  }

  let payg = `Credit: ${Member.creditString}`;

  let nextGoodybagText = hasQueuedGoodybag && `Queued: ${Member.nextGoodybag.descriptionWithDataCompressed}`;

  // console.log('TEST ' + Member.credit);

  if (hasActiveGoodybag) {
    const presenceObj = {
      state: dataUsage,
      details: 'Unltd mins and texts',
      largeImageKey: Member.currentGoodybag.imageKey,
      smallImageKey: Member.creditPounds < 1 && hasQueuedGoodybag ? Member.nextGoodybag.imageKey : Assets.imageKeys.payg_icon,
      largeImageText: `${Member.currentGoodybag.priceStringShort} goodybag${Member.currentGoodybag.reservetank ? ' with 1 GB extra' : ''}`,
      smallImageText: Member.creditPounds < 1 && hasQueuedGoodybag ? nextGoodybagText : payg,
      instance: true,
    };

    DebugLog(JSON.stringify(presenceObj, ' ', 2));
    client.updatePresence(presenceObj);
  } else {
    const presenceObj = {
      state: payg,
      details: 'No goodybag',
      largeImageKey: Assets.imageKeys.payg_icon,
      smallImageKey: Assets.imageKeys.logo_square,
      largeImageText: 'No active goodybag - just credit',
      smallImageText: 'giffgaff, the mobile network run by you',
      instance: true,
    };

    DebugLog(JSON.stringify(presenceObj, ' ', 2));
    client.updatePresence(presenceObj);
  }
}
